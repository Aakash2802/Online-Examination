const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { catchAsync } = require('../utils/helpers');

// Get all exams (students see published only)
router.get('/', authenticate, catchAsync(async (req, res) => {
  const { available } = req.query;
  let filter = {};

  if (req.user.role === 'student') {
    filter.status = 'published';
    if (available === 'true') {
      const now = new Date();
      filter.$or = [
        // Exams within the time window
        { startWindow: { $lte: now }, endWindow: { $gte: now } },
        // Exams with no start window (always available from start)
        { startWindow: null, endWindow: { $gte: now } },
        // Exams with no end window (always available until end)
        { startWindow: { $lte: now }, endWindow: null },
        // Exams with no time restrictions (always available)
        { startWindow: null, endWindow: null }
      ];
    }
  }

  const exams = await Exam.find(filter).populate('createdBy', 'firstName lastName');
  res.status(200).json({ success: true, data: exams });
}));

// Get single exam
router.get('/:examId', authenticate, catchAsync(async (req, res) => {
  const exam = await Exam.findById(req.params.examId).populate('sections.questions');
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }
  res.status(200).json({ success: true, data: exam });
}));

// Create exam (admin/instructor only)
router.post('/', authenticate, authorizeRoles('admin', 'instructor'), catchAsync(async (req, res) => {
  const { questions, ...examData } = req.body;

  // Create questions first if provided
  let questionIds = [];
  if (questions && questions.length > 0) {
    const createdQuestions = await Question.insertMany(
      questions.map(q => {
        // Determine question type based on frontend format
        let questionType;
        if (q.type === 'multiple-choice') {
          questionType = q.multipleCorrect ? 'mcq_multiple' : 'mcq_single';
        } else if (q.type === 'true-false') {
          questionType = 'mcq_single';
        } else if (q.type === 'short-answer') {
          questionType = 'short_text';
        }

        // Transform options array to match backend schema
        let transformedOptions = [];
        if (q.type === 'true-false') {
          // For True/False questions, generate options automatically
          const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
          transformedOptions = [
            { text: 'True', isCorrect: correctAnswers.includes('True') },
            { text: 'False', isCorrect: correctAnswers.includes('False') }
          ];
        } else if (q.options && Array.isArray(q.options)) {
          const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
          transformedOptions = q.options
            .filter(opt => opt.trim() !== '')
            .map(opt => ({
              text: opt,
              isCorrect: correctAnswers.includes(opt)
            }));
        }

        return {
          type: questionType,
          prompt: q.questionText,
          points: q.points,
          negativeMarking: q.negativeMarking || 0,
          options: transformedOptions,
          correctAnswers: Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer],
          createdBy: req.user._id
        };
      })
    );
    questionIds = createdQuestions.map(q => q._id);
  }

  // Create exam with a default section containing all questions
  const examPayload = {
    ...examData,
    createdBy: req.user._id,
    sections: questionIds.length > 0 ? [{
      title: 'Main Section',
      instructions: 'Answer all questions',
      duration: examData.totalDuration,
      questions: questionIds,
      order: 0
    }] : []
  };

  const exam = await Exam.create(examPayload);
  const populatedExam = await Exam.findById(exam._id).populate('sections.questions');

  res.status(201).json({ success: true, data: populatedExam });
}));

// Update exam
router.patch('/:examId', authenticate, authorizeRoles('admin', 'instructor'), catchAsync(async (req, res) => {
  const { questions, ...examData } = req.body;

  // If questions are provided, update them
  if (questions && questions.length > 0) {
    // Get existing exam to find old questions
    const existingExam = await Exam.findById(req.params.examId);
    if (!existingExam || !existingExam.sections || existingExam.sections.length === 0) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const oldQuestionIds = existingExam.sections[0].questions;

    // Delete old questions
    await Question.deleteMany({ _id: { $in: oldQuestionIds } });

    // Create new questions with same transformation logic as POST
    const createdQuestions = await Question.insertMany(
      questions.map(q => {
        let questionType;
        if (q.type === 'multiple-choice') {
          questionType = q.multipleCorrect ? 'mcq_multiple' : 'mcq_single';
        } else if (q.type === 'true-false') {
          questionType = 'mcq_single';
        } else if (q.type === 'short-answer') {
          questionType = 'short_text';
        }

        let transformedOptions = [];
        if (q.type === 'true-false') {
          const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
          transformedOptions = [
            { text: 'True', isCorrect: correctAnswers.includes('True') },
            { text: 'False', isCorrect: correctAnswers.includes('False') }
          ];
        } else if (q.options && Array.isArray(q.options)) {
          const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
          transformedOptions = q.options
            .filter(opt => opt.trim() !== '')
            .map(opt => ({
              text: opt,
              isCorrect: correctAnswers.includes(opt)
            }));
        }

        return {
          type: questionType,
          prompt: q.questionText,
          points: q.points,
          negativeMarking: q.negativeMarking || 0,
          options: transformedOptions,
          correctAnswers: Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer],
          createdBy: req.user._id
        };
      })
    );

    const questionIds = createdQuestions.map(q => q._id);

    // Update exam with new question IDs
    examData.sections = [{
      title: 'Main Section',
      instructions: 'Answer all questions',
      duration: examData.totalDuration,
      questions: questionIds,
      order: 0
    }];
  }

  const exam = await Exam.findByIdAndUpdate(req.params.examId, examData, { new: true }).populate('sections.questions');
  res.status(200).json({ success: true, data: exam });
}));

// Delete exam
router.delete('/:examId', authenticate, authorizeRoles('admin', 'instructor'), catchAsync(async (req, res) => {
  const Attempt = require('../models/Attempt');

  // Get exam to find all questions
  const exam = await Exam.findById(req.params.examId);
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Delete all questions associated with this exam
  const questionIds = [];
  if (exam.sections && exam.sections.length > 0) {
    for (const section of exam.sections) {
      questionIds.push(...section.questions);
    }
  }

  if (questionIds.length > 0) {
    await Question.deleteMany({ _id: { $in: questionIds } });
  }

  // Delete all attempts for this exam
  await Attempt.deleteMany({ examId: req.params.examId });

  // Finally, delete the exam
  await Exam.findByIdAndDelete(req.params.examId);

  res.status(200).json({
    success: true,
    message: 'Exam, questions, and attempts deleted successfully'
  });
}));

module.exports = router;
