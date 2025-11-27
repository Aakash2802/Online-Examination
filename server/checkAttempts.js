const mongoose = require('mongoose');
const Attempt = require('./models/Attempt');
const Exam = require('./models/Exam');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const attempts = await Attempt.find({}).populate('examId', 'title').populate('userId', 'email firstName lastName');
    console.log('\nTotal attempts:', attempts.length);

    if (attempts.length === 0) {
      console.log('No attempts found in database!');
    } else {
      console.log('\nAttempts:');
      attempts.forEach(att => {
        console.log(`- User: ${att.userId.email}, Exam: ${att.examId.title}, Status: ${att.status}, Score: ${att.scorePercentage}%`);
      });
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
