import { useEffect, useRef, useState } from 'react';

export default function ProctoringPreview({ onReady, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('checking'); // checking, success, error
  const [micStatus, setMicStatus] = useState('checking'); // checking, success, error
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let audioContext = null;
    let analyser = null;
    let animationId = null;

    const initializeDevices = async () => {
      try {
        // Request camera and microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'
          },
          audio: true
        });

        streamRef.current = stream;

        // Setup video preview
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // Check if video track is active
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && videoTrack.readyState === 'live') {
          setCameraStatus('success');
        } else {
          setCameraStatus('error');
          setErrorMessage('Camera track not active');
        }

        // Check if audio track is active
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack && audioTrack.readyState === 'live') {
          setMicStatus('success');

          // Setup audio level monitoring
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioSource = audioContext.createMediaStreamSource(stream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          audioSource.connect(analyser);

          // Monitor audio levels
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(Math.min(100, (average / 128) * 100));
            animationId = requestAnimationFrame(checkAudioLevel);
          };
          checkAudioLevel();
        } else {
          setMicStatus('error');
          setErrorMessage('Microphone track not active');
        }
      } catch (error) {
        console.error('Device initialization error:', error);
        setCameraStatus('error');
        setMicStatus('error');

        if (error.name === 'NotAllowedError') {
          setErrorMessage('Camera/Microphone permission denied. Please allow access to continue.');
        } else if (error.name === 'NotFoundError') {
          setErrorMessage('No camera or microphone found. Please connect a device.');
        } else {
          setErrorMessage(`Error: ${error.message}`);
        }
      }
    };

    initializeDevices();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (audioContext) {
        audioContext.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const stopPreviewStream = () => {
    console.log('🧹 Stopping preview stream...');

    // Clear video element FIRST
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force reload
      console.log('✓ Cleared video element');
    }

    // Stop all tracks
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      console.log(`🛑 Stopping ${tracks.length} preview tracks...`);

      tracks.forEach(track => {
        console.log(`Stopping ${track.kind} track (readyState: ${track.readyState})`);
        track.enabled = false; // Disable first
        track.stop(); // Then stop
        console.log(`✓ Stopped ${track.kind} (new state: ${track.readyState})`);
      });

      // Remove tracks from stream
      streamRef.current.getTracks().forEach(track => streamRef.current.removeTrack(track));
      streamRef.current = null;
      console.log('✓ Preview stream fully stopped and cleared');
    } else {
      console.warn('⚠️ No stream to stop');
    }
  };

  const handleContinue = () => {
    console.log('✅ User confirmed device check, stopping preview...');
    stopPreviewStream();
    onReady();
  };

  const handleCancel = () => {
    console.log('🚫 User cancelled device preview');
    stopPreviewStream();
    onCancel();
  };

  const allReady = cameraStatus === 'success' && micStatus === 'success';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 p-6 animate-scaleIn my-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Device Setup Check</h2>
          <p className="text-sm text-gray-600">Make sure your camera and microphone are working</p>
        </div>

        {/* Camera Preview */}
        <div className="mb-4">
          <div className="bg-gray-900 rounded-xl overflow-hidden relative" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${
                cameraStatus === 'success' ? 'bg-green-500 text-white' :
                cameraStatus === 'error' ? 'bg-red-500 text-white' :
                'bg-yellow-500 text-white'
              }`}>
                {cameraStatus === 'success' && '✓ Camera Ready'}
                {cameraStatus === 'error' && '✗ Camera Error'}
                {cameraStatus === 'checking' && '⟳ Checking Camera...'}
              </div>
            </div>
          </div>
        </div>

        {/* Device Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Camera Status */}
          <div className={`p-4 rounded-xl border-2 ${
            cameraStatus === 'success' ? 'bg-green-50 border-green-500' :
            cameraStatus === 'error' ? 'bg-red-50 border-red-500' :
            'bg-yellow-50 border-yellow-500'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                cameraStatus === 'success' ? 'bg-green-100' :
                cameraStatus === 'error' ? 'bg-red-100' :
                'bg-yellow-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  cameraStatus === 'success' ? 'text-green-600' :
                  cameraStatus === 'error' ? 'text-red-600' :
                  'text-yellow-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Camera</h3>
                <p className={`text-sm ${
                  cameraStatus === 'success' ? 'text-green-700' :
                  cameraStatus === 'error' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  {cameraStatus === 'success' && 'Working properly'}
                  {cameraStatus === 'error' && 'Not detected'}
                  {cameraStatus === 'checking' && 'Checking...'}
                </p>
              </div>
            </div>
          </div>

          {/* Microphone Status */}
          <div className={`p-4 rounded-xl border-2 ${
            micStatus === 'success' ? 'bg-green-50 border-green-500' :
            micStatus === 'error' ? 'bg-red-50 border-red-500' :
            'bg-yellow-50 border-yellow-500'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                micStatus === 'success' ? 'bg-green-100' :
                micStatus === 'error' ? 'bg-red-100' :
                'bg-yellow-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  micStatus === 'success' ? 'text-green-600' :
                  micStatus === 'error' ? 'text-red-600' :
                  'text-yellow-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Microphone</h3>
                <p className={`text-sm ${
                  micStatus === 'success' ? 'text-green-700' :
                  micStatus === 'error' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  {micStatus === 'success' && 'Working properly'}
                  {micStatus === 'error' && 'Not detected'}
                  {micStatus === 'checking' && 'Checking...'}
                </p>
              </div>
            </div>

            {/* Audio Level Indicator */}
            {micStatus === 'success' && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Audio Level:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-100"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8">{Math.round(audioLevel)}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Speak to test your microphone</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded-lg mb-4 animate-fadeInUp">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-xs text-blue-800 font-semibold mb-1">Important:</p>
              <ul className="text-xs text-blue-700 space-y-0.5">
                <li>• Face clearly visible in camera</li>
                <li>• Quiet, well-lit room required</li>
                <li>• Test mic by speaking</li>
                <li>• Devices monitored during exam</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!allReady}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              allReady
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {allReady ? 'Continue to Exam' : 'Waiting for devices...'}
          </button>
        </div>
      </div>
    </div>
  );
}
