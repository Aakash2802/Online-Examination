const mongoose = require('mongoose');
const Attempt = require('./models/Attempt');
const Exam = require('./models/Exam');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Delete all attempts
    const result = await Attempt.deleteMany({});
    console.log('Deleted', result.deletedCount, 'attempts');

    // Disable proctoring for ALL exams
    const examResult = await Exam.updateMany(
      {},
      { $set: { 'settings.proctorEnabled': false } }
    );
    console.log('Updated', examResult.modifiedCount, 'exams - proctoring disabled');

    // Show current exam settings
    const exams = await Exam.find({}).select('title settings.proctorEnabled');
    console.log('\nCurrent exam settings:');
    exams.forEach(exam => {
      console.log(`- ${exam.title}: proctorEnabled = ${exam.settings.proctorEnabled}`);
    });

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
