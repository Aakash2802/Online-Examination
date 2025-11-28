/**
 * Fix String IDs to ObjectIds
 */

require('dotenv').config();
const mongoose = require('mongoose');

const ATLAS_URI = process.env.MONGO_URI;

async function fixIds() {
  try {
    console.log('🔧 Fixing String IDs to ObjectIds...\n');

    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;

    // Fix Users
    console.log('👥 Fixing Users...');
    const users = await db.collection('users').find({}).toArray();
    for (const user of users) {
      if (typeof user._id === 'string') {
        const newId = new mongoose.Types.ObjectId(user._id);
        const { _id, ...userData } = user;
        await db.collection('users').deleteOne({ _id: user._id });
        await db.collection('users').insertOne({ _id: newId, ...userData });
        console.log(`  ✅ Fixed: ${user.email}`);
      }
    }

    // Fix Questions
    console.log('\n📝 Fixing Questions...');
    const questions = await db.collection('questions').find({}).toArray();
    let qCount = 0;
    for (const q of questions) {
      if (typeof q._id === 'string') {
        const newId = new mongoose.Types.ObjectId(q._id);
        const { _id, ...qData } = q;

        // Also fix createdBy if it's a string
        if (qData.createdBy && typeof qData.createdBy === 'string') {
          qData.createdBy = new mongoose.Types.ObjectId(qData.createdBy);
        }

        await db.collection('questions').deleteOne({ _id: q._id });
        await db.collection('questions').insertOne({ _id: newId, ...qData });
        qCount++;
      }
    }
    console.log(`  ✅ Fixed ${qCount} questions`);

    // Fix Exams
    console.log('\n📚 Fixing Exams...');
    const exams = await db.collection('exams').find({}).toArray();
    for (const exam of exams) {
      if (typeof exam._id === 'string') {
        const newId = new mongoose.Types.ObjectId(exam._id);
        const { _id, ...examData } = exam;

        // Fix createdBy
        if (examData.createdBy && typeof examData.createdBy === 'string') {
          examData.createdBy = new mongoose.Types.ObjectId(examData.createdBy);
        }

        // Fix questions array
        if (examData.questions && Array.isArray(examData.questions)) {
          examData.questions = examData.questions.map(qId => {
            if (typeof qId === 'string') {
              return new mongoose.Types.ObjectId(qId);
            }
            return qId;
          });
        }

        await db.collection('exams').deleteOne({ _id: exam._id });
        await db.collection('exams').insertOne({ _id: newId, ...examData });
        console.log(`  ✅ Fixed: ${exam.title}`);
      }
    }

    console.log('\n🎉 All IDs fixed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Done!');
  }
}

fixIds();
