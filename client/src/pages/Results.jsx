import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Confetti from '../components/Confetti';

export default function Results() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/attempts/${attemptId}`);
        setAttempt(res.data.data);

        // Show confetti if passed
        const passed = res.data.data.percentageScore >= (res.data.data.examId?.passingScore || 50);
        if (passed) {
          setShowConfetti(true);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Results not found</div>
      </div>
    );
  }

  const passed = attempt.percentageScore >= (attempt.examId?.passingScore || 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8 animate-fadeIn">
      {/* Confetti on pass */}
      {showConfetti && <Confetti duration={5000} pieces={150} />}

      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gradient animate-fadeInDown">Exam Results</h1>

        <div className="bg-white shadow-lg p-4 sm:p-6 rounded-2xl mb-4 sm:mb-6 animate-fadeInUp hover-lift">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="stagger-item">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-gradient">
                {attempt.score} / {attempt.maxScore}
              </p>
            </div>
            <div className="stagger-item">
              <p className="text-sm text-gray-600">Percentage</p>
              <p className="text-2xl font-bold text-gradient">{attempt.percentageScore}%</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${passed ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-400 to-red-500 text-white'} animate-scaleIn ${passed ? 'celebrate-bounce' : ''}`}>
            <p className="text-xl font-bold text-center">
              {passed ? '🎉 CONGRATULATIONS! YOU PASSED! 🎉' : '❌ FAILED - Keep trying!'}
            </p>
            {passed && (
              <p className="text-center text-sm mt-1 opacity-90">Great job! You've successfully completed this exam.</p>
            )}
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>Submitted: {new Date(attempt.submittedAt).toLocaleString()}</p>
            <p>Time Spent: {Math.floor(attempt.timeSpentSeconds / 60)} minutes</p>
            <p>Violations: {attempt.violations.totalViolations}</p>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gradient animate-fadeInUp delay-200">Answers</h2>
        <div className="space-y-4">
          {attempt.answers.map((ans, idx) => (
            <div key={idx} className="bg-white shadow-lg p-4 rounded-2xl stagger-item hover-lift">
              <p className="font-bold mb-2">Question {idx + 1}</p>
              <p className="text-gray-700 mb-2">Your Answer: {JSON.stringify(ans.answerData)}</p>
              <div className="flex items-center space-x-4">
                <span className={`font-bold ${ans.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {ans.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <span className="text-gray-600">Points: {ans.pointsAwarded}</span>
              </div>
              {ans.feedback && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Feedback:</strong> {ans.feedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <Link
          to="/exams"
          className="mt-6 inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg ripple animate-gradient"
        >
          Back to Exams
        </Link>
      </div>
    </div>
  );
}
