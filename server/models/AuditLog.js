const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: {
    type: String,
    enum: [
      'attempt_started', 'attempt_submitted', 'attempt_force_submitted',
      'tab_switch', 'visibility_change', 'fullscreen_exit', 'copy_paste',
      'answer_saved', 'proctor_alert', 'device_change', 'ip_change',
      'voice_detected', 'multiple_faces_detected', 'no_face_detected',
      'audio_detected', 'face_not_visible', 'eyes_looking_away', 'head_turned'
    ],
    required: true
  },
  eventData: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, required: true },
  ipAddress: String,
  userAgent: String
});

auditLogSchema.index({ attemptId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, eventType: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
