const Attempt = require('../models/Attempt');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const AuditLog = require('../models/AuditLog');
const { AppError } = require('../utils/helpers');

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

exports.startAttempt = async ({ examId, userId, otp, ipAddress, userAgent }) => {
  const exam = await Exam.findById(examId).populate('sections.questions');
  if (!exam || exam.status !== 'published') {
    throw new AppError('Exam not available', 404);
  }

  const now = new Date();
  if (now < exam.startWindow || now > exam.endWindow) {
    throw new AppError('Exam is not active', 403);
  }

  const attemptCount = await Attempt.countDocuments({ examId, userId });
  if (attemptCount >= exam.maxAttempts) {
    throw new AppError('Max attempts reached', 403);
  }

  const attempt = await Attempt.create({
    examId,
    userId,
    attemptNumber: attemptCount + 1,
    status: 'in_progress',
    startedAt: now,
    ipAddress,
    userAgent
  });

  await AuditLog.create({
    attemptId: attempt._id,
    userId,
    eventType: 'attempt_started',
    eventData: { examId },
    ipAddress,
    userAgent
  });

  await attempt.populate('examId');

  // Apply shuffling if enabled
  if (exam.settings?.shuffleQuestions) {
    // Shuffle questions within each section
    exam.sections = exam.sections.map(section => ({
      ...section.toObject(),
      questions: shuffleArray(section.questions)
    }));
  }

  if (exam.settings?.shuffleOptions) {
    // Shuffle options for MCQ questions
    exam.sections = exam.sections.map(section => ({
      ...section,
      questions: section.questions.map(question => {
        if ((question.type === 'mcq_single' || question.type === 'mcq_multiple') && question.options) {
          return {
            ...question.toObject(),
            options: shuffleArray(question.options)
          };
        }
        return question;
      })
    }));
  }

  attempt.exam = exam;

  return attempt;
};

exports.saveAnswer = async ({ attemptId, userId, questionId, answerData, timestamp }) => {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt || attempt.userId.toString() !== userId.toString()) {
    throw new AppError('Attempt not found', 404);
  }
  if (attempt.status !== 'in_progress') {
    throw new AppError('Attempt is not active', 403);
  }

  const existingAnswerIdx = attempt.answers.findIndex((a) => a.questionId.toString() === questionId);
  if (existingAnswerIdx >= 0) {
    attempt.answers[existingAnswerIdx].answerData = answerData;
  } else {
    attempt.answers.push({ questionId, answerData });
  }

  attempt.updatedAt = new Date();
  await attempt.save();

  await AuditLog.create({
    attemptId,
    userId,
    eventType: 'answer_saved',
    eventData: { questionId, timestamp },
    timestamp: new Date()
  });

  return attempt;
};

exports.submitAttempt = async ({ attemptId, userId, timestamp }) => {
  const attempt = await Attempt.findById(attemptId).populate('examId');
  if (!attempt || attempt.userId.toString() !== userId.toString()) {
    throw new AppError('Attempt not found', 404);
  }
  if (attempt.status !== 'in_progress') {
    throw new AppError('Attempt already submitted', 403);
  }

  attempt.status = 'submitted';
  attempt.submittedAt = new Date(timestamp);
  attempt.timeSpentSeconds = Math.floor((attempt.submittedAt - attempt.startedAt) / 1000);

  const exam = await Exam.findById(attempt.examId).populate('sections.questions');
  let totalScore = 0;
  let maxScore = 0;

  for (const section of exam.sections) {
    for (const question of section.questions) {
      maxScore += question.points;
      const answer = attempt.answers.find((a) => a.questionId.toString() === question._id.toString());
      if (!answer) continue;

      if (question.type === 'mcq_single') {
        const isCorrect = answer.answerData === question.correctAnswers[0];
        answer.isCorrect = isCorrect;
        answer.pointsAwarded = isCorrect ? question.points : -question.negativeMarking;
        totalScore += answer.pointsAwarded;
      } else if (question.type === 'mcq_multiple') {
        const isCorrect = JSON.stringify(answer.answerData.sort()) === JSON.stringify(question.correctAnswers.sort());
        answer.isCorrect = isCorrect;
        answer.pointsAwarded = isCorrect ? question.points : -question.negativeMarking;
        totalScore += answer.pointsAwarded;
      } else if (question.type === 'short_text') {
        // Case-insensitive and trimmed comparison for short text answers
        const userAnswer = (answer.answerData || '').toString().trim().toLowerCase();
        const correctAnswer = (question.correctAnswers[0] || '').toString().trim().toLowerCase();
        const isCorrect = userAnswer === correctAnswer;
        answer.isCorrect = isCorrect;
        answer.pointsAwarded = isCorrect ? question.points : 0;
        totalScore += answer.pointsAwarded;
      } else if (question.type === 'long_text' || question.type === 'file_upload' || question.type === 'coding') {
        // These require manual grading
        answer.isCorrect = null;
        answer.pointsAwarded = 0;
      }
    }
  }

  attempt.score = totalScore;
  attempt.maxScore = maxScore;
  attempt.percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  attempt.status = 'graded';
  await attempt.save();

  await AuditLog.create({
    attemptId,
    userId,
    eventType: 'attempt_submitted',
    eventData: { score: totalScore, maxScore },
    timestamp: new Date()
  });

  return {
    attemptId: attempt._id,
    status: attempt.status,
    submittedAt: attempt.submittedAt,
    score: attempt.score,
    maxScore: attempt.maxScore,
    percentageScore: attempt.percentageScore,
    passed: attempt.percentageScore >= exam.passingScore
  };
};

exports.getAttempt = async ({ attemptId, userId, userRole }) => {
  const attempt = await Attempt.findById(attemptId)
    .populate('userId')
    .populate({
      path: 'examId',
      populate: {
        path: 'sections.questions'
      }
    });
  if (!attempt) throw new AppError('Attempt not found', 404);

  if (userRole === 'student' && attempt.userId._id.toString() !== userId.toString()) {
    throw new AppError('Forbidden', 403);
  }

  return attempt;
};

exports.gradeAnswer = async ({ attemptId, questionId, pointsAwarded, feedback, graderId }) => {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) throw new AppError('Attempt not found', 404);

  const answer = attempt.answers.find((a) => a.questionId.toString() === questionId);
  if (!answer) throw new AppError('Answer not found', 404);

  answer.pointsAwarded = pointsAwarded;
  answer.feedback = feedback;
  answer.gradedBy = graderId;
  answer.gradedAt = new Date();
  answer.isCorrect = pointsAwarded > 0;

  attempt.score = attempt.answers.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);
  attempt.percentageScore = attempt.maxScore > 0 ? Math.round((attempt.score / attempt.maxScore) * 100) : 0;
  await attempt.save();

  return { attemptId: attempt._id, score: attempt.score, maxScore: attempt.maxScore };
};
