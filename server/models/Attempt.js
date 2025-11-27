const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answerData: mongoose.Schema.Types.Mixed,
  isCorrect: { type: Boolean },
  pointsAwarded: { type: Number, default: 0 },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date,
  feedback: String
});

const attemptSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attemptNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'force_submitted', 'graded', 'abandoned'],
    default: 'in_progress'
  },
  startedAt: { type: Date, required: true, default: Date.now },
  submittedAt: Date,
  timeSpentSeconds: { type: Number, default: 0 },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  maxScore: { type: Number },
  percentageScore: { type: Number },
  violations: {
    tabSwitches: { type: Number, default: 0 },
    visibilityChanges: { type: Number, default: 0 },
    fullscreenExits: { type: Number, default: 0 },
    totalViolations: { type: Number, default: 0 }
  },
  proctorData: {
    recordingUrl: String,
    screenshots: [{
      timestamp: Date,
      size: Number
    }],
    flaggedEvents: [{ timestamp: Date, reason: String }]
  },
  ipAddress: String,
  userAgent: String,
  deviceFingerprint: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { versionKey: false }); // Disable versioning to prevent VersionError conflicts

attemptSchema.index({ examId: 1, userId: 1, attemptNumber: 1 }, { unique: true });
attemptSchema.index({ userId: 1, status: 1 });
attemptSchema.index({ examId: 1, status: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
