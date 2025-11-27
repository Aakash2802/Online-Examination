const express = require('express');
const router = express.Router();
const ProctoringLog = require('../models/ProctoringLog');
const Attempt = require('../models/Attempt');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * GET /api/proctoring/attempts/:attemptId/logs
 * Get all proctoring logs for a specific attempt
 * Access: Instructor, Admin (and student for their own attempt)
 */
router.get('/attempts/:attemptId/logs', authenticate, async (req, res) => {
  try {
    const { attemptId } = req.params;

    // Verify access
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Check permissions
    const isOwner = attempt.userId.toString() === req.user._id.toString();
    const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

    if (!isOwner && !isInstructorOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const logs = await ProctoringLog.find({ attemptId })
      .sort({ timestamp: 1 })
      .lean();

    // Group logs by event type for summary
    const summary = logs.reduce((acc, log) => {
      acc[log.eventType] = (acc[log.eventType] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        logs,
        summary,
        totalEvents: logs.length
      }
    });
  } catch (error) {
    console.error('Error fetching proctoring logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proctoring logs',
      error: error.message
    });
  }
});

/**
 * GET /api/proctoring/exams/:examId/logs
 * Get all proctoring logs for all attempts of an exam
 * Access: Instructor, Admin
 */
router.get('/exams/:examId/logs', authenticate, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { examId } = req.params;
    const { eventType, severity, startDate, endDate } = req.query;

    const filter = { examId };

    if (eventType) {
      filter.eventType = eventType;
    }

    if (severity) {
      filter['eventData.severity'] = severity;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await ProctoringLog.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('attemptId', 'attemptNumber score')
      .sort({ timestamp: -1 })
      .lean();

    // Summary statistics
    const summary = {
      totalViolations: logs.length,
      byEventType: {},
      bySeverity: {},
      byStudent: {}
    };

    logs.forEach(log => {
      // By event type
      summary.byEventType[log.eventType] = (summary.byEventType[log.eventType] || 0) + 1;

      // By severity
      const sev = log.eventData?.severity || 'unknown';
      summary.bySeverity[sev] = (summary.bySeverity[sev] || 0) + 1;

      // By student
      const studentId = log.userId._id.toString();
      if (!summary.byStudent[studentId]) {
        summary.byStudent[studentId] = {
          name: `${log.userId.firstName} ${log.userId.lastName}`,
          email: log.userId.email,
          count: 0
        };
      }
      summary.byStudent[studentId].count++;
    });

    res.json({
      success: true,
      data: {
        logs,
        summary
      }
    });
  } catch (error) {
    console.error('Error fetching exam proctoring logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proctoring logs',
      error: error.message
    });
  }
});

/**
 * GET /api/proctoring/attempts/:attemptId/timeline
 * Get proctoring event timeline for visualization
 * Access: Instructor, Admin
 */
router.get('/attempts/:attemptId/timeline', authenticate, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await Attempt.findById(attemptId).populate('userId', 'firstName lastName email');
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    const logs = await ProctoringLog.find({ attemptId })
      .sort({ timestamp: 1 })
      .lean();

    // Create timeline with events
    const timeline = logs.map(log => ({
      timestamp: log.timestamp,
      eventType: log.eventType,
      message: log.eventData?.message || log.eventType,
      severity: log.eventData?.severity || 'medium',
      details: log.eventData?.details
    }));

    res.json({
      success: true,
      data: {
        attempt: {
          id: attempt._id,
          student: {
            name: `${attempt.userId.firstName} ${attempt.userId.lastName}`,
            email: attempt.userId.email
          },
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          status: attempt.status
        },
        timeline,
        statistics: {
          totalEvents: logs.length,
          criticalEvents: logs.filter(l => l.eventData?.severity === 'critical').length,
          highSeverity: logs.filter(l => l.eventData?.severity === 'high').length,
          mediumSeverity: logs.filter(l => l.eventData?.severity === 'medium').length,
          lowSeverity: logs.filter(l => l.eventData?.severity === 'low').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching proctoring timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proctoring timeline',
      error: error.message
    });
  }
});

module.exports = router;
