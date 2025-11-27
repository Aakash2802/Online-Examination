import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useSocket } from '../contexts/SocketContext';
import { useAutosave } from '../hooks/useAutosave';
import Timer from '../components/Timer';
import QuestionNavigator from '../components/QuestionNavigator';
import QuestionDisplay from '../components/QuestionDisplay';
import Loading from '../components/Loading';
import ProctoringMonitor from '../components/ProctoringMonitor';

export default function ExamRunner() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const proctoringCleanupRef = useRef(null);

  // State
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [violations, setViolations] = useState({
    tabSwitches: 0,
    visibilityChanges: 0,
    copyPaste: 0,
    screenshots: 0,
    voiceDetected: 0,
    faceNotVisible: 0,
    lookingAway: 0,
    totalViolations: 0
  });
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const { saveAnswer } = useAutosave(attemptId, socket);

  // Fetch attempt data
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await api.get(`/attempts/${attemptId}`);
        setAttempt(res.data.data);

        // Pre-fill existing answers
        const existingAnswers = {};
        res.data.data.answers.forEach((ans) => {
          existingAnswers[ans.questionId] = ans.answerData;
        });
        setAnswers(existingAnswers);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load attempt:', err);
        alert('Failed to load exam. Redirecting...');
        navigate('/exams');
      }
    };
    fetchAttempt();
  }, [attemptId, navigate]);

  // Socket.IO integration
  useEffect(() => {
    if (socket && attemptId) {
      socket.emit('join_attempt', { attemptId });

      socket.on('exam_timer_sync', (data) => {
        setTimeRemaining(data.timeRemainingSeconds);
      });

      socket.on('force_submit', async () => {
        alert('Time is up! Your exam will be submitted automatically.');
        await handleSubmit(true);
      });

      socket.on('proctor_enforcement', (data) => {
        if (data.action === 'locked') {
          alert(data.message);
          // Could lock the UI here
        } else if (data.action === 'warning') {
          alert(data.message);
        }
      });

      socket.on('autosave_ack', (data) => {
        console.log('Answer saved:', data);
      });

      return () => {
        socket.emit('leave_attempt', { attemptId });
        socket.off('exam_timer_sync');
        socket.off('force_submit');
        socket.off('proctor_enforcement');
        socket.off('autosave_ack');
      };
    }
  }, [socket, attemptId]);

  // Camera and microphone are now handled by ProctoringMonitor component

  // Anti-cheat: Disable copy-paste
  useEffect(() => {
    const preventCopy = (e) => {
      e.preventDefault();
      const newCount = violations.copyPaste + 1;
      setViolations((prev) => ({
        ...prev,
        copyPaste: newCount,
        totalViolations: prev.totalViolations + 1,
      }));
      alert('Warning: Copy-paste is disabled during the exam!');
      if (socket) {
        socket.emit('proctor_alert', {
          attemptId,
          eventType: 'copy_paste_attempt',
          eventData: { count: newCount },
          timestamp: new Date().toISOString(),
        });
      }
    };

    const preventCut = (e) => {
      e.preventDefault();
      alert('Warning: Cut operation is disabled during the exam!');
    };

    const preventPaste = (e) => {
      e.preventDefault();
      alert('Warning: Paste operation is disabled during the exam!');
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCut);
    document.addEventListener('paste', preventPaste);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCut);
      document.removeEventListener('paste', preventPaste);
    };
  }, [violations, socket, attemptId]);

  // Anti-cheat: Block screenshots
  useEffect(() => {
    const preventScreenshot = (e) => {
      // Detect PrintScreen, Cmd+Shift+3/4 (Mac), Windows+Shift+S
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) ||
        (e.metaKey && e.shiftKey && e.key === 's')
      ) {
        e.preventDefault();
        const newCount = violations.screenshots + 1;
        setViolations((prev) => ({
          ...prev,
          screenshots: newCount,
          totalViolations: prev.totalViolations + 1,
        }));
        alert('Warning: Screenshots are not allowed during the exam!');
        if (socket) {
          socket.emit('proctor_alert', {
            attemptId,
            eventType: 'screenshot_attempt',
            eventData: { count: newCount },
            timestamp: new Date().toISOString(),
          });
        }
      }
    };

    window.addEventListener('keydown', preventScreenshot);
    return () => window.removeEventListener('keydown', preventScreenshot);
  }, [violations, socket, attemptId]);

  // Anti-cheat: visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = violations.visibilityChanges + 1;
        setViolations((prev) => ({
          ...prev,
          visibilityChanges: newCount,
          totalViolations: prev.totalViolations + 1,
        }));
        if (socket) {
          socket.emit('proctor_alert', {
            attemptId,
            eventType: 'visibility_change',
            eventData: { count: newCount },
            timestamp: new Date().toISOString(),
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [violations, socket, attemptId]);

  // Anti-cheat: tab switch (blur)
  useEffect(() => {
    const handleBlur = () => {
      const newCount = violations.tabSwitches + 1;
      setViolations((prev) => ({
        ...prev,
        tabSwitches: newCount,
        totalViolations: prev.totalViolations + 1,
      }));
      if (socket) {
        socket.emit('proctor_alert', {
          attemptId,
          eventType: 'tab_switch',
          eventData: { count: newCount },
          timestamp: new Date().toISOString(),
        });
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [violations, socket, attemptId]);

  // Prevent context menu (right-click)
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Handle proctoring violations
  const handleProctoringViolation = (violationType) => {
    setViolations((prev) => ({
      ...prev,
      [violationType === 'face_not_visible' ? 'faceNotVisible' :
       violationType === 'looking_away' ? 'lookingAway' :
       violationType === 'multiple_faces' ? 'faceNotVisible' : violationType]: (prev[violationType] || 0) + 1,
      totalViolations: prev.totalViolations + 1
    }));
  };

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    saveAnswer(questionId, value);
  };

  // Handle submit
  const handleSubmit = async (isForced = false) => {
    if (!isForced && !showSubmitConfirm) {
      setShowSubmitConfirm(true);
      return;
    }

    setSubmitting(true);
    try {
      // CRITICAL: Stop camera and microphone BEFORE API call and navigation
      console.log('🎥 Step 1: Attempting to cleanup proctoring...');
      if (proctoringCleanupRef.current) {
        console.log('✓ Cleanup ref found, calling cleanup function');
        proctoringCleanupRef.current();
        console.log('✓ Cleanup function called');

        // Wait longer to ensure streams are fully stopped
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✓ Waited 1 second for cleanup to complete');
      } else {
        console.warn('⚠️ WARNING: Cleanup ref is null! Camera may not stop.');
      }

      console.log('📤 Step 2: Submitting exam to server...');
      await api.post(`/attempts/${attemptId}/submit`, { timestamp: new Date().toISOString() });
      console.log('✓ Exam submitted successfully');

      // Additional delay to ensure everything is cleaned up
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✓ Final delay complete');

      console.log('🚀 Step 3: Navigating to results page with full reload to release camera...');
      // Use window.location instead of navigate to force full page reload
      // This ensures the browser completely releases the camera/microphone
      window.location.href = `/attempts/${attemptId}/results`;
    } catch (err) {
      console.error('❌ Failed to submit:', err);
      alert('Failed to submit exam. Please try again.');
      setSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  if (loading) {
    return <Loading message="Loading exam..." />;
  }

  if (!attempt) return null;

  const exam = attempt.examId || attempt.exam;
  const questions = exam?.sections?.flatMap((s) => s.questions) || [];
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 animate-fadeIn" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
      {/* Proctoring Monitor */}
      {exam?.settings?.proctoring?.enabled && (
        <ProctoringMonitor
          attemptId={attemptId}
          socket={socket}
          onViolation={handleProctoringViolation}
          settings={exam?.settings?.proctoring}
          onCleanupReady={(cleanupFn) => {
            console.log('Proctoring cleanup function registered');
            proctoringCleanupRef.current = cleanupFn;
          }}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-50 animate-fadeInDown">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{exam?.title || 'Exam'}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Timer timeRemaining={timeRemaining} />

            {violations.totalViolations > 0 && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg text-sm animate-pulse">
                <span className="font-semibold">⚠️ Violations:</span> {violations.totalViolations}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Question Navigator - Sidebar */}
          <div className="lg:col-span-1">
            <QuestionNavigator
              questions={questions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              onNavigate={setCurrentQuestionIndex}
            />

            {/* Progress Summary */}
            <div className="bg-white shadow-md p-4 rounded-lg mt-4">
              <h3 className="text-sm font-semibold mb-2">Progress</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-semibold text-green-600">
                    {Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-semibold text-gray-800">
                    {questions.length -
                      Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Display - Main */}
          <div className="lg:col-span-3">
            <QuestionDisplay
              question={currentQuestion}
              answer={answers[currentQuestion?._id]}
              onAnswerChange={handleAnswerChange}
              questionNumber={currentQuestionIndex + 1}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-700 transition"
              >
                ← Previous
              </button>

              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Submit Exam
              </button>

              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-700 transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
            <h2 className="text-2xl font-bold mb-4">Submit Exam?</h2>
            <p className="text-gray-700 mb-2">
              You have answered{' '}
              <strong>
                {Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length}
              </strong>{' '}
              out of <strong>{questions.length}</strong> questions.
            </p>
            <p className="text-gray-700 mb-6">
              Are you sure you want to submit? You cannot change your answers after submission.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
