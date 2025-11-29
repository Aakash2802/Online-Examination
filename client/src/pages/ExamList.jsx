import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { ExamCardSkeleton } from '../components/Skeleton';

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exams
        const examsRes = await api.get('/exams?available=true');
        const examsData = examsRes.data.data;
        setExams(examsData);

        // Fetch user's attempts
        const attemptsRes = await api.get('/attempts/my-attempts');
        const attemptsData = attemptsRes.data.data;

        // Create a map of examId -> attempts array
        const attemptsMap = {};
        attemptsData.forEach(attempt => {
          const examId = attempt.examId._id || attempt.examId;
          if (!attemptsMap[examId]) {
            attemptsMap[examId] = [];
          }
          attemptsMap[examId].push(attempt);
        });
        setAttempts(attemptsMap);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to get completed attempts for an exam
  const getCompletedAttempts = (examId) => {
    const examAttempts = attempts[examId] || [];
    return examAttempts.filter(attempt => attempt.status === 'submitted' || attempt.status === 'graded');
  };

  // Helper function to get all attempts for an exam
  const getAllAttempts = (examId) => {
    return attempts[examId] || [];
  };

  // Helper function to get recent attempts (within rolling window)
  const getRecentAttempts = (exam) => {
    const examAttempts = getAllAttempts(exam._id);

    // Check if rolling window is enabled for this exam
    if (exam.settings?.attemptRollingWindow?.enabled) {
      const windowHours = exam.settings.attemptRollingWindow.windowHours || 24;
      const cutoffTime = new Date(Date.now() - windowHours * 60 * 60 * 1000);

      // Filter attempts to only include those within the rolling window
      return examAttempts.filter(attempt => {
        const attemptTime = new Date(attempt.submittedAt || attempt.createdAt);
        return attemptTime > cutoffTime;
      });
    }

    // If rolling window is not enabled, return all attempts
    return examAttempts;
  };

  // Helper function to check if exam can be taken
  const canTakeExam = (exam) => {
    const recentAttempts = getRecentAttempts(exam);
    return recentAttempts.length < exam.maxAttempts;
  };

  // Helper function to get next available time
  const getNextAvailableTime = (exam) => {
    const recentAttempts = getRecentAttempts(exam);

    // If can take now, return null
    if (recentAttempts.length < exam.maxAttempts) {
      return null;
    }

    // If rolling window is not enabled, no next available time
    if (!exam.settings?.attemptRollingWindow?.enabled) {
      return null;
    }

    // Find oldest attempt in the window
    const windowHours = exam.settings.attemptRollingWindow.windowHours || 24;
    const oldestAttempt = recentAttempts.reduce((oldest, current) => {
      const oldestTime = new Date(oldest.submittedAt || oldest.createdAt);
      const currentTime = new Date(current.submittedAt || current.createdAt);
      return currentTime < oldestTime ? current : oldest;
    });

    const oldestTime = new Date(oldestAttempt.submittedAt || oldestAttempt.createdAt);
    const nextAvailable = new Date(oldestTime.getTime() + windowHours * 60 * 60 * 1000);

    return nextAvailable;
  };

  // Helper function to get the best score for an exam
  const getBestScore = (examId) => {
    const completedAttempts = getCompletedAttempts(examId);
    if (completedAttempts.length === 0) return null;
    return Math.max(...completedAttempts.map(a => a.percentageScore || 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Navigation Skeleton */}
        <nav className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl skeleton-shimmer"></div>
                <div className="h-6 w-32 bg-gray-200 rounded skeleton-shimmer"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-24 bg-gray-200 rounded-xl skeleton-shimmer"></div>
                <div className="h-10 w-32 bg-gray-200 rounded-xl skeleton-shimmer"></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12">
          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-10">
            <div className="h-10 w-64 bg-gray-200 rounded skeleton-shimmer mb-3"></div>
            <div className="h-5 w-80 bg-gray-200 rounded skeleton-shimmer"></div>
          </div>

          {/* Exam Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ExamCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Exam Portal
              </h1>
            </div>
            <div className="flex items-center flex-wrap gap-2 sm:space-x-4 w-full sm:w-auto">
              <Link
                to={user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/instructor' : '/dashboard'}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 sm:px-5 py-2 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
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

      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12 animate-fadeIn">
        {/* Header Section */}
        <div className="mb-6 sm:mb-10 animate-fadeInDown">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 text-gradient">Available Exams</h2>
          <p className="text-sm sm:text-base text-gray-600 flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Select an exam to begin your assessment
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-xl text-center animate-scaleIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4 animate-pulse">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Exams Available</h3>
            <p className="text-gray-500">There are currently no exams scheduled. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {exams.map((exam, index) => (
              <div
                key={exam._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform overflow-hidden border border-gray-100 flex flex-col h-full stagger-item card-3d-hover"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4 md:p-6 relative min-h-[100px] sm:min-h-[120px] animate-gradient">
                  {/* Completed Badge */}
                  {getCompletedAttempts(exam._id).length > 0 && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center shadow-lg animate-bounce">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">Completed</span>
                      <span className="sm:hidden">✓</span>
                    </div>
                  )}
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2 pr-16 sm:pr-20">{exam.title}</h3>
                  <p className="text-blue-100 text-xs sm:text-sm line-clamp-2">{exam.description}</p>
                </div>

                {/* Card Body */}
                <div className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
                  <div className="space-y-2 sm:space-y-3 flex-1">
                    <div className="flex items-center text-gray-700">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-semibold text-sm sm:text-base">{exam.totalDuration} minutes</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Passing Score</p>
                        <p className="font-semibold text-sm sm:text-base">{exam.passingScore}%</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Attempts {exam.settings?.attemptRollingWindow?.enabled && <span className="text-[10px]">(Last {exam.settings.attemptRollingWindow.windowHours}h)</span>}
                        </p>
                        <p className="font-semibold text-sm sm:text-base">{getRecentAttempts(exam).length} / {exam.maxAttempts}</p>
                      </div>
                    </div>

                    {/* Best Score - only show if exam is completed */}
                    {getBestScore(exam._id) !== null && getBestScore(exam._id) !== undefined && (
                      <div className="flex items-center text-gray-700">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Best Score</p>
                          <p className="font-semibold text-sm sm:text-base text-yellow-600">{getBestScore(exam._id).toFixed(1)}%</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!canTakeExam(exam) ? (
                    <>
                      <button
                        disabled
                        className="block w-full text-center bg-gray-400 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base mt-4 sm:mt-6 cursor-not-allowed opacity-75"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Max Attempts Reached
                      </button>
                      {getNextAvailableTime(exam) && (
                        <div className="mt-2 text-center text-xs sm:text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Next available: {getNextAvailableTime(exam).toLocaleString()}
                        </div>
                      )}
                    </>
                  ) : getCompletedAttempts(exam._id).length > 0 ? (
                    <Link
                      to={`/exams/${exam._id}/start`}
                      className="block text-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base mt-4 sm:mt-6 ripple animate-gradient"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retake Exam
                    </Link>
                  ) : (
                    <Link
                      to={`/exams/${exam._id}/start`}
                      className="block text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base mt-4 sm:mt-6 ripple animate-gradient"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Exam
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
