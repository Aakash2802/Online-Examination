const mongoose = require('mongoose');
const Attempt = require('./models/Attempt');
const Exam = require('./models/Exam');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const attempts = await Attempt.find({}).populate('examId', 'title').populate('userId', 'email');
    console.log('\nTotal attempts:', attempts.length);

    attempts.forEach(att => {
      console.log('\n--- Attempt Details ---');
      console.log('User:', att.userId.email);
      console.log('Exam:', att.examId.title);
      console.log('Status:', att.status);
      console.log('Score Percentage:', att.scorePercentage);
      console.log('Total Score:', att.totalScore);
      console.log('Max Score:', att.maxScore);
      console.log('Answers:', att.answers?.length || 0);
    });

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
