const attemptService = require('../services/attemptService');
const { catchAsync } = require('../utils/helpers');

exports.startAttempt = catchAsync(async (req, res) => {
  const { examId, otp } = req.body;
  const userId = req.user._id;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const attempt = await attemptService.startAttempt({ examId, userId, otp, ipAddress, userAgent });

  res.status(201).json({
    success: true,
    data: {
      attemptId: attempt._id,
      examId: attempt.examId,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      exam: attempt.exam,
      socketRoom: `attempt_${attempt._id}`
    }
  });
});

exports.saveAnswer = catchAsync(async (req, res) => {
  const { attemptId } = req.params;
  const { questionId, answerData, timestamp } = req.body;
  const userId = req.user._id;

  await attemptService.saveAnswer({ attemptId, userId, questionId, answerData, timestamp });

  res.status(200).json({
    success: true,
    message: 'Answer saved',
    data: { attemptId, savedAt: new Date().toISOString() }
  });
});

exports.submitAttempt = catchAsync(async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user._id;
  const { timestamp } = req.body;

  const result = await attemptService.submitAttempt({ attemptId, userId, timestamp });

  res.status(200).json({
    success: true,
    data: result
  });
});

exports.getAttempt = catchAsync(async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const attempt = await attemptService.getAttempt({ attemptId, userId, userRole });

  res.status(200).json({
    success: true,
    data: attempt
  });
});

exports.getAllAttempts = catchAsync(async (req, res) => {
  const { examId } = req.query;
  const Attempt = require('../models/Attempt');

  let filter = {};
  if (examId) {
    filter.examId = examId;
  }

  const attempts = await Attempt.find(filter)
    .populate('userId', 'firstName lastName email')
    .populate('examId', 'title description passingScore')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: attempts
  });
});

exports.getMyAttempts = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const Attempt = require('../models/Attempt');

  const attempts = await Attempt.find({ userId })
    .populate('examId', 'title description')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: attempts
  });
});

exports.gradeAnswer = catchAsync(async (req, res) => {
  const { attemptId } = req.params;
  const { questionId, pointsAwarded, feedback } = req.body;
  const graderId = req.user._id;

  const result = await attemptService.gradeAnswer({ attemptId, questionId, pointsAwarded, feedback, graderId });

  res.status(200).json({
    success: true,
    data: result
  });
});
