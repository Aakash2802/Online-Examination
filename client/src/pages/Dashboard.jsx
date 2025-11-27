import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useCountUp } from '../hooks/useCountUp';

export default function Dashboard() {
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    passedExams: 0
  });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  // Animated counters
  const totalExamsCount = useCountUp(stats.totalExams, 1500);
  const completedExamsCount = useCountUp(stats.completedExams, 1500);
  const passedExamsCount = useCountUp(stats.passedExams, 1500);
  const avgScoreCount = useCountUp(parseFloat(stats.averageScore), 1500);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/attempts/my-attempts');
        const attemptsData = res.data.data;

        // Filter completed attempts only
        const completedAttempts = attemptsData.filter(
          att => att.status === 'submitted' || att.status === 'graded'
        );

        setAttempts(completedAttempts);

        // Calculate statistics
        const totalExams = new Set(completedAttempts.map(att => att.examId._id)).size;
        const avgScore = completedAttempts.length > 0
          ? completedAttempts.reduce((sum, att) => sum + (att.percentageScore || 0), 0) / completedAttempts.length
          : 0;
        const passedCount = completedAttempts.filter(
          att => (att.percentageScore || 0) >= (att.examId?.passingScore || 50)
        ).length;

        setStats({
          totalExams,
          completedExams: completedAttempts.length,
          averageScore: avgScore.toFixed(1),
          passedExams: passedCount
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 animate-fadeIn">
        <div className="text-center animate-scaleIn">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="mt-4 text-xl font-semibold text-gradient">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 animate-fadeIn">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-600 to-indigo-600 animate-fadeInDown">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                My Dashboard
              </h1>
            </div>
            <div className="flex items-center flex-wrap gap-2 sm:space-x-4 w-full sm:w-auto">
              <Link
                to="/exams"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 sm:px-5 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">All Exams</span>
                <span className="sm:hidden">Exams</span>
              </Link>
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-2 sm:px-4 py-2 rounded-xl border border-blue-200">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-700 font-medium text-xs sm:text-base truncate max-w-[100px] sm:max-w-none">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-5 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm sm:text-base ripple animate-gradient"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 stagger-item hover:shadow-2xl transition-all duration-300 hover-lift group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1 font-medium">Total Exams</p>
                <p className="text-3xl font-bold text-gradient">{totalExamsCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center animate-float shadow-lg group-hover:animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 stagger-item hover:shadow-2xl transition-all duration-300 hover-lift group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedExamsCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center animate-float shadow-lg group-hover:animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 stagger-item hover:shadow-2xl transition-all duration-300 hover-lift group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1 font-medium">Average Score</p>
                <p className="text-3xl font-bold text-yellow-600">{avgScoreCount.toFixed(1)}%</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-float shadow-lg group-hover:animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 stagger-item hover:shadow-2xl transition-all duration-300 hover-lift group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1 font-medium">Passed</p>
                <p className="text-3xl font-bold text-purple-600">{passedExamsCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center animate-float shadow-lg group-hover:animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Exam History */}
        <div className="mb-6 sm:mb-10 animate-fadeInUp delay-400">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-gradient">Exam History</h2>

          {attempts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-xl text-center animate-scaleIn">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4 animate-pulse">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Exam History</h3>
              <p className="text-gray-500 mb-4">You haven't completed any exams yet.</p>
              <Link
                to="/exams"
                className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium ripple animate-gradient"
              >
                Browse Available Exams
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden overflow-x-auto animate-fadeInUp delay-500">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Exam Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attempts.map((attempt, index) => {
                    const passed = (attempt.percentageScore || 0) >= (attempt.examId?.passingScore || 50);
                    return (
                      <tr key={attempt._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 stagger-item group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {attempt.examId?.title || 'Unknown Exam'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attempt.examId?.description?.substring(0, 50)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-800">
                            {attempt.score || 0} / {attempt.maxScore || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gradient">
                            {(attempt.percentageScore || 0).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                            passed
                              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                              : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                          }`}>
                            {passed ? '✓ PASSED' : '✗ FAILED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/attempts/${attempt._id}/results`}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md ripple"
                          >
                            View Details
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
