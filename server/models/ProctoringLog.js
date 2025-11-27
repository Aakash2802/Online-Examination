const mongoose = require('mongoose');

const proctoringLogSchema = new mongoose.Schema({
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attempt',
    required: true,
    index: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: [
      'face_not_visible',
      'multiple_faces',
      'looking_away',
      'head_turned',
      'audio_detected',
      'tab_switch',
      'visibility_change',
      'copy_paste',
      'screenshot_attempt'
    ],
    required: true
  },
  eventData: {
    message: String,
    details: mongoose.Schema.Types.Mixed,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceFingerprint: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
proctoringLogSchema.index({ attemptId: 1, timestamp: -1 });
proctoringLogSchema.index({ userId: 1, timestamp: -1 });
proctoringLogSchema.index({ examId: 1, timestamp: -1 });
proctoringLogSchema.index({ eventType: 1, timestamp: -1 });

module.exports = mongoose.model('ProctoringLog', proctoringLogSchema);
