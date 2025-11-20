import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { proctoringService } from '../services/proctoringService';
import { assignmentAPI, resultAPI } from '../services/api';
import FaceDetectionMonitor from '../components/FaceDetectionMonitor';

const ProctoredTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Test state
  const [assignment, setAssignment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  
  // Proctoring state
  const [proctoringSession, setProctoringSession] = useState(null);
  const [systemCheck, setSystemCheck] = useState(null);
  const [proctoringReady, setProctoringReady] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [lockdownActive, setLockdownActive] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Refs
  const webcamRef = useRef(null);
  const startedAt = useRef(null);
  const lockdownListenersRef = useRef([]);
  const activityTimeoutRef = useRef(null);

  const studentId = user?.id || user?.studentId || 'demo-student';

  // Initialize test and proctoring
  useEffect(() => {
    initializeTest();
    return () => cleanup();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (testStarted && timeLeft === 0) {
      handleSubmit(true); // Auto-submit
    }
  }, [timeLeft, testStarted]);

  const initializeTest = async () => {
    try {
      // Fetch assignment
      const response = await assignmentAPI.getByIdForStudent(id, studentId);
      const assignmentData = response.data;
      setAssignment(assignmentData);

      // Check if proctoring is enabled
      if (assignmentData.proctorConfig?.enabled) {
        await initializeProctoring(assignmentData);
      } else {
        // Regular test without proctoring
        setProctoringReady(true);
        setTimeLeft(assignmentData.timeLimit ? assignmentData.timeLimit * 60 : 3600);
      }
    } catch (err) {
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const initializeProctoring = async (assignmentData) => {
    try {
      // Check system requirements
      const requirements = await proctoringService.checkSystemRequirements();
      setSystemCheck(requirements);

      if (!requirements.camera || !requirements.browser) {
        setError('System requirements not met. Camera and modern browser required.');
        return;
      }

      // Initialize proctoring session
      const session = await proctoringService.initializeSession(
        id,
        studentId,
        assignmentData.proctorConfig
      );
      setProctoringSession(session);

      // Set up webcam stream
      if (assignmentData.proctorConfig.webcamRequired) {
        await setupWebcam();
      }

      setProctoringReady(true);
      setTimeLeft(assignmentData.timeLimit ? assignmentData.timeLimit * 60 : 3600);
    } catch (error) {
      setError('Failed to initialize proctoring: ' + error.message);
    }
  };

  const setupWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      setWebcamStream(stream);
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (error) {
      setError('Failed to access webcam: ' + error.message);
      throw error;
    }
  };

  const startTest = async () => {
    try {
      setLoading(true);
      
      if (proctoringSession) {
        // Start proctored session
        await proctoringService.startSession(proctoringSession.sessionId, systemCheck);
        
        // Start recordings if enabled
        if (assignment.proctorConfig.webcamRequired) {
          await proctoringService.startWebcamRecording(proctoringSession.sessionId);
        }
        
        if (assignment.proctorConfig.screenRecording) {
          const screenStream = await proctoringService.startScreenRecording(proctoringSession.sessionId);
          setScreenStream(screenStream);
        }
        
        // Enable browser lockdown
        if (assignment.proctorConfig.browserLockdown) {
          enableBrowserLockdown();
        }
      }

      // Start the test
      await assignmentAPI.start(id, studentId);
      startedAt.current = Date.now();
      setTestStarted(true);
    } catch (error) {
      setError('Failed to start test: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const enableBrowserLockdown = () => {
    setLockdownActive(true);
    
    // Prevent right-click
    const preventRightClick = (e) => {
      if (assignment.proctorConfig.preventRightClick) {
        e.preventDefault();
        recordSuspiciousActivity('right_click', 'medium', 'Right-click attempted');
        return false;
      }
    };

    // Prevent copy/paste
    const preventCopyPaste = (e) => {
      if (assignment.proctorConfig.preventCopyPaste) {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
          e.preventDefault();
          recordSuspiciousActivity('copy_paste', 'high', `${e.key.toUpperCase()} key combination attempted`);
          return false;
        }
      }
    };

    // Prevent tab switching
    const preventTabSwitch = (e) => {
      if (assignment.proctorConfig.preventTabSwitch) {
        if (e.altKey && e.key === 'Tab') {
          e.preventDefault();
          recordSuspiciousActivity('tab_switch', 'high', 'Alt+Tab attempted');
          return false;
        }
      }
    };

    // Detect window blur/focus
    const handleWindowBlur = () => {
      recordSuspiciousActivity('window_blur', 'medium', 'Test window lost focus');
    };

    const handleWindowFocus = () => {
      if (proctoringSession) {
        proctoringService.recordScreenActivity(proctoringSession.sessionId, 'focus_gained');
      }
    };

    // Detect fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordSuspiciousActivity('fullscreen_exit', 'high', 'Exited fullscreen mode');
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', preventCopyPaste);
    document.addEventListener('keydown', preventTabSwitch);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Store listeners for cleanup
    lockdownListenersRef.current = [
      { element: document, event: 'contextmenu', handler: preventRightClick },
      { element: document, event: 'keydown', handler: preventCopyPaste },
      { element: document, event: 'keydown', handler: preventTabSwitch },
      { element: window, event: 'blur', handler: handleWindowBlur },
      { element: window, event: 'focus', handler: handleWindowFocus },
      { element: document, event: 'fullscreenchange', handler: handleFullscreenChange }
    ];

    // Enter fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(console.warn);
    }
  };

  const disableBrowserLockdown = () => {
    setLockdownActive(false);
    
    // Remove all event listeners
    lockdownListenersRef.current.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    lockdownListenersRef.current = [];

    // Exit fullscreen safely
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {
        // Ignore errors when document is not active or fullscreen is already exited
      });
    }
  };

  const recordSuspiciousActivity = useCallback(async (type, severity, details) => {
    if (!proctoringSession) return;

    try {
      const result = await proctoringService.recordSuspiciousActivity(
        proctoringSession.sessionId,
        type,
        severity,
        details
      );

      // Update local state
      setSuspiciousActivities(prev => [...prev, { type, severity, details, timestamp: new Date() }]);

      // Handle automatic actions
      if (result.shouldTerminate) {
        await handleSubmit(true, 'terminated');
      } else if (result.action === 'warning') {
        setWarnings(prev => [...prev, `Warning: ${details}`]);
      }
    } catch (error) {
      console.error('Failed to record suspicious activity:', error);
    }
  }, [proctoringSession]);

  const handleFaceDetection = useCallback(async (detection) => {
    if (!proctoringSession) return;

    try {
      await proctoringService.recordBiometricData(proctoringSession.sessionId, {
        faceDetection: detection,
        eyeTracking: { gazeDirection: 'center', lookAwayDuration: 0 },
        environmentAudio: { detected: false, suspiciousNoises: false, multipleVoices: false }
      });
    } catch (error) {
      console.error('Failed to record biometric data:', error);
    }
  }, [proctoringSession]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));

    // Record activity if proctoring is active
    if (proctoringSession) {
      proctoringService.recordScreenActivity(
        proctoringSession.sessionId,
        'answer_selected',
        `Question ${questionIndex + 1}, Answer ${answerIndex + 1}`
      );
    }
  };

  const handleQuestionNavigation = (newQuestion) => {
    setCurrentQuestion(newQuestion);

    // Record navigation if proctoring is active
    if (proctoringSession) {
      proctoringService.recordScreenActivity(
        proctoringSession.sessionId,
        'question_navigation',
        `Navigated to question ${newQuestion + 1}`
      );
    }
  };

  const handleSubmit = async (isAutoSubmit = false, reason = 'completed') => {
    try {
      setSubmitting(true);
      
      // Prepare answers for submission
      const answersArray = Array.from({ length: assignment.questionsGenerated.length }, (_, index) => 
        answers[index] ?? null
      );

      const totalTimeSpent = Math.floor((Date.now() - startedAt.current) / 1000);

      // Enhanced submission data for proctored test
      const submissionData = {
        assignmentId: id,
        studentId,
        answers: answersArray.map((answer, index) => ({
          questionIndex: index,
          selectedAnswer: answer,
          timeSpent: Math.floor(totalTimeSpent / assignment.questionsGenerated.length), // Approximate
          attempts: 1
        })),
        timeSpent: totalTimeSpent,
        startedAt: new Date(startedAt.current),
        metadata: {
          browserInfo: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          submissionMethod: isAutoSubmit ? 'auto' : 'manual',
          proctoringEnabled: !!proctoringSession,
          suspiciousActivities: suspiciousActivities.length,
          sessionId: proctoringSession?.sessionId
        }
      };

      // Submit results
      const response = await resultAPI.submit(submissionData);

      // End proctoring session
      if (proctoringSession) {
        await proctoringService.endSession(proctoringSession.sessionId, reason);
      }

      // Navigate to results
      navigate('/results', { 
        state: { 
          message: isAutoSubmit ? 
            `Test auto-submitted! Score: ${response.data.score}%` :
            `Test completed! Score: ${response.data.score}%`,
          score: response.data.score,
          resultId: response.data._id,
          enhanced: true
        }
      });
    } catch (error) {
      setError('Failed to submit test: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const cleanup = () => {
    // Stop recordings
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }

    // Disable lockdown
    disableBrowserLockdown();

    // Clear timeouts
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proctored test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Proctoring Setup */}
          {assignment.proctorConfig?.enabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">🔒 Proctored Exam</h2>
              <p className="text-yellow-700 mb-4">
                This is a proctored examination. Your webcam, screen, and activities will be monitored during the test.
              </p>
              
              {/* System Check */}
              {systemCheck && (
                <div className="mb-4">
                  <h3 className="font-medium text-yellow-800 mb-2">System Requirements:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center ${systemCheck.camera ? 'text-green-600' : 'text-red-600'}`}>
                      {systemCheck.camera ? '✅' : '❌'} Camera Access
                    </div>
                    <div className={`flex items-center ${systemCheck.microphone ? 'text-green-600' : 'text-red-600'}`}>
                      {systemCheck.microphone ? '✅' : '❌'} Microphone Access
                    </div>
                    <div className={`flex items-center ${systemCheck.screen ? 'text-green-600' : 'text-red-600'}`}>
                      {systemCheck.screen ? '✅' : '❌'} Screen Sharing
                    </div>
                    <div className={`flex items-center ${systemCheck.browser ? 'text-green-600' : 'text-red-600'}`}>
                      {systemCheck.browser ? '✅' : '❌'} Browser Support
                    </div>
                  </div>
                </div>
              )}

              {/* Webcam Preview */}
              {assignment.proctorConfig.webcamRequired && webcamStream && (
                <div className="mb-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Webcam Preview:</h3>
                  <video
                    ref={webcamRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-64 h-48 bg-gray-200 rounded border"
                  />
                </div>
              )}

              {/* Proctoring Rules */}
              <div className="mb-4">
                <h3 className="font-medium text-yellow-800 mb-2">Proctoring Rules:</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {assignment.proctorConfig.preventTabSwitch && <li>• Do not switch tabs or applications</li>}
                  {assignment.proctorConfig.preventCopyPaste && <li>• Copy/paste is disabled</li>}
                  {assignment.proctorConfig.preventRightClick && <li>• Right-click is disabled</li>}
                  {assignment.proctorConfig.webcamRequired && <li>• Keep your face visible in the webcam</li>}
                  {assignment.proctorConfig.browserLockdown && <li>• Test will run in fullscreen mode</li>}
                  <li>• Suspicious activities will be flagged and may result in test termination</li>
                </ul>
              </div>
            </div>
          )}

          {/* Test Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4">{assignment.title}</h1>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Questions:</strong> {assignment.questionsGenerated.length}</p>
                <p><strong>Time Limit:</strong> {formatTime(timeLeft)}</p>
              </div>
              <div>
                <p><strong>Course:</strong> {assignment.courseId.title}</p>
                <p><strong>Type:</strong> {assignment.proctorConfig?.enabled ? 'Proctored Exam' : 'Regular Test'}</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startTest}
              disabled={!proctoringReady || (assignment.proctorConfig?.enabled && (!systemCheck?.camera || !systemCheck?.browser))}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignment.proctorConfig?.enabled ? 'Start Proctored Exam' : 'Start Test'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test in progress
  const currentQ = assignment.questionsGenerated[currentQuestion];
  const progress = ((currentQuestion + 1) / assignment.questionsGenerated.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Proctoring Monitoring */}
      {assignment.proctorConfig?.enabled && proctoringSession && (
        <FaceDetectionMonitor
          sessionId={proctoringSession.sessionId}
          onFaceDetected={handleFaceDetection}
          onSuspiciousActivity={recordSuspiciousActivity}
          isActive={testStarted}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">{assignment.title}</h1>
              {assignment.proctorConfig?.enabled && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span>Proctored Exam - Being Monitored</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {assignment.questionsGenerated.length}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mt-4 space-y-2">
              {warnings.map((warning, index) => (
                <div key={index} className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
                  ⚠️ {warning}
                </div>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">Question {currentQuestion + 1}</h2>
            {currentQ.topic && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {currentQ.topic}
              </span>
            )}
          </div>

          <p className="text-lg mb-6">{currentQ.question}</p>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <label 
                key={index}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answers[currentQuestion] === index 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerSelect(currentQuestion, index)}
                    className="mr-3 text-primary-600"
                  />
                  <span className="flex-1">{option}</span>
                  <span className="text-gray-400 font-mono">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleQuestionNavigation(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <div className="flex space-x-2 max-w-md overflow-x-auto">
              {assignment.questionsGenerated.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionNavigation(index)}
                  className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-primary-600 text-white'
                      : answers[index] !== undefined
                      ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === assignment.questionsGenerated.length - 1 ? (
              <button
                onClick={() => {
                  if (Object.keys(answers).length < assignment.questionsGenerated.length) {
                    const unanswered = assignment.questionsGenerated.length - Object.keys(answers).length;
                    if (!window.confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) {
                      return;
                    }
                  }
                  handleSubmit();
                }}
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  '✓ Submit Test'
                )}
              </button>
            ) : (
              <button
                onClick={() => handleQuestionNavigation(Math.min(assignment.questionsGenerated.length - 1, currentQuestion + 1))}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Suspicious Activity Counter (for proctored tests) */}
      {assignment.proctorConfig?.enabled && suspiciousActivities.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm font-medium">
            ⚠️ Flags: {suspiciousActivities.length}
          </div>
          <div className="text-xs">
            Max allowed: {assignment.proctorConfig.maxSuspiciousActivities}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoredTest;