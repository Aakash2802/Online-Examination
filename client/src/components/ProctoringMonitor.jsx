import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export default function ProctoringMonitor({ attemptId, socket, onViolation, settings, onCleanupReady }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null); // Store the media stream
  const isInitializedRef = useRef(false); // Prevent re-initialization
  const [detector, setDetector] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [eyesLookingAway, setEyesLookingAway] = useState(false);
  const [audioDetected, setAudioDetected] = useState(false);
  const [headTurned, setHeadTurned] = useState(false);
  const [lastViolationTime, setLastViolationTime] = useState(0);
  const [screenshotCount, setScreenshotCount] = useState(0);

  // Violation counters for grace period (require 3 consecutive failures)
  const noFaceCountRef = useRef(0);
  const eyesAwayCountRef = useRef(0);
  const headTurnCountRef = useRef(0);

  // Initialize camera and face detection
  useEffect(() => {
    // Prevent re-initialization if already initialized
    if (isInitializedRef.current) {
      console.log('⚠️ Proctoring already initialized, skipping...');
      return;
    }

    console.log('🎬 Initializing proctoring for the first time...');
    isInitializedRef.current = true;

    let stream = null;
    let animationId = null;

    const initializeProctoring = async () => {
      try {
        // Request camera AND microphone permission (only if audio detection is enabled)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'
          },
          audio: settings?.audioDetection !== false  // Enable microphone only if audio detection is on
        });

        // Store stream in ref so it can be accessed for cleanup
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // Setup audio detection (only if enabled)
        if (settings?.audioDetection !== false) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioContext;
          const audioSource = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 512;
          analyser.minDecibels = -90;
          analyser.maxDecibels = -10;
          analyser.smoothingTimeConstant = 0.85;
          audioSource.connect(analyser);
          analyserRef.current = analyser;

          // Start audio monitoring
          monitorAudio();
        }

        // Load face detection model
        await tf.ready();
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'tfjs',
          maxFaces: 1,
          refineLandmarks: true
        };
        const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        setDetector(faceDetector);
        setIsActive(true);

        // Start monitoring
        detectFaceAndEyes(faceDetector);
      } catch (error) {
        console.error('Failed to initialize proctoring:', error);
        alert('Camera access is required for this exam. Please grant permission and reload.');
      }
    };

    const monitorAudio = () => {
      if (!analyserRef.current) return;

      const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
      let previousData = new Uint8Array(analyserRef.current.frequencyBinCount);
      let speechDetectedCount = 0;

      const checkSpeechPattern = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(frequencyData);

        // Speech detection using frequency analysis
        // Human voice typically ranges from 85-255 Hz (fundamental) and harmonics up to 8 kHz
        // We focus on 100-3000 Hz range for speech detection

        const binSize = analyserRef.current.context.sampleRate / analyserRef.current.fftSize;
        const speechStartBin = Math.floor(100 / binSize);  // 100 Hz
        const speechEndBin = Math.floor(3000 / binSize);   // 3000 Hz

        // Extract speech frequency range
        const speechRange = frequencyData.slice(speechStartBin, speechEndBin);

        // Calculate energy in speech band
        const speechEnergy = speechRange.reduce((sum, val) => sum + val * val, 0) / speechRange.length;

        // Calculate variability (speech has more variation than constant noise)
        let variability = 0;
        for (let i = speechStartBin; i < speechEndBin; i++) {
          variability += Math.abs(frequencyData[i] - previousData[i]);
        }
        variability /= (speechEndBin - speechStartBin);

        // Speech detection criteria:
        // 1. Sufficient energy in speech frequencies (> 1000)
        // 2. High variability (> 15) - speech changes rapidly, noise is constant
        const speechEnergyThreshold = 1000;
        const variabilityThreshold = 15;

        const isSpeech = speechEnergy > speechEnergyThreshold && variability > variabilityThreshold;

        if (isSpeech) {
          speechDetectedCount++;

          // Confirm speech after detecting it in 2 consecutive checks (reduces false positives)
          if (speechDetectedCount >= 2) {
            handleViolation('audio_detected', `Voice/speech detected - energy: ${Math.round(speechEnergy)}, variation: ${Math.round(variability)}`);
            setAudioDetected(true);

            // Reset after 2 seconds
            setTimeout(() => setAudioDetected(false), 2000);
            speechDetectedCount = 0;
          }
        } else {
          speechDetectedCount = 0;
        }

        // Store current data for next comparison
        previousData = new Uint8Array(frequencyData);

        // Continue monitoring
        setTimeout(checkSpeechPattern, 500); // Check every 500ms for better speech detection
      };

      checkSpeechPattern();
    };

    const detectFaceAndEyes = async (faceDetector) => {
      if (!videoRef.current || !faceDetector) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === 4) {
        const faces = await faceDetector.estimateFaces(video, {
          flipHorizontal: false
        });

        // Check if face is detected
        if (faces.length === 0) {
          noFaceCountRef.current += 1;
          // Only trigger violation after 3 consecutive failures (6 seconds)
          if (noFaceCountRef.current >= 3 && settings?.faceDetection !== false) {
            handleViolation('face_not_visible', 'No face detected');
            setFaceDetected(false);
          }
        } else if (faces.length > 1) {
          // MULTIPLE FACES DETECTED - IMMEDIATE VIOLATION!
          noFaceCountRef.current = 0; // Reset
          if (settings?.multiplePersonDetection !== false) {
            handleViolation('multiple_faces', `${faces.length} people detected in frame - only one person allowed`);
            setFaceDetected(false); // Mark as violation
          }
        } else {
          // Face detected - reset counter
          noFaceCountRef.current = 0;
          setFaceDetected(true);

          const face = faces[0];
          const keypoints = face.keypoints;

          // Analyze HEAD POSE (turning back/sideways)
          if (settings?.headPoseDetection !== false) {
            const headPose = analyzeHeadPose(keypoints);
            if (headPose.turnedAway) {
              handleViolation('head_turned', `Head turned ${headPose.direction} - face must be forward`);
              setHeadTurned(true);
            } else {
              setHeadTurned(false);
            }
          }

          // Analyze eye gaze direction
          if (settings?.eyeTracking !== false) {
            const isLookingAway = analyzeEyeGaze(keypoints);
            if (isLookingAway) {
              handleViolation('looking_away', 'Student looking away from screen');
              setEyesLookingAway(true);
            } else {
              setEyesLookingAway(false);
            }
          }

          // Draw face landmarks on canvas (optional visualization)
          if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw face mesh
            drawFaceLandmarks(ctx, keypoints);
          }
        }
      }

      // Continue monitoring (every 2 seconds)
      animationId = setTimeout(() => detectFaceAndEyes(faceDetector), 2000);
    };

    const analyzeHeadPose = (keypoints) => {
      // Analyze head pose using face landmarks
      // Key landmarks for head pose:
      // Nose tip: 1
      // Left eye outer corner: 33
      // Right eye outer corner: 263
      // Left mouth corner: 61
      // Right mouth corner: 291

      const noseTip = keypoints[1];
      const leftEye = keypoints[33];
      const rightEye = keypoints[263];
      const leftMouth = keypoints[61];
      const rightMouth = keypoints[291];

      // Calculate face center (between eyes)
      const faceCenterX = (leftEye.x + rightEye.x) / 2;

      // Calculate horizontal deviation of nose from face center
      const noseDeviation = Math.abs(noseTip.x - faceCenterX);

      // Calculate eye-to-eye distance for normalization
      const eyeDistance = Math.abs(rightEye.x - leftEye.x);

      // Normalized deviation ratio
      const deviationRatio = noseDeviation / eyeDistance;

      // Check vertical angle (up/down tilt)
      const eyeMidY = (leftEye.y + rightEye.y) / 2;
      const noseToEyeDistance = noseTip.y - eyeMidY;
      const verticalRatio = Math.abs(noseToEyeDistance / eyeDistance);

      // Thresholds
      const horizontalThreshold = 0.2; // Turning left/right
      const verticalThreshold = 0.8;   // Looking up/down

      let turnedAway = false;
      let direction = '';

      // Detect horizontal turning (left/right)
      if (deviationRatio > horizontalThreshold) {
        turnedAway = true;
        direction = noseTip.x < faceCenterX ? 'left' : 'right';
      }

      // Detect vertical tilting (up/down)
      if (verticalRatio > verticalThreshold) {
        turnedAway = true;
        direction = noseToEyeDistance > 0 ? 'down' : 'up';
      }

      // Check if face is too small (turned away/back)
      if (eyeDistance < 50) { // Face too small, might be turned back
        turnedAway = true;
        direction = 'back';
      }

      return { turnedAway, direction };
    };

    const analyzeEyeGaze = (keypoints) => {
      // Get left and right eye landmarks
      // MediaPipe Face Mesh keypoint indices:
      // Left eye: 468-472 (iris)
      // Right eye: 473-477 (iris)
      // Face center reference points

      const leftIris = keypoints.slice(468, 473);
      const rightIris = keypoints.slice(473, 478);

      if (leftIris.length === 0 || rightIris.length === 0) return false;

      // Calculate iris center
      const leftCenter = {
        x: leftIris.reduce((sum, p) => sum + p.x, 0) / leftIris.length,
        y: leftIris.reduce((sum, p) => sum + p.y, 0) / leftIris.length
      };

      const rightCenter = {
        x: rightIris.reduce((sum, p) => sum + p.x, 0) / rightIris.length,
        y: rightIris.reduce((sum, p) => sum + p.y, 0) / rightIris.length
      };

      // Get eye corner landmarks for reference
      const leftEyeLeft = keypoints[33]; // Left corner of left eye
      const leftEyeRight = keypoints[133]; // Right corner of left eye
      const rightEyeLeft = keypoints[362]; // Left corner of right eye
      const rightEyeRight = keypoints[263]; // Right corner of right eye

      // Calculate eye width
      const leftEyeWidth = Math.abs(leftEyeRight.x - leftEyeLeft.x);
      const rightEyeWidth = Math.abs(rightEyeRight.x - rightEyeLeft.x);

      // Calculate iris position relative to eye
      const leftIrisPos = (leftCenter.x - leftEyeLeft.x) / leftEyeWidth;
      const rightIrisPos = (rightCenter.x - rightEyeLeft.x) / rightEyeWidth;

      // Threshold for looking away (iris not centered)
      // Normal range: 0.4 - 0.6 (centered)
      const threshold = 0.15;
      const isLookingLeft = leftIrisPos < 0.4 - threshold && rightIrisPos < 0.4 - threshold;
      const isLookingRight = leftIrisPos > 0.6 + threshold && rightIrisPos > 0.6 + threshold;

      return isLookingLeft || isLookingRight;
    };

    const drawFaceLandmarks = (ctx, keypoints) => {
      // Draw small dots for eye landmarks
      keypoints.slice(468, 478).forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
      });
    };

    const handleViolation = (type, message) => {
      const now = Date.now();
      // Debounce violations (don't trigger more than once every 5 seconds)
      if (now - lastViolationTime < 5000) return;

      setLastViolationTime(now);

      // Emit to parent component
      if (onViolation) {
        onViolation(type);
      }

      // Send to server via socket
      if (socket) {
        socket.emit('proctor_alert', {
          attemptId,
          eventType: type,
          eventData: { message, timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        });
      }

      console.log(`Proctoring Violation: ${type} - ${message}`);
    };

    initializeProctoring();

    // Create cleanup function and expose it to parent
    const cleanup = () => {
      console.log('🧹 ProctoringMonitor: Starting cleanup...');

      // Reset initialization flag to prevent re-start
      isInitializedRef.current = false;
      console.log('✓ Reset initialization flag');

      // Stop animation loop
      if (animationId) {
        clearTimeout(animationId);
        console.log('✓ Cleared animation timeout');
      }

      // Clear video element FIRST to disconnect from stream
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.load(); // Force reload to clear buffer
        console.log('✓ Cleared and reset video element');
      }

      // Stop all media tracks (camera and microphone)
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        console.log(`🎥 Found ${tracks.length} tracks to stop`);

        tracks.forEach(track => {
          console.log(`🛑 Stopping ${track.kind} track (enabled: ${track.enabled}, readyState: ${track.readyState})`);
          track.enabled = false; // Disable first
          track.stop(); // Then stop
          console.log(`✓ Stopped ${track.kind} track (new readyState: ${track.readyState})`);
        });

        // Remove all tracks from stream
        streamRef.current.getTracks().forEach(track => streamRef.current.removeTrack(track));
        console.log('✓ Removed all tracks from stream');

        streamRef.current = null;
        console.log('✓ Cleared streamRef');
      } else {
        console.warn('⚠️ streamRef.current is null, no tracks to stop');
      }

      // Dispose TensorFlow detector
      if (detector) {
        detector.dispose();
        console.log('✓ Disposed TensorFlow detector');
      }

      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        console.log('✓ Closed audio context');
      }

      console.log('✅ Proctoring monitor cleanup completed');
    };

    // Expose cleanup function to parent component
    if (onCleanupReady) {
      console.log('📌 Registering cleanup function with parent component');
      onCleanupReady(cleanup);
    }

    // Cleanup on unmount
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, socket]); // Removed onCleanupReady to prevent re-initialization

  // Periodic screenshot capture
  useEffect(() => {
    if (!socket) {
      console.warn('⚠️ Screenshot capture skipped: socket not available');
      return;
    }

    if (!socket.connected) {
      console.warn('⚠️ Screenshot capture skipped: socket not connected yet');
      return;
    }

    console.log('✓ Socket is connected, setting up screenshot capture');

    const captureScreenshot = async () => {
      try {
        const video = videoRef.current;
        if (!video) {
          console.warn('⚠️ Screenshot capture skipped: video ref not available');
          return;
        }

        if (video.readyState !== 4) {
          console.warn('⚠️ Screenshot capture skipped: video not ready (readyState:', video.readyState, ')');
          return;
        }

        console.log('📸 Capturing screenshot...');

        // Create a temporary canvas for screenshot
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const screenshot = canvas.toDataURL('image/jpeg', 0.7);

        // Send to server
        socket.emit('proctor_screenshot', {
          attemptId,
          screenshot,
          timestamp: new Date().toISOString()
        });

        console.log('✓ Screenshot captured and sent to server');
        setScreenshotCount(prev => prev + 1);
      } catch (error) {
        console.error('❌ Screenshot capture failed:', error);
      }
    };

    // Capture initial screenshot after 10 seconds (give more time for video to be ready)
    console.log('⏱️ Scheduling initial screenshot in 10 seconds...');
    const initialTimeout = setTimeout(() => {
      console.log('🎬 Attempting initial screenshot...');
      captureScreenshot();
    }, 10000);

    // Capture screenshot every 2 minutes (120000ms)
    console.log('⏱️ Scheduling periodic screenshots every 2 minutes...');
    const screenshotInterval = setInterval(() => {
      console.log('🔄 Periodic screenshot trigger...');
      captureScreenshot();
    }, 120000);

    return () => {
      console.log('🧹 Cleaning up screenshot timers...');
      clearInterval(screenshotInterval);
      clearTimeout(initialTimeout);
    };
  }, [attemptId, socket]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Camera Preview */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden border-4 border-purple-500">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-white text-xs font-semibold">Proctoring Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white text-xs font-bold">{screenshotCount}</span>
              </div>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative">
          <video
            ref={videoRef}
            className="w-48 h-36 object-cover"
            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-48 h-36 pointer-events-none opacity-70"
          />

          {/* Status Indicators */}
          <div className="absolute bottom-2 left-2 right-2 space-y-1">
            <div className="flex justify-between gap-1">
              <div className={`px-2 py-1 rounded text-xs font-semibold ${faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                {faceDetected ? '✓ Face' : '✗ Face'}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${!eyesLookingAway ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white animate-pulse'}`}>
                {!eyesLookingAway ? '✓ Eyes' : '⚠ Eyes'}
              </div>
            </div>
            <div className="flex justify-between gap-1">
              <div className={`px-2 py-1 rounded text-xs font-semibold ${!headTurned ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                {!headTurned ? '✓ Head' : '✗ Head'}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${!audioDetected ? 'bg-green-500 text-white' : 'bg-orange-500 text-white animate-pulse'}`}>
                {!audioDetected ? '✓ Audio' : '⚠ Audio'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Violation Warning */}
      {(!faceDetected || eyesLookingAway || headTurned || audioDetected) && (
        <div className="mt-2 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-semibold animate-pulse">
          ⚠ Warning: Proctoring violation detected!
        </div>
      )}
    </div>
  );
}
