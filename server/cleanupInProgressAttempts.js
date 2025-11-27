const mongoose = require('mongoose');
const Attempt = require('./models/Attempt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Delete all in_progress attempts (but keep graded ones)
    const result = await Attempt.deleteMany({ status: 'in_progress' });
    console.log('Deleted', result.deletedCount, 'in_progress attempts');

    // Show remaining attempts
    const remaining = await Attempt.find({}).populate('examId', 'title').populate('userId', 'email');
    console.log('\nRemaining attempts:', remaining.length);
    remaining.forEach(att => {
      console.log(`- User: ${att.userId.email}, Exam: ${att.examId.title}, Status: ${att.status}, Score: ${att.scorePercentage}%`);
    });

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
