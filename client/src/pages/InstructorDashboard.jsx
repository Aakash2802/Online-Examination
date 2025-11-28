import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    totalAttempts: 0,
    avgScore: 0
  });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  const fetchData = async () => {
    try {
      // Fetch all exams
      const examsRes = await api.get('/exams');
      const examsData = examsRes.data.data;
      setExams(examsData);

      // For now, we'll just show exam count
      // In future, we can add API endpoints to fetch all attempts for instructors
      setStats({
        totalExams: examsData.length,
        totalStudents: 0, // TODO: Add API endpoint
        totalAttempts: 0, // TODO: Add API endpoint
        avgScore: 0 // TODO: Add API endpoint
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (examId) => {
    try {
      await api.patch(`/exams/${examId}`, { status: 'published' });
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve exam:', error);
      alert('Failed to approve exam');
    }
  };

  const handleDeny = async (examId) => {
    try {
      await api.patch(`/exams/${examId}`, { status: 'draft' });
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to deny exam:', error);
      alert('Failed to deny exam');
    }
  };

  const handleDelete = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await api.delete(`/exams/${examId}`);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete exam:', error);
      alert('Failed to delete exam');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 animate-fadeIn">
        <div className="text-center animate-scaleIn">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="mt-4 text-xl font-semibold text-gradient">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 animate-fadeIn">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b-4 border-gradient-to-r from-purple-600 to-indigo-600 animate-fadeInDown">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Instructor Dashboard'}
              </h1>
            </div>
            <div className="flex items-center flex-wrap gap-2 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center bg-gradient-to-r from-purple-50 to-indigo-50 px-2 sm:px-4 py-2 rounded-xl border border-purple-200">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-700 font-medium text-xs sm:text-base truncate max-w-[80px] sm:max-w-none">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-600 text-white text-[10px] sm:text-xs rounded-full">
                  {user?.role?.toUpperCase()}
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
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 stagger-item hover:shadow-2xl transition-all duration-300 hover-lift group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1 font-medium">Total Exams</p>
                <p className="text-3xl font-bold text-gradient">{stats.totalExams}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center animate-float shadow-lg group-hover:animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 stagger-item hover:shadow-2xl transition-all duration-300 hover-lift group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center animate-float shadow-lg group-hover:animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 stagger-item hover:shadow-2xl transition-all duration-300 hover-lift group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1 font-medium">Total Attempts</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalAttempts}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center animate-float shadow-lg group-hover:animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 stagger-item hover:shadow-2xl transition-all duration-300 hover-lift group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1 font-medium">Avg Score</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.avgScore}%</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-float shadow-lg group-hover:animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-10 animate-fadeInUp delay-400">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-gradient">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div
              onClick={() => navigate('/create-exam')}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100 stagger-item hover-lift ripple"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Create New Exam</h3>
                  <p className="text-sm text-gray-500">Design and publish a new exam</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/all-attempts')}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100 stagger-item hover-lift ripple"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">View All Attempts</h3>
                  <p className="text-sm text-gray-500">Review student submissions</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => alert('Analytics feature coming soon!')}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100 opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Analytics</h3>
                  <p className="text-sm text-gray-500">View performance metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className="mb-6 sm:mb-10 animate-fadeInUp delay-500">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-gradient">All Exams</h2>

          {exams.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-xl text-center animate-scaleIn">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4 animate-float">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Exams Created</h3>
              <p className="text-gray-500 mb-4">Create your first exam to get started.</p>
              <button
                onClick={() => navigate('/create-exam')}
                className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium ripple animate-gradient"
              >
                Create New Exam
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="block sm:hidden text-xs text-gray-500 px-4 py-2 bg-blue-50 border-b border-blue-200">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Scroll right to see more
                </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Exam Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Max Attempts
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Passing Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 stagger-item group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{exam.title}</div>
                        <div className="text-sm text-gray-500">{exam.description?.substring(0, 60)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exam.totalDuration} min</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                          exam.status === 'published'
                            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                            : exam.status === 'draft'
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                            : exam.status === 'pending'
                            ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {exam.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {exam.maxAttempts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gradient">
                        {exam.passingScore}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {exam.status === 'pending' && user?.role === 'admin' ? (
                          <>
                            <button
                              onClick={() => handleApprove(exam._id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-sm ripple"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeny(exam._id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-sm ripple"
                            >
                              Deny
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate('/create-exam', { state: { exam } })}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-sm ripple"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => navigate(`/exams/${exam._id}/results`)}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-sm ripple"
                            >
                              Results
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(exam._id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transition-all transform hover:scale-105 shadow-sm ripple"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
