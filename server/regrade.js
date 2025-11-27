const mongoose = require('mongoose');
const Attempt = require('./models/Attempt');
const Exam = require('./models/Exam');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/exam_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB - Re-grading attempt');

  const attemptId = '691ea2f3e7d29836e4692281';
  const attempt = await Attempt.findById(attemptId).populate('examId');
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
        const userAnswer = (answer.answerData || '').toString().trim().toLowerCase();
        const correctAnswer = (question.correctAnswers[0] || '').toString().trim().toLowerCase();
        const isCorrect = userAnswer === correctAnswer;
        answer.isCorrect = isCorrect;
        answer.pointsAwarded = isCorrect ? question.points : 0;
        totalScore += answer.pointsAwarded;
        console.log('Question:', question.prompt);
        console.log('User answer:', answer.answerData, '(normalized:', userAnswer + ')');
        console.log('Correct answer:', question.correctAnswers[0], '(normalized:', correctAnswer + ')');
        console.log('Is correct:', isCorrect, 'Points:', answer.pointsAwarded);
      }
    }
  }

  attempt.score = totalScore;
  attempt.maxScore = maxScore;
  attempt.percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  await attempt.save();

  console.log('\nRe-graded attempt!');
  console.log('Total Score:', totalScore, '/', maxScore);
  console.log('Percentage:', attempt.percentageScore + '%');

  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
