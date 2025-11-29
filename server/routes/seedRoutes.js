const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../seedData');

// Force reseed endpoint - clears all data and reseeds
// GET /api/seed/reset?secret=exam_seed_secret_2024
router.get('/reset', async (req, res) => {
  try {
    // Simple secret protection
    const { secret } = req.query;
    if (secret !== 'exam_seed_secret_2024') {
      return res.status(401).json({
        success: false,
        message: 'Invalid secret. Use ?secret=exam_seed_secret_2024'
      });
    }

    console.log('[Seed Route] Force reseed requested...');
    const result = await seedDatabase(true); // force = true

    res.json({
      success: true,
      message: 'Database reset and seeded successfully!',
      data: result.data,
      credentials: {
        admin: { email: 'admin@test.com', password: 'password123' },
        instructor: { email: 'instructor@test.com', password: 'password123' },
        student: { email: 'aakash@gmail.com', password: 'password123' }
      }
    });
  } catch (error) {
    console.error('[Seed Route] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Status endpoint - check current data counts
router.get('/status', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    const counts = {
      users: await db.collection('users').countDocuments(),
      questions: await db.collection('questions').countDocuments(),
      exams: await db.collection('exams').countDocuments(),
      attempts: await db.collection('attempts').countDocuments()
    };

    res.json({
      success: true,
      message: 'Database status',
      data: counts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
