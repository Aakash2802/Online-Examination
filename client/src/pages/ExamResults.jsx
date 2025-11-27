import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [exam, setExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    highestScore: 0,
    lowestScore: 0
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch exam details
        const examRes = await api.get(`/exams/${examId}`);
        setExam(examRes.data.data);

        // Fetch all attempts for this exam
        const attemptsRes = await api.get(`/attempts?examId=${examId}`);
        const attemptsData = attemptsRes.data.data || [];
        setAttempts(attemptsData);

        // Calculate statistics
        if (attemptsData.length > 0) {
          const scores = attemptsData.map(a => a.percentageScore || a.score || 0);
          const passedCount = attemptsData.filter(a => (a.percentageScore || a.score || 0) >= examRes.data.data.passingScore).length;

          setStats({
            totalAttempts: attemptsData.length,
            averageScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
            passRate: ((passedCount / attemptsData.length) * 100).toFixed(1),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores)
          });
        }
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 animate-fadeIn">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b-4 border-gradient-to-r from-purple-600 to-indigo-600 animate-fadeInDown">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/instructor')}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Exam Results
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 rounded-xl border border-purple-200">
                <span className="text-gray-700 font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium ripple animate-gradient"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Exam Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-fadeInUp hover-lift">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-gradient">{exam?.title}</h2>
          <p className="text-gray-600 mb-4">{exam?.description}</p>
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
              {exam?.totalDuration} minutes
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
              Passing Score: {exam?.passingScore}%
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 animate-fadeInUp hover-lift stagger-item">
            <p className="text-gray-600 text-sm mb-1">Total Attempts</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalAttempts}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 animate-fadeInUp hover-lift stagger-item">
            <p className="text-gray-600 text-sm mb-1">Average Score</p>
            <p className="text-3xl font-bold text-green-600">{stats.averageScore}%</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 animate-fadeInUp hover-lift stagger-item">
            <p className="text-gray-600 text-sm mb-1">Pass Rate</p>
            <p className="text-3xl font-bold text-purple-600">{stats.passRate}%</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500 animate-fadeInUp hover-lift stagger-item">
            <p className="text-gray-600 text-sm mb-1">Highest Score</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.highestScore}%</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 animate-fadeInUp hover-lift stagger-item">
            <p className="text-gray-600 text-sm mb-1">Lowest Score</p>
            <p className="text-3xl font-bold text-orange-600">{stats.lowestScore}%</p>
          </div>
        </div>

        {/* Attempts Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeInUp delay-300">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-gradient">Student Attempts</h3>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">No attempts yet for this exam</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Time Taken</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attempts.map((attempt) => (
                    <tr key={attempt._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attempt.userId?.firstName} {attempt.userId?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attempt.userId?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{(attempt.percentageScore || attempt.score || 0).toFixed(1)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (attempt.percentageScore || attempt.score || 0) >= exam?.passingScore
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(attempt.percentageScore || attempt.score || 0) >= exam?.passingScore ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attempt.timeSpentSeconds ? `${Math.floor(attempt.timeSpentSeconds / 60)} min` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'In Progress'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
