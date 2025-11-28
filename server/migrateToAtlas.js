/**
 * Migration Script - Copy data from local MongoDB to Atlas
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const User = require('./models/User');
const Question = require('./models/Question');
const Exam = require('./models/Exam');

const ATLAS_URI = process.env.MONGO_URI;

async function migrate() {
  try {
    console.log('🚀 Starting migration to Atlas...\n');

    // Connect to Atlas
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Read backup files
    const examsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../backup_exams.json'), 'utf8'));
    const questionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../backup_questions.json'), 'utf8'));
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../backup_users.json'), 'utf8'));

    console.log(`📊 Found: ${examsData.length} exams, ${questionsData.length} questions, ${usersData.length} users\n`);

    // Clear existing seed data from Atlas
    console.log('🗑️  Clearing seed data from Atlas...');
    await Exam.deleteMany({});
    await Question.deleteMany({});
    // Keep test users, just delete seeded ones
    await User.deleteMany({ email: { $in: ['admin@test.com', 'student@test.com', 'instructor@test.com', 'alice@test.com'] } });
    console.log('✅ Cleared seed data\n');

    // Import users (skip duplicates)
    console.log('👥 Importing users...');
    for (const user of usersData) {
      try {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          // Create user without password hashing (it's already hashed)
          await User.collection.insertOne(user);
          console.log(`  ✅ Imported: ${user.email}`);
        } else {
          console.log(`  ⏭️  Skipped (exists): ${user.email}`);
        }
      } catch (err) {
        console.log(`  ❌ Error importing ${user.email}: ${err.message}`);
      }
    }

    // Import questions
    console.log('\n📝 Importing questions...');
    if (questionsData.length > 0) {
      await Question.collection.insertMany(questionsData);
      console.log(`  ✅ Imported ${questionsData.length} questions`);
    }

    // Import exams
    console.log('\n📚 Importing exams...');
    if (examsData.length > 0) {
      await Exam.collection.insertMany(examsData);
      console.log(`  ✅ Imported ${examsData.length} exams`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📌 Your old data is now in MongoDB Atlas!');

  } catch (error) {
    console.error('❌ Migration Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  }
}

migrate();
