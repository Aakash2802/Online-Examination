const mongoose = require('mongoose');
const fs = require('fs');

// Try direct connection without SRV
const ATLAS_URI = 'mongodb://aakash:root@cluster0-shard-00-00.bqzxbvo.mongodb.net:27017,cluster0-shard-00-01.bqzxbvo.mongodb.net:27017,cluster0-shard-00-02.bqzxbvo.mongodb.net:27017/exam_system?ssl=true&replicaSet=atlas-yqy8a8-shard-0&authSource=admin&retryWrites=true&w=majority';

async function seedAtlas() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(ATLAS_URI);
  console.log('Connected!');

  // Read backup files
  const exams = JSON.parse(fs.readFileSync('../backup_exams.json'));
  const questions = JSON.parse(fs.readFileSync('../backup_questions.json'));
  const users = JSON.parse(fs.readFileSync('../backup_users.json'));

  // Clear existing data
  await mongoose.connection.db.collection('exams').deleteMany({});
  await mongoose.connection.db.collection('questions').deleteMany({});
  await mongoose.connection.db.collection('users').deleteMany({});
  await mongoose.connection.db.collection('attempts').deleteMany({});
  console.log('Cleared Atlas database');

  // Restore users with proper ObjectIds
  for (const user of users) {
    user._id = new mongoose.Types.ObjectId(user._id);
  }
  await mongoose.connection.db.collection('users').insertMany(users);
  console.log('Restored ' + users.length + ' users');

  // Restore exams with proper ObjectIds
  for (const exam of exams) {
    exam._id = new mongoose.Types.ObjectId(exam._id);
    exam.createdBy = new mongoose.Types.ObjectId(exam.createdBy);
    if (exam.sections) {
      exam.sections = exam.sections.map(s => ({
        ...s,
        _id: s._id ? new mongoose.Types.ObjectId(s._id) : new mongoose.Types.ObjectId(),
        questions: s.questions.map(q => typeof q === 'string' ? new mongoose.Types.ObjectId(q) : q)
      }));
    }
  }
  await mongoose.connection.db.collection('exams').insertMany(exams);
  console.log('Restored ' + exams.length + ' exams');

  // Restore questions with proper ObjectIds
  for (const q of questions) {
    q._id = new mongoose.Types.ObjectId(q._id);
    q.createdBy = new mongoose.Types.ObjectId(q.createdBy);
  }
  await mongoose.connection.db.collection('questions').insertMany(questions);
  console.log('Restored ' + questions.length + ' questions');

  // Create sample attempts
  const userId = users.find(u => u.email === 'aakash@gmail.com')._id;
  const now = new Date();

  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i];
    const hoursAgo = new Date(now - (i + 1) * 60 * 60 * 1000);
    const scores = [83, 90, 75, 88, 95];
    const score = scores[i % 5];
    const examQuestions = exam.sections[0].questions;

    await mongoose.connection.db.collection('attempts').insertOne({
      examId: exam._id,
      userId: userId,
      attemptNumber: 1,
      status: 'submitted',
      startedAt: hoursAgo,
      submittedAt: new Date(hoursAgo.getTime() + 25 * 60 * 1000),
      timeSpentSeconds: 1500,
      score: Math.round(score * 0.3),
      maxScore: 30,
      percentageScore: score,
      violations: { tabSwitches: 0, visibilityChanges: 0, fullscreenExits: 0, totalViolations: 0 },
      ipAddress: '::1',
      userAgent: 'Mozilla/5.0',
      answers: examQuestions.slice(0, 5).map((qId, j) => ({
        questionId: typeof qId === 'string' ? new mongoose.Types.ObjectId(qId) : qId,
        answerData: 'answer',
        pointsAwarded: j < 4 ? 6 : 0,
        isCorrect: j < 4
      })),
      createdAt: hoursAgo,
      updatedAt: new Date(hoursAgo.getTime() + 25 * 60 * 1000)
    });
    console.log('Created attempt for: ' + exam.title);
  }

  // Final verification
  console.log('');
  console.log('=== ATLAS DATABASE READY ===');
  console.log('Users: ' + await mongoose.connection.db.collection('users').countDocuments());
  console.log('Exams: ' + await mongoose.connection.db.collection('exams').countDocuments());
  console.log('Questions: ' + await mongoose.connection.db.collection('questions').countDocuments());
  console.log('Attempts: ' + await mongoose.connection.db.collection('attempts').countDocuments());

  await mongoose.disconnect();
  console.log('Done!');
}

seedAtlas().catch(console.error);
