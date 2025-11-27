const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

const testCaseSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
  isHidden: { type: Boolean, default: false },
  weight: { type: Number, default: 1 }
});

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq_single', 'mcq_multiple', 'short_text', 'long_text', 'file_upload', 'coding'],
    required: true
  },
  prompt: { type: String, required: true },
  points: { type: Number, required: true, default: 1 },
  negativeMarking: { type: Number, default: 0 },
  options: [optionSchema],
  correctAnswers: [String],
  fileUploadConfig: {
    maxSizeBytes: Number,
    allowedExtensions: [String]
  },
  codingConfig: {
    language: { type: String, enum: ['javascript', 'python', 'java', 'cpp', 'c'] },
    starterCode: String,
    testCases: [testCaseSchema],
    timeLimit: { type: Number, default: 5 },
    memoryLimit: { type: Number, default: 256 }
  },
  tags: [String],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

questionSchema.index({ createdBy: 1 });
questionSchema.index({ type: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', questionSchema);
