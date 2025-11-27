import { useState } from 'react';

export default function ProctorConsentModal({ onAccept, onDecline }) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedProctoring, setAgreedProctoring] = useState(false);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState('');

  const canProceed = agreedTerms && agreedProctoring;

  const handleAccept = async () => {
    setRequestingPermissions(true);
    setPermissionError('');

    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Permission granted - stop the stream immediately (ProctoringMonitor will request it again)
      stream.getTracks().forEach(track => track.stop());

      // Proceed with exam start
      onAccept();
    } catch (error) {
      console.error('Permission denied:', error);
      setPermissionError(
        'Camera and microphone access is required for this exam. Please allow access in your browser settings and try again.'
      );
      setRequestingPermissions(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl animate-gradient">
          <h2 className="text-3xl font-bold flex items-center">
            <svg className="w-8 h-8 mr-3 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Exam Proctoring Agreement
          </h2>
          <p className="text-blue-100 mt-2">Please review and accept before proceeding</p>
        </div>

        <div className="p-8">
          {/* Terms and Conditions Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Terms & Conditions
            </h3>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 max-h-64 overflow-y-auto text-sm text-gray-700 space-y-3">
              <p className="font-semibold text-gray-900">By taking this examination, you agree to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Maintain academic integrity throughout the examination</li>
                <li>Not use any unauthorized materials or resources</li>
                <li>Not communicate with others during the exam</li>
                <li>Submit only your own original work</li>
                <li>Follow all examination rules and regulations</li>
                <li>Accept that violations may result in exam termination and disciplinary action</li>
              </ul>
              <p className="mt-4 font-semibold text-gray-900">Prohibited Activities:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Opening other applications or websites during the exam</li>
                <li>Using external devices (phones, tablets, secondary computers)</li>
                <li>Taking screenshots or recording the exam content</li>
                <li>Copying or sharing exam questions and answers</li>
                <li>Looking away from the screen for extended periods</li>
                <li>Having other people present in the room</li>
              </ul>
            </div>
          </div>

          {/* Proctoring Consent Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Proctoring & Privacy Notice
            </h3>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6 text-sm text-gray-700 space-y-3">
              <p className="font-semibold text-indigo-900">Remote Proctoring System</p>
              <p>This examination uses remote proctoring to ensure exam integrity. The system will:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Camera Monitoring:</strong> Your webcam will record video throughout the exam to verify your identity and detect suspicious behavior</li>
                <li><strong>Microphone Monitoring:</strong> Audio will be monitored to detect voices or conversations</li>
                <li><strong>Screen Recording:</strong> Your screen activity may be recorded</li>
                <li><strong>Browser Lockdown:</strong> Tab switching and window changes will be detected and flagged</li>
                <li><strong>AI-Assisted Review:</strong> Automated systems will flag potential violations for human review</li>
              </ul>

              <div className="mt-4 p-4 bg-white border-l-4 border-indigo-500 rounded">
                <p className="font-semibold text-indigo-900">Data Usage & Privacy:</p>
                <ul className="list-disc ml-6 space-y-1 mt-2 text-xs">
                  <li>Proctoring data is used solely for exam integrity purposes</li>
                  <li>Video, audio, and screen recordings are stored securely</li>
                  <li>Data may be reviewed by authorized personnel</li>
                  <li>Data retention follows institutional policies</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p className="font-semibold text-yellow-900 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Required Permissions
                </p>
                <ul className="list-disc ml-6 space-y-1 mt-2 text-xs text-yellow-900">
                  <li>Allow camera access when prompted by your browser</li>
                  <li>Allow microphone access when prompted</li>
                  <li>Ensure proper lighting so your face is visible</li>
                  <li>Remove any headwear that obscures your face</li>
                  <li>Sit in a quiet, private room</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Permission Error */}
          {permissionError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start animate-slideInLeft">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 animate-wiggle" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{permissionError}</span>
            </div>
          )}

          {/* Checkboxes */}
          <div className="space-y-4 mb-6">
            <label className="flex items-start cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                I have read and agree to the <strong>Terms & Conditions</strong> and understand the prohibited activities
              </span>
            </label>

            <label className="flex items-start cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedProctoring}
                onChange={(e) => setAgreedProctoring(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                I consent to <strong>remote proctoring</strong> including camera, microphone, and screen monitoring
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 animate-fadeInUp">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors ripple"
            >
              Decline & Exit
            </button>
            <button
              onClick={handleAccept}
              disabled={!canProceed || requestingPermissions}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all transform ripple ${
                canProceed && !requestingPermissions
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg animate-gradient'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {requestingPermissions ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Requesting Permissions...
                </span>
              ) : canProceed ? (
                'Accept & Start Exam'
              ) : (
                'Please Accept Both Terms'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
