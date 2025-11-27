import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import Loading from '../components/Loading';

export default function ProctoringViewer() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProctoringData();
  }, [attemptId]);

  const loadProctoringData = async () => {
    try {
      setLoading(true);

      // Load attempt details
      const attemptResponse = await api.get(`/attempts/${attemptId}`);
      setAttempt(attemptResponse.data.data);

      // Load proctoring logs
      const logsResponse = await api.get(`/proctoring/attempts/${attemptId}/logs`);
      setLogs(logsResponse.data.data.logs || []);
      setSummary(logsResponse.data.data.summary || {});
    } catch (error) {
      console.error('Failed to load proctoring data:', error);
      alert('Failed to load proctoring data');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      face_not_visible: '👤',
      multiple_faces: '👥',
      looking_away: '👀',
      head_turned: '🔄',
      audio_detected: '🎤',
      tab_switch: '🔄',
      visibility_change: '👁️'
    };
    return icons[eventType] || '⚠️';
  };

  const getEventColor = (severity) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[severity] || colors.medium;
  };

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.eventData?.severity === filter);

  if (loading) return <Loading />;
  if (!attempt) return <div className="p-8 text-center">Attempt not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeInDown">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-purple-600 hover:text-purple-800 font-semibold transition-smooth"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-gradient">Proctoring Report</h1>
          <p className="text-gray-600">
            Student: {attempt.userId?.firstName} {attempt.userId?.lastName} |
            Exam: {attempt.examId?.title}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200 animate-fadeInUp hover-lift stagger-item">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Total Violations</p>
                <p className="text-3xl font-bold text-purple-600">{attempt.violations?.totalViolations || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full animate-float">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200 animate-fadeInUp hover-lift stagger-item">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Tab Switches</p>
                <p className="text-3xl font-bold text-blue-600">{attempt.violations?.tabSwitches || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full animate-float">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200 animate-fadeInUp hover-lift stagger-item">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Screenshots</p>
                <p className="text-3xl font-bold text-green-600">{attempt.proctorData?.screenshots?.length || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full animate-float">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200 animate-fadeInUp hover-lift stagger-item">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Events Logged</p>
                <p className="text-3xl font-bold text-orange-600">{logs.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full animate-float">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Violation Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fadeInUp delay-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 text-gradient">Violation Timeline</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-4 py-2 rounded-lg font-semibold ${filter === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-lg font-semibold ${filter === 'high' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                High
              </button>
              <button
                onClick={() => setFilter('medium')}
                className={`px-4 py-2 rounded-lg font-semibold ${filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Medium
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No violations recorded</p>
            ) : (
              filteredLogs.map((log, index) => (
                <div
                  key={log._id || index}
                  className={`border-2 rounded-lg p-4 ${getEventColor(log.eventData?.severity || 'medium')}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getEventIcon(log.eventType)}</span>
                      <div>
                        <h3 className="font-bold capitalize">{log.eventType.replace(/_/g, ' ')}</h3>
                        <p className="text-sm">{log.eventData?.message || 'Violation detected'}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getEventColor(log.eventData?.severity || 'medium')}`}>
                      {log.eventData?.severity || 'medium'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Screenshots Section */}
        {attempt.proctorData?.screenshots && attempt.proctorData.screenshots.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Screenshots Captured</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {attempt.proctorData.screenshots.map((screenshot, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg p-3 hover:border-purple-500 transition-all">
                  <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center mb-2">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      <p className="text-xs text-gray-500">Screenshot #{index + 1}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    {new Date(screenshot.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    {Math.round(screenshot.size / 1024)} KB
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Screenshots are captured every 2 minutes during the exam (first capture after 5 seconds).
                Image data is stored as metadata only (timestamp and size) to optimize database performance.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
