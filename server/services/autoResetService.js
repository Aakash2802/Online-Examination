const Attempt = require('../models/Attempt');
const Exam = require('../models/Exam');

/**
 * Auto-reset service for exam attempts
 * Automatically deletes old attempts based on exam auto-reset settings
 */

/**
 * Check and reset attempts that are eligible for auto-reset
 */
async function checkAndResetAttempts() {
  try {
    console.log('[Auto-Reset] Running auto-reset check...');

    // Find all exams with auto-reset enabled
    const examsWithAutoReset = await Exam.find({
      'settings.autoReset.enabled': true
    }).select('_id settings.autoReset');

    if (examsWithAutoReset.length === 0) {
      console.log('[Auto-Reset] No exams with auto-reset enabled');
      return;
    }

    let totalReset = 0;

    for (const exam of examsWithAutoReset) {
      const resetAfterMs = exam.settings.autoReset.resetAfterHours * 60 * 60 * 1000;
      const cutoffTime = new Date(Date.now() - resetAfterMs);

      // Find submitted attempts older than the cutoff time
      const oldAttempts = await Attempt.find({
        examId: exam._id,
        status: { $in: ['submitted', 'graded', 'force_submitted'] },
        submittedAt: { $lt: cutoffTime }
      });

      if (oldAttempts.length > 0) {
        // Delete old attempts to allow retake
        const result = await Attempt.deleteMany({
          examId: exam._id,
          status: { $in: ['submitted', 'graded', 'force_submitted'] },
          submittedAt: { $lt: cutoffTime }
        });

        totalReset += result.deletedCount;
        console.log(`[Auto-Reset] Reset ${result.deletedCount} attempts for exam ${exam._id}`);
      }
    }

    if (totalReset > 0) {
      console.log(`[Auto-Reset] Total attempts reset: ${totalReset}`);
    } else {
      console.log('[Auto-Reset] No attempts eligible for reset');
    }

  } catch (error) {
    console.error('[Auto-Reset] Error during auto-reset:', error);
  }
}

/**
 * Start the auto-reset scheduler
 * Runs every hour to check for eligible attempts
 */
function startAutoResetScheduler() {
  // Run immediately on start
  checkAndResetAttempts();

  // Then run every hour
  const intervalMs = 60 * 60 * 1000; // 1 hour
  setInterval(checkAndResetAttempts, intervalMs);

  console.log('[Auto-Reset] Scheduler started - checking every hour');
}

module.exports = {
  checkAndResetAttempts,
  startAutoResetScheduler
};
