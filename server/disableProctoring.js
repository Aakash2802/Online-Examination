const mongoose = require('mongoose');
const Exam = require('./models/Exam');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Disable proctoring for testing
    const result = await Exam.updateMany(
      {
        title: {
          $in: ['General Knowledge Quiz', 'Science & Technology Assessment']
        }
      },
      {
        $set: { 'settings.proctorEnabled': false }
      }
    );

    console.log(`Updated ${result.modifiedCount} exams`);

    // Show updated exams
    const exams = await Exam.find({}).select('title settings.proctorEnabled');
    console.log('\nExam proctoring status:');
    exams.forEach(exam => {
      console.log(`- ${exam.title}: proctorEnabled = ${exam.settings.proctorEnabled}`);
    });

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
