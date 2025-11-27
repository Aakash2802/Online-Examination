const jwt = require('jsonwebtoken');
const Attempt = require('../models/Attempt');
const AuditLog = require('../models/AuditLog');
const ProctoringLog = require('../models/ProctoringLog');

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token?.replace('Bearer ', '');
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.userId}`);

    socket.on('join_attempt', async ({ attemptId }) => {
      try {
        const attempt = await Attempt.findById(attemptId).populate('examId');
        if (!attempt || attempt.userId.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Forbidden' });
        }
        socket.join(`attempt_${attemptId}`);
        socket.attemptId = attemptId;

        const totalDuration = attempt.examId.totalDuration * 60;
        const elapsed = Math.floor((Date.now() - attempt.startedAt) / 1000);
        const timeRemaining = Math.max(0, totalDuration - elapsed);

        socket.timerInterval = setInterval(() => {
          const newElapsed = Math.floor((Date.now() - attempt.startedAt) / 1000);
          const newRemaining = Math.max(0, totalDuration - newElapsed);
          io.to(`attempt_${attemptId}`).emit('exam_timer_sync', {
            attemptId,
            timeRemainingSeconds: newRemaining,
            serverTime: new Date().toISOString()
          });

          if (newRemaining <= 0) {
            clearInterval(socket.timerInterval);
            io.to(`attempt_${attemptId}`).emit('force_submit', {
              attemptId,
              reason: 'timeout',
              timestamp: new Date().toISOString()
            });
          }
        }, 10000);

        socket.emit('exam_timer_sync', {
          attemptId,
          timeRemainingSeconds: timeRemaining,
          serverTime: new Date().toISOString()
        });
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Failed to join attempt' });
      }
    });

    socket.on('leave_attempt', ({ attemptId }) => {
      socket.leave(`attempt_${attemptId}`);
      if (socket.timerInterval) {
        clearInterval(socket.timerInterval);
      }
    });

    socket.on('autosave_request', async ({ attemptId, questionId, answerData, timestamp }) => {
      try {
        const attempt = await Attempt.findById(attemptId);
        if (!attempt || attempt.userId.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Forbidden' });
        }

        const existingAnswerIdx = attempt.answers.findIndex((a) => a.questionId.toString() === questionId);
        if (existingAnswerIdx >= 0) {
          attempt.answers[existingAnswerIdx].answerData = answerData;
        } else {
          attempt.answers.push({ questionId, answerData });
        }
        await attempt.save();

        socket.emit('autosave_ack', {
          attemptId,
          questionId,
          savedAt: new Date().toISOString(),
          success: true
        });
      } catch (err) {
        socket.emit('autosave_ack', { attemptId, questionId, success: false });
      }
    });

    socket.on('proctor_alert', async ({ attemptId, eventType, eventData, timestamp }) => {
      try {
        const attempt = await Attempt.findById(attemptId).populate('examId');
        if (!attempt || attempt.userId.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Forbidden' });
        }

        // Update violation counts in attempt
        if (eventType === 'tab_switch') {
          attempt.violations.tabSwitches += 1;
        } else if (eventType === 'visibility_change') {
          attempt.violations.visibilityChanges += 1;
        }
        attempt.violations.totalViolations += 1;
        await attempt.save();

        // Determine severity based on event type
        let severity = 'medium';
        if (eventType === 'multiple_faces' || eventType === 'audio_detected') {
          severity = 'high';
        } else if (eventType === 'head_turned' || eventType === 'looking_away') {
          severity = 'medium';
        } else if (eventType === 'face_not_visible') {
          severity = 'critical';
        }

        // Save to ProctoringLog for detailed tracking
        await ProctoringLog.create({
          attemptId,
          examId: attempt.examId._id,
          userId: socket.userId,
          eventType,
          eventData: {
            message: eventData?.message || eventType,
            details: eventData,
            severity
          },
          timestamp: new Date(timestamp),
          metadata: {
            userAgent: socket.handshake.headers['user-agent'],
            ipAddress: socket.handshake.address
          }
        });

        // Also save to AuditLog for backward compatibility
        await AuditLog.create({
          attemptId,
          userId: socket.userId,
          eventType,
          eventData,
          timestamp: new Date(timestamp)
        });

        const exam = attempt.examId;
        const limit = exam.settings?.antiCheat?.tabSwitchLimit || 10;
        if (attempt.violations.totalViolations >= limit) {
          socket.emit('proctor_enforcement', {
            attemptId,
            action: 'locked',
            message: `Exam locked due to ${attempt.violations.totalViolations} violations.`,
            violations: attempt.violations
          });
          io.to(`attempt_${attemptId}`).emit('force_submit', {
            attemptId,
            reason: 'violations_exceeded',
            timestamp: new Date().toISOString()
          });
        } else if (attempt.violations.totalViolations % 3 === 0) {
          // Send warning every 3 violations
          socket.emit('proctor_enforcement', {
            attemptId,
            action: 'warning',
            message: `Warning: ${attempt.violations.totalViolations} violations detected.`,
            violations: attempt.violations
          });
        }
      } catch (err) {
        console.error('Proctor alert error:', err);
      }
    });

    socket.on('proctor_screenshot', async ({ attemptId, screenshot, timestamp }) => {
      try {
        const attempt = await Attempt.findById(attemptId);
        if (!attempt || attempt.userId.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Forbidden' });
        }

        // Store screenshot URL in proctorData (in production, upload to cloud storage)
        // For now, we'll just log and store the count
        if (!attempt.proctorData) {
          attempt.proctorData = { screenshots: [] };
        }

        // In production, upload to S3/Cloud Storage and store URL
        // For now, store metadata only (to avoid storing large base64 in DB)
        attempt.proctorData.screenshots.push({
          timestamp: new Date(timestamp),
          size: screenshot.length
        });

        await attempt.save();

        console.log(`Screenshot captured for attempt ${attemptId} at ${timestamp}`);
      } catch (err) {
        console.error('Screenshot save error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.timerInterval) {
        clearInterval(socket.timerInterval);
      }
    });
  });
};
