import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function CreateExam() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    totalDuration: 30,
    passingScore: 60,
    maxAttempts: 3,
    startWindow: '',
    endWindow: '',
    status: 'draft',
    settings: {
      shuffleQuestions: false,
      shuffleOptions: false,
      proctoring: {
        enabled: false,
        faceDetection: true,
        eyeTracking: true,
        headPoseDetection: true,
        audioDetection: true,
        multiplePersonDetection: true
      },
      autoReset: {
        enabled: false,
        resetAfterHours: 24,
        resetAttempts: true
      },
      attemptRollingWindow: {
        enabled: false,
        windowHours: 24,
        description: 'Attempts reset on a rolling basis'
      }
    }
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    type: 'multiple-choice',
    points: 1,
    negativeMarking: 0,
    options: ['', '', '', ''],
    correctAnswer: [],
    multipleCorrect: false
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingExamId, setEditingExamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load exam data if editing
  useEffect(() => {
    const loadExamData = async () => {
      const exam = location.state?.exam;
      if (exam) {
        setEditingExamId(exam._id);
        setExamData({
          title: exam.title,
          description: exam.description,
          totalDuration: exam.totalDuration,
          passingScore: exam.passingScore,
          maxAttempts: exam.maxAttempts,
          startWindow: exam.startWindow ? new Date(exam.startWindow).toISOString().slice(0, 16) : '',
          endWindow: exam.endWindow ? new Date(exam.endWindow).toISOString().slice(0, 16) : '',
          status: exam.status,
          settings: {
            shuffleQuestions: exam.settings?.shuffleQuestions || false,
            shuffleOptions: exam.settings?.shuffleOptions || false,
            proctoring: {
              enabled: exam.settings?.proctoring?.enabled || false,
              faceDetection: exam.settings?.proctoring?.faceDetection !== false,
              eyeTracking: exam.settings?.proctoring?.eyeTracking !== false,
              headPoseDetection: exam.settings?.proctoring?.headPoseDetection !== false,
              audioDetection: exam.settings?.proctoring?.audioDetection !== false,
              multiplePersonDetection: exam.settings?.proctoring?.multiplePersonDetection !== false
            },
            autoReset: {
              enabled: exam.settings?.autoReset?.enabled || false,
              resetAfterHours: exam.settings?.autoReset?.resetAfterHours || 24,
              resetAttempts: exam.settings?.autoReset?.resetAttempts !== false
            },
            attemptRollingWindow: {
              enabled: exam.settings?.attemptRollingWindow?.enabled || false,
              windowHours: exam.settings?.attemptRollingWindow?.windowHours || 24,
              description: exam.settings?.attemptRollingWindow?.description || 'Attempts reset on a rolling basis'
            }
          }
        });

        // Load questions from exam sections
        try {
          const response = await api.get(`/exams/${exam._id}`);
          const examDetails = response.data.data;

          // Transform backend questions to frontend format
          const loadedQuestions = [];
          if (examDetails.sections && examDetails.sections.length > 0) {
            for (const section of examDetails.sections) {
              for (const question of section.questions) {
                const q = {
                  questionText: question.prompt,
                  type: question.type === 'mcq_single' || question.type === 'mcq_multiple'
                    ? 'multiple-choice'
                    : question.type === 'short_text'
                    ? 'short-answer'
                    : 'true-false',
                  points: question.points,
                  options: question.options ? question.options.map(opt => opt.text) : [],
                  correctAnswer: question.correctAnswers || [],
                  multipleCorrect: question.type === 'mcq_multiple'
                };
                loadedQuestions.push(q);
              }
            }
          }
          setQuestions(loadedQuestions);
        } catch (error) {
          console.error('Failed to load exam questions:', error);
        }
      }
    };
    loadExamData();
  }, [location]);

  const handleExamDataChange = (e) => {
    const { name, value } = e.target;
    setExamData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    setExamData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: checked
      }
    }));
  };

  const handleProctoringChange = (e) => {
    const { name, checked } = e.target;
    setExamData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        proctoring: {
          ...prev.settings.proctoring,
          [name]: checked
        }
      }
    }));
  };

  const handleAutoResetChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        autoReset: {
          ...prev.settings.autoReset,
          [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }
      }
    }));
  };

  const handleRollingWindowChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        attemptRollingWindow: {
          ...prev.settings.attemptRollingWindow,
          [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }
      }
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => {
      // Reset correctAnswer when changing question type
      if (name === 'type') {
        return {
          ...prev,
          [name]: value,
          correctAnswer: value === 'short-answer' ? '' : [],
          multipleCorrect: false
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleCorrectAnswerToggle = (option) => {
    setCurrentQuestion(prev => {
      const currentAnswers = Array.isArray(prev.correctAnswer) ? prev.correctAnswer : [];
      const isSelected = currentAnswers.includes(option);

      if (prev.multipleCorrect) {
        // Multiple correct answers mode
        return {
          ...prev,
          correctAnswer: isSelected
            ? currentAnswers.filter(ans => ans !== option)
            : [...currentAnswers, option]
        };
      } else {
        // Single correct answer mode
        return {
          ...prev,
          correctAnswer: [option]
        };
      }
    });
  };

  const addQuestion = () => {
    // Validate current question
    if (!currentQuestion.questionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (currentQuestion.type === 'multiple-choice') {
      const filledOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
      if (filledOptions.length < 2) {
        setError('At least 2 options are required for multiple choice questions');
        return;
      }
      const answers = Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer : [];
      if (answers.length === 0) {
        setError('Please select at least one correct answer');
        return;
      }
    } else if (currentQuestion.type === 'true-false') {
      const answers = Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer : [];
      if (answers.length === 0) {
        setError('Please select the correct answer (True or False)');
        return;
      }
    } else if (currentQuestion.type === 'short-answer') {
      if (!currentQuestion.correctAnswer || !currentQuestion.correctAnswer.trim()) {
        setError('Correct answer is required for short answer questions');
        return;
      }
    }

    if (editingIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = { ...currentQuestion };
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      // Add new question
      setQuestions([...questions, { ...currentQuestion }]);
    }

    setCurrentQuestion({
      questionText: '',
      type: 'multiple-choice',
      points: 1,
      options: ['', '', '', ''],
      correctAnswer: [],
      multipleCorrect: false
    });
    setError('');
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    // If we're removing the question being edited, reset the form
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentQuestion({
        questionText: '',
        type: 'multiple-choice',
        points: 1,
        options: ['', '', '', ''],
        correctAnswer: [],
        multipleCorrect: false
      });
    }
  };

  const editQuestion = (index) => {
    const question = questions[index];
    setCurrentQuestion({ ...question });
    setEditingIndex(index);
    setError('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setCurrentQuestion({
      questionText: '',
      type: 'multiple-choice',
      points: 1,
      options: ['', '', '', ''],
      correctAnswer: [],
      multipleCorrect: false
    });
    setError('');
  };

  const handleSubmit = async (submitForApproval = false) => {
    if (currentStep === 1) {
      // Validate exam details
      if (!examData.title.trim() || !examData.description.trim()) {
        setError('Title and description are required');
        return;
      }
      setCurrentStep(2);
      setError('');
      return;
    }

    if (currentStep === 2) {
      // Validate questions
      if (questions.length === 0) {
        setError('Please add at least one question');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const payload = {
          ...examData,
          questions,
          status: submitForApproval ? 'pending' : 'draft'
        };

        let response;
        if (editingExamId) {
          // Update existing exam
          response = await api.patch(`/exams/${editingExamId}`, payload);
        } else {
          // Create new exam
          response = await api.post('/exams', payload);
        }

        if (response.data.success) {
          navigate(user?.role === 'admin' ? '/admin' : '/instructor');
        }
      } catch (err) {
        setError(err.response?.data?.message || `Failed to ${editingExamId ? 'update' : 'create'} exam`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 animate-fadeIn">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b-4 border-gradient-to-r from-purple-600 to-indigo-600 animate-fadeInDown">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/instructor')}
                className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Create New Exam
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 rounded-xl border border-purple-200">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
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
                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-10 animate-fadeInUp">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  1
                </div>
                <span className="ml-2 font-semibold">Exam Details</span>
              </div>
              <div className={`w-24 h-1 mx-4 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <span className="ml-2 font-semibold">Add Questions</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start max-w-4xl mx-auto animate-slideInLeft">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 animate-wiggle" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Exam Details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto animate-fadeInUp hover-lift">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Exam Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Exam Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={examData.title}
                  onChange={handleExamDataChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="Enter exam title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={examData.description}
                  onChange={handleExamDataChange}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  placeholder="Enter exam description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="totalDuration"
                    value={examData.totalDuration}
                    onChange={handleExamDataChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passing Score (%) *
                  </label>
                  <input
                    type="number"
                    name="passingScore"
                    value={examData.passingScore}
                    onChange={handleExamDataChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Attempts *
                  </label>
                  <input
                    type="number"
                    name="maxAttempts"
                    value={examData.maxAttempts}
                    onChange={handleExamDataChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Window (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="startWindow"
                    value={examData.startWindow}
                    onChange={handleExamDataChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">When the exam becomes available to students</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Window (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="endWindow"
                    value={examData.endWindow}
                    onChange={handleExamDataChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">When the exam is no longer available</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Anti-Cheating Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="shuffleQuestions"
                      checked={examData.settings?.shuffleQuestions || false}
                      onChange={handleSettingsChange}
                      className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-200"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Shuffle Questions</span>
                      <p className="text-xs text-gray-500">Each student will see questions in a different random order</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="shuffleOptions"
                      checked={examData.settings?.shuffleOptions || false}
                      onChange={handleSettingsChange}
                      className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-200"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Shuffle Options</span>
                      <p className="text-xs text-gray-500">MCQ answer options will appear in a different random order for each student</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Auto-Reset Settings */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Automatic Reset</h3>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={examData.settings?.autoReset?.enabled || false}
                      onChange={handleAutoResetChange}
                      className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-200"
                    />
                    <span className="text-sm font-semibold text-gray-700">Enable Auto-Reset</span>
                  </label>
                </div>

                {examData.settings?.autoReset?.enabled && (
                  <div className="space-y-4 mt-4 pl-4 border-l-4 border-green-300">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Reset After (Hours)
                      </label>
                      <input
                        type="number"
                        name="resetAfterHours"
                        value={examData.settings?.autoReset?.resetAfterHours || 24}
                        onChange={handleAutoResetChange}
                        min="1"
                        max="168"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Automatically delete old attempts after this many hours from submission (allows students to retake)
                      </p>
                    </div>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="resetAttempts"
                        checked={examData.settings?.autoReset?.resetAttempts !== false}
                        onChange={handleAutoResetChange}
                        className="w-4 h-4 mt-1 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-200"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Reset Attempt Counter</span>
                        <p className="text-xs text-gray-500">When enabled, students can retake the exam as if it's their first attempt</p>
                      </div>
                    </label>

                    <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
                      <p className="text-xs text-green-800">
                        <strong>Note:</strong> With auto-reset enabled after {examData.settings?.autoReset?.resetAfterHours || 24} hours, students can automatically retake this exam without admin intervention.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Rolling Window Settings */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Rolling Window Attempts</h3>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={examData.settings?.attemptRollingWindow?.enabled || false}
                      onChange={handleRollingWindowChange}
                      className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-200"
                    />
                    <span className="text-sm font-semibold text-gray-700">Enable Rolling Window</span>
                  </label>
                </div>

                {examData.settings?.attemptRollingWindow?.enabled && (
                  <div className="space-y-4 mt-4 pl-4 border-l-4 border-purple-300">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Window Duration (Hours)
                      </label>
                      <input
                        type="number"
                        name="windowHours"
                        value={examData.settings?.attemptRollingWindow?.windowHours || 24}
                        onChange={handleRollingWindowChange}
                        min="1"
                        max="168"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Only count attempts from the last X hours. Older attempts automatically stop counting toward the limit.
                      </p>
                    </div>

                    <div className="bg-purple-100 border-l-4 border-purple-500 p-3 rounded">
                      <p className="text-xs text-purple-800">
                        <strong>How it works:</strong> Students can take the exam up to {examData.maxAttempts} times within any {examData.settings?.attemptRollingWindow?.windowHours || 24}-hour period. After {examData.settings?.attemptRollingWindow?.windowHours || 24} hours, old attempts no longer count toward the limit.
                      </p>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <p className="text-xs text-yellow-800">
                        <strong>Example:</strong> With max {examData.maxAttempts} attempts and {examData.settings?.attemptRollingWindow?.windowHours || 24}h window: Student takes exam at 10 AM, 2 PM, and 6 PM (3 attempts). At 10:01 AM next day, the first attempt expires and they can take it again.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Proctoring Settings */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">AI Proctoring</h3>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={examData.settings?.proctoring?.enabled || false}
                      onChange={handleProctoringChange}
                      className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-200"
                    />
                    <span className="text-sm font-semibold text-gray-700">Enable Proctoring</span>
                  </label>
                </div>

                {examData.settings?.proctoring?.enabled && (
                  <div className="space-y-3 mt-4 pl-4 border-l-4 border-indigo-300">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="faceDetection"
                        checked={examData.settings?.proctoring?.faceDetection !== false}
                        onChange={handleProctoringChange}
                        className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-200"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Face Detection</span>
                        <p className="text-xs text-gray-500">Detect if student's face is visible in camera</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="multiplePersonDetection"
                        checked={examData.settings?.proctoring?.multiplePersonDetection !== false}
                        onChange={handleProctoringChange}
                        className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-200"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Multiple Person Detection</span>
                        <p className="text-xs text-gray-500">Alert when more than one person appears in frame</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="eyeTracking"
                        checked={examData.settings?.proctoring?.eyeTracking !== false}
                        onChange={handleProctoringChange}
                        className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-200"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Eye Tracking</span>
                        <p className="text-xs text-gray-500">Monitor if student is looking away from screen</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="headPoseDetection"
                        checked={examData.settings?.proctoring?.headPoseDetection !== false}
                        onChange={handleProctoringChange}
                        className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-200"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Head Pose Detection</span>
                        <p className="text-xs text-gray-500">Detect if student turns head away or looks in other directions</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="audioDetection"
                        checked={examData.settings?.proctoring?.audioDetection !== false}
                        onChange={handleProctoringChange}
                        className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-200"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Voice/Speech Detection</span>
                        <p className="text-xs text-gray-500">Monitor for talking or other person's voice (filters background noise)</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={() => handleSubmit(false)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transform transition-all hover:scale-105 shadow-lg hover:shadow-xl ripple animate-gradient"
                >
                  Next: Add Questions
                  <svg className="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Add Questions */}
        {currentStep === 2 && (
          <div className="max-w-6xl mx-auto animate-fadeInUp">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Add Question Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8 hover-lift">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-gradient">Add Question</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      name="type"
                      value={currentQuestion.type}
                      onChange={handleQuestionChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      <option value="short-answer">Short Answer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      name="questionText"
                      value={currentQuestion.questionText}
                      onChange={handleQuestionChange}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="Enter your question"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Points
                      </label>
                      <input
                        type="number"
                        name="points"
                        value={currentQuestion.points}
                        onChange={handleQuestionChange}
                        min="1"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Negative Marking (Optional)
                      </label>
                      <input
                        type="number"
                        name="negativeMarking"
                        value={currentQuestion.negativeMarking}
                        onChange={handleQuestionChange}
                        min="0"
                        step="0.25"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Points deducted for wrong answers</p>
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  {currentQuestion.type === 'multiple-choice' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Options (at least 2 required)
                        </label>
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="mb-3">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                              placeholder={`Option ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            Correct Answer(s) *
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentQuestion.multipleCorrect}
                              onChange={(e) => setCurrentQuestion(prev => ({
                                ...prev,
                                multipleCorrect: e.target.checked,
                                correctAnswer: []
                              }))}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-600">Multiple correct answers</span>
                          </label>
                        </div>
                        <div className="space-y-2">
                          {currentQuestion.options
                            .filter(opt => opt.trim() !== '')
                            .map((option, index) => {
                              const isChecked = Array.isArray(currentQuestion.correctAnswer) &&
                                                currentQuestion.correctAnswer.includes(option);
                              return (
                                <label
                                  key={index}
                                  className={`flex items-center space-x-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                    isChecked
                                      ? 'border-green-500 bg-green-50'
                                      : 'border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  <input
                                    type={currentQuestion.multipleCorrect ? 'checkbox' : 'radio'}
                                    name="correctAnswer"
                                    checked={isChecked}
                                    onChange={() => handleCorrectAnswerToggle(option)}
                                    className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                                  />
                                  <span className={`flex-1 ${isChecked ? 'font-semibold text-green-700' : 'text-gray-700'}`}>
                                    {option}
                                  </span>
                                  {isChecked && (
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </label>
                              );
                            })}
                        </div>
                        {currentQuestion.multipleCorrect && (
                          <p className="text-xs text-gray-500 mt-2">
                            Select all correct answers. Students must select all to get full points.
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* True/False Options */}
                  {currentQuestion.type === 'true-false' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Correct Answer *
                      </label>
                      <div className="space-y-2">
                        {['True', 'False'].map((option) => {
                          const isChecked = Array.isArray(currentQuestion.correctAnswer) &&
                                            currentQuestion.correctAnswer.includes(option);
                          return (
                            <label
                              key={option}
                              className={`flex items-center space-x-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                isChecked
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="tfAnswer"
                                checked={isChecked}
                                onChange={() => handleCorrectAnswerToggle(option)}
                                className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                              />
                              <span className={`flex-1 ${isChecked ? 'font-semibold text-green-700' : 'text-gray-700'}`}>
                                {option}
                              </span>
                              {isChecked && (
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Short Answer */}
                  {currentQuestion.type === 'short-answer' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <input
                        type="text"
                        name="correctAnswer"
                        value={currentQuestion.correctAnswer}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                        placeholder="Enter the correct answer"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    {editingIndex !== null && (
                      <button
                        onClick={cancelEdit}
                        className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transform transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={addQuestion}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform transition-all hover:scale-105 shadow-lg hover:shadow-xl ripple animate-gradient"
                    >
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingIndex !== null ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                      </svg>
                      {editingIndex !== null ? 'Update Question' : 'Add Question'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Questions List */}
              <div className="bg-white rounded-2xl shadow-xl p-8 hover-lift">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-gradient">
                  Questions ({questions.length})
                </h2>

                {questions.length === 0 ? (
                  <div className="text-center py-12 animate-fadeInUp">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No questions added yet</p>
                    <p className="text-sm text-gray-400 mt-2">Add your first question to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {questions.map((q, index) => (
                      <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all stagger-item hover-lift">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                                Q{index + 1}
                              </span>
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                {q.type === 'multiple-choice' ? 'MCQ' : q.type === 'true-false' ? 'T/F' : 'Short'}
                              </span>
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                {q.points} pts
                              </span>
                            </div>
                            <p className="text-gray-800 font-medium mb-2">{q.questionText}</p>
                            <p className="text-sm text-green-600">
                              <strong>Answer:</strong> {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editQuestion(index)}
                              className={`p-2 rounded-lg transition-all ${
                                editingIndex === index
                                  ? 'text-blue-700 bg-blue-100'
                                  : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                              }`}
                              title="Edit question"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeQuestion(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                              title="Delete question"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 space-y-3 animate-fadeInUp">
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={loading || questions.length === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform transition-all hover:scale-105 shadow-lg hover:shadow-xl ripple animate-gradient"
                  >
                    {loading ? 'Submitting...' : 'Submit for Approval'}
                  </button>

                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={loading || questions.length === 0}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform transition-all hover:scale-105 shadow-lg hover:shadow-xl ripple"
                  >
                    {loading ? 'Saving...' : 'Save as Draft'}
                  </button>

                  <button
                    onClick={() => setCurrentStep(1)}
                    className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transform transition-all hover:scale-105 ripple"
                  >
                    Back to Exam Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
