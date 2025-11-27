import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function AllAttempts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    loadAttempts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attempts, searchTerm, filterStatus, sortBy]);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attempts');
      setAttempts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load attempts:', error);
      alert('Failed to load attempts');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attempts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(attempt =>
        attempt.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.examId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(attempt => attempt.status === filterStatus);
    }

    // Sorting
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        filtered.sort((a, b) => (b.percentageScore || 0) - (a.percentageScore || 0));
        break;
      case 'lowest':
        filtered.sort((a, b) => (a.percentageScore || 0) - (b.percentageScore || 0));
        break;
      default:
        break;
    }

    setFilteredAttempts(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Submitted' },
      graded: { bg: 'bg-green-100', text: 'text-green-800', label: 'Graded' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const exportToCSV = () => {
    // Prepare CSV data
    const csvRows = [];

    // Header row
    csvRows.push([
      'Student Name',
      'Email',
      'Exam Title',
      'Attempt Number',
      'Status',
      'Score (%)',
      'Points',
      'Max Points',
      'Pass/Fail',
      'Time Spent (minutes)',
      'Started At',
      'Submitted At'
    ].join(','));

    // Data rows
    filteredAttempts.forEach(attempt => {
      const studentName = `${attempt.userId?.firstName || ''} ${attempt.userId?.lastName || ''}`.trim();
      const email = attempt.userId?.email || 'N/A';
      const examTitle = attempt.examId?.title || 'N/A';
      const attemptNumber = attempt.attemptNumber || 'N/A';
      const status = attempt.status || 'N/A';
      const percentageScore = attempt.percentageScore || 0;
      const score = attempt.score || 0;
      const maxScore = attempt.maxScore || 0;
      const passFail = percentageScore >= (attempt.examId?.passingScore || 50) ? 'Pass' : 'Fail';
      const timeSpent = attempt.timeSpentSeconds ? Math.floor(attempt.timeSpentSeconds / 60) : 'N/A';
      const startedAt = attempt.startedAt ? new Date(attempt.startedAt).toLocaleString() : 'N/A';
      const submittedAt = attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A';

      csvRows.push([
        `"${studentName}"`,
        `"${email}"`,
        `"${examTitle}"`,
        attemptNumber,
        status,
        percentageScore,
        score,
        maxScore,
        passFail,
        timeSpent,
        `"${startedAt}"`,
        `"${submittedAt}"`
      ].join(','));
    });

    // Create blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `exam_attempts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreBadge = (percentageScore, passingScore = 50) => {
    const passed = percentageScore >= passingScore;
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
        passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <span>{percentageScore}%</span>
        {passed ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading attempts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeInDown">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-purple-600 transition-smooth"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 text-gradient">All Attempts</h1>
              <p className="text-gray-600 mt-2">View and manage all exam attempts</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                disabled={filteredAttempts.length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transform transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ripple animate-gradient"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export CSV</span>
              </button>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{filteredAttempts.length}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fadeInUp hover-lift">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by student or exam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Score</option>
                <option value="lowest">Lowest Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attempts Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeInUp delay-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white animate-gradient">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Exam</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Time Spent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No attempts found
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((attempt) => (
                    <tr key={attempt._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {attempt.userId?.firstName} {attempt.userId?.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{attempt.userId?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{attempt.examId?.title || 'N/A'}</div>
                        <div className="text-sm text-gray-600">Attempt #{attempt.attemptNumber}</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(attempt.status)}</td>
                      <td className="px-6 py-4">
                        {attempt.status === 'graded' ? (
                          getScoreBadge(attempt.percentageScore || 0, attempt.examId?.passingScore)
                        ) : (
                          <span className="text-gray-400 text-sm">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {attempt.timeSpentSeconds
                            ? `${Math.floor(attempt.timeSpentSeconds / 60)}m ${attempt.timeSpentSeconds % 60}s`
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {new Date(attempt.startedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(attempt.startedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => navigate(`/attempt/${attempt._id}`)}
                            className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => navigate(`/proctoring/${attempt._id}`)}
                            className="flex items-center text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Proctoring
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">Total Attempts</div>
            <div className="text-3xl font-bold text-purple-600">{filteredAttempts.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">In Progress</div>
            <div className="text-3xl font-bold text-blue-600">
              {filteredAttempts.filter(a => a.status === 'in_progress').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">Graded</div>
            <div className="text-3xl font-bold text-green-600">
              {filteredAttempts.filter(a => a.status === 'graded').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">Average Score</div>
            <div className="text-3xl font-bold text-orange-600">
              {filteredAttempts.filter(a => a.status === 'graded').length > 0
                ? Math.round(
                    filteredAttempts
                      .filter(a => a.status === 'graded')
                      .reduce((sum, a) => sum + (a.percentageScore || 0), 0) /
                      filteredAttempts.filter(a => a.status === 'graded').length
                  ) + '%'
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
