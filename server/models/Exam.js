const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructions: String,
  duration: { type: Number, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  order: { type: Number, default: 0 }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'pending', 'published', 'archived'], default: 'draft' },
  startWindow: { type: Date },
  endWindow: { type: Date },
  maxAttempts: { type: Number, default: 3 },
  totalDuration: { type: Number, required: true },
  passingScore: { type: Number, default: 50 },
  sections: [sectionSchema],
  settings: {
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showResults: { type: Boolean, default: true },
    allowReview: { type: Boolean, default: false },
    proctorEnabled: { type: Boolean, default: false },
    proctoring: {
      enabled: { type: Boolean, default: false },
      faceDetection: { type: Boolean, default: true },
      eyeTracking: { type: Boolean, default: true },
      headPoseDetection: { type: Boolean, default: true },
      audioDetection: { type: Boolean, default: true },
      multiplePersonDetection: { type: Boolean, default: true }
    },
    antiCheat: {
      tabSwitchLimit: { type: Number, default: 3 },
      fullscreenRequired: { type: Boolean, default: false },
      lockdownBrowser: { type: Boolean, default: false }
    },
    autoReset: {
      enabled: { type: Boolean, default: false },
      resetAfterHours: { type: Number, default: 24 }, // Reset after X hours from submission
      resetAttempts: { type: Boolean, default: true } // Whether to reset attempt count
    },
    attemptRollingWindow: {
      enabled: { type: Boolean, default: false },
      windowHours: { type: Number, default: 24 }, // Only count attempts from last X hours
      description: { type: String, default: 'Attempts reset on a rolling basis' }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

examSchema.index({ createdBy: 1 });
examSchema.index({ status: 1, startWindow: 1, endWindow: 1 });

module.exports = mongoose.model('Exam', examSchema);
