/**
 * Fix String dates to proper Date objects
 */

require('dotenv').config();
const mongoose = require('mongoose');

const ATLAS_URI = process.env.MONGO_URI;

async function fixDates() {
  try {
    console.log('🔧 Fixing String dates to Date objects...\n');

    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;

    // Fix Exams dates
    console.log('📚 Fixing Exam dates...');
    const exams = await db.collection('exams').find({}).toArray();

    for (const exam of exams) {
      const updates = {};

      // Fix startWindow
      if (exam.startWindow && typeof exam.startWindow === 'string') {
        updates.startWindow = new Date(exam.startWindow);
      }

      // Fix endWindow
      if (exam.endWindow && typeof exam.endWindow === 'string') {
        updates.endWindow = new Date(exam.endWindow);
      }

      // Fix createdAt
      if (exam.createdAt && typeof exam.createdAt === 'string') {
        updates.createdAt = new Date(exam.createdAt);
      }

      // Fix updatedAt
      if (exam.updatedAt && typeof exam.updatedAt === 'string') {
        updates.updatedAt = new Date(exam.updatedAt);
      }

      // Fix sections.questions - convert string IDs to ObjectIds
      if (exam.sections && Array.isArray(exam.sections)) {
        const fixedSections = exam.sections.map(section => {
          return {
            ...section,
            _id: typeof section._id === 'string' ? new mongoose.Types.ObjectId(section._id) : section._id,
            questions: section.questions.map(qId => {
              return typeof qId === 'string' ? new mongoose.Types.ObjectId(qId) : qId;
            })
          };
        });
        updates.sections = fixedSections;
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('exams').updateOne(
          { _id: exam._id },
          { $set: updates }
        );
        console.log(`  ✅ Fixed: ${exam.title}`);
      }
    }

    // Fix Users dates
    console.log('\n👥 Fixing User dates...');
    const users = await db.collection('users').find({}).toArray();
    for (const user of users) {
      const updates = {};

      if (user.createdAt && typeof user.createdAt === 'string') {
        updates.createdAt = new Date(user.createdAt);
      }
      if (user.updatedAt && typeof user.updatedAt === 'string') {
        updates.updatedAt = new Date(user.updatedAt);
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: updates }
        );
        console.log(`  ✅ Fixed: ${user.email}`);
      }
    }

    // Fix Questions dates
    console.log('\n📝 Fixing Question dates...');
    const questions = await db.collection('questions').find({}).toArray();
    let qCount = 0;
    for (const q of questions) {
      const updates = {};

      if (q.createdAt && typeof q.createdAt === 'string') {
        updates.createdAt = new Date(q.createdAt);
      }
      if (q.updatedAt && typeof q.updatedAt === 'string') {
        updates.updatedAt = new Date(q.updatedAt);
      }

      // Fix createdBy if string
      if (q.createdBy && typeof q.createdBy === 'string') {
        updates.createdBy = new mongoose.Types.ObjectId(q.createdBy);
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('questions').updateOne(
          { _id: q._id },
          { $set: updates }
        );
        qCount++;
      }
    }
    console.log(`  ✅ Fixed ${qCount} questions`);

    console.log('\n🎉 All dates fixed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Done!');
  }
}

fixDates();
