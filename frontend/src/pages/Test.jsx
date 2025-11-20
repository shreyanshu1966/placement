import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentAPI, resultAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Test = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [questionTimeTracker, setQuestionTimeTracker] = useState({});
  const [startedAt, setStartedAt] = useState(null);

  const studentId = user?.id || user?.studentId || 'demo-student';

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (testStarted && timeLeft === 0) {
      handleSubmit(true); // Auto-submit when time expires
    }
  }, [timeLeft, testStarted]);

  // Auto-save answers every 10 seconds
  useEffect(() => {
    if (testStarted) {
      const autoSaveInterval = setInterval(() => {
        autoSaveAnswers();
      }, 10000); // Save every 10 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [testStarted, answers]);

  // Save answer immediately when changed
  const autoSaveAnswers = useCallback(async () => {
    if (!testStarted || Object.keys(answers).length === 0) return;

    try {
      setAutoSaving(true);
      // Save current answers to backend
      await assignmentAPI.saveAnswer(id, {
        studentId,
        answers,
        timestamp: new Date().toISOString()
      });
      setLastSaved(new Date());
    } catch (err) {
      console.warn('Auto-save failed:', err);
      setWarnings(prev => [...prev, 'Auto-save failed. Your answers may not be saved.']);
    } finally {
      setAutoSaving(false);
    }
  }, [id, studentId, answers, testStarted]);

  const fetchAssignment = async () => {
    try {
      const response = await assignmentAPI.getByIdForStudent(id, studentId);
      const assignmentData = response.data;

      setAssignment(assignmentData);
      
      // Check if assignment has questions
      if (!assignmentData.questionsGenerated || assignmentData.questionsGenerated.length === 0) {
        setError('This assignment has no questions. Please contact your instructor.');
        return;
      }
      
      // Set timer: Use assignment timeLimit or default 2 minutes per question
      const timeLimit = assignmentData.timeLimit ? 
        assignmentData.timeLimit * 60 : 
        assignmentData.questionsGenerated.length * 120;
      setTimeLeft(timeLimit);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You are not assigned to this test.');
      } else if (err.response?.status === 400 && err.response.data.submission) {
        setError('You have already submitted this test.');
      } else {
        setError('Failed to load assignment');
      }
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
    try {
      await assignmentAPI.start(id, studentId);
      const testStartTime = Date.now();
      setStartedAt(testStartTime);
      setTestStarted(true);
      
      // Initialize timing for first question
      setQuestionTimeTracker(prev => ({
        ...prev,
        0: { startTime: testStartTime, attempts: 1 }
      }));
    } catch (err) {
      setError('Failed to start test');
    }
  };

  // Track question timing and attempts
  const trackQuestionChange = (fromQuestion, toQuestion) => {
    const now = Date.now();
    
    // End timing for previous question
    if (fromQuestion >= 0) {
      setQuestionTimeTracker(prev => ({
        ...prev,
        [fromQuestion]: {
          ...prev[fromQuestion],
          endTime: now
        }
      }));
    }
    
    // Start timing for new question
    setQuestionTimeTracker(prev => ({
      ...prev,
      [toQuestion]: {
        startTime: now,
        attempts: prev[toQuestion]?.attempts ? prev[toQuestion].attempts + 1 : 1,
        endTime: prev[toQuestion]?.endTime // Keep previous end time if returning to question
      }
    }));
  };

  // Enhanced answer selection with attempt tracking
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));

    // Track answer attempt
    setQuestionTimeTracker(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        attempts: prev[questionIndex]?.attempts ? prev[questionIndex].attempts + 1 : 1
      }
    }));

    // Save this answer immediately
    autoSaveAnswers();
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    try {
      setSubmitting(true);
      
      // Calculate enhanced submission data with analytics
      const enhancedAnswers = Array.from({ length: assignment.questionsGenerated.length }, (_, index) => {
        const answer = answers[index] ?? null;
        const questionStartTime = questionTimeTracker[index]?.startTime || startedAt;
        const questionEndTime = questionTimeTracker[index]?.endTime || Date.now();
        const timeSpentOnQuestion = Math.max(0, Math.floor((questionEndTime - questionStartTime) / 1000));
        
        return {
          questionIndex: index,
          selectedAnswer: answer,
          timeSpent: timeSpentOnQuestion,
          attempts: questionTimeTracker[index]?.attempts || 1
        };
      });

      const totalTimeSpent = Math.floor((Date.now() - startedAt) / 1000);
      const testDurationMinutes = assignment.timeLimit || (assignment.questionsGenerated.length * 2);

      // Prepare comprehensive submission data for enhanced analytics
      const submissionData = {
        assignmentId: id,
        studentId,
        answers: enhancedAnswers,
        timeSpent: totalTimeSpent,
        startedAt: new Date(startedAt),
        metadata: {
          browserInfo: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          completionRate: (enhancedAnswers.filter(a => a.selectedAnswer !== null).length / assignment.questionsGenerated.length) * 100,
          averageTimePerQuestion: totalTimeSpent / assignment.questionsGenerated.length,
          questionSwitchCount: currentQuestion, // Approximate number of question navigation
          testDuration: testDurationMinutes,
          submissionMethod: isAutoSubmit ? 'auto' : 'manual',
          deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
        }
      };

      // Submit to enhanced results endpoint for comprehensive analytics
      const response = await resultAPI.submit(submissionData);

      // Navigate to enhanced results page
      navigate('/results', { 
        state: { 
          message: isAutoSubmit ? 
            `Test auto-submitted due to time limit! Score: ${response.data.score}%` :
            `Test completed! Score: ${response.data.score}%`,
          score: response.data.score,
          resultId: response.data._id,
          enhanced: true // Flag to use enhanced results display
        }
      });
    } catch (err) {
      setError('Failed to submit test');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = assignment && assignment.questionsGenerated ? ((currentQuestion + 1) / assignment.questionsGenerated.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/student-dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">{assignment.title}</h1>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="font-medium">Course:</span>
              <span>{assignment.courseId.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Questions:</span>
              <span>{assignment.questionsGenerated?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Time Limit:</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Topics:</span>
              <span>{assignment.selectedTopics?.join(', ') || assignment.targetTopics?.join(', ') || 'Mixed'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Student:</span>
              <span>{user?.name || 'Demo Student'}</span>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">📋 Test Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• You have {Math.floor(timeLeft / 60)} minutes to complete this test</li>
              <li>• Select one answer per question</li>
              <li>• You can navigate between questions using the question numbers</li>
              <li>• Your answers are automatically saved every 10 seconds</li>
              <li>• Test will auto-submit when time expires</li>
              <li>• Make sure you have a stable internet connection</li>
              <li>• Click "Submit Test" when you're finished</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h3 className="font-medium text-blue-800 mb-2">💡 Tips for Success:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Read each question carefully before selecting an answer</li>
              <li>• Answer all questions you're confident about first</li>
              <li>• Return to difficult questions if time permits</li>
              <li>• Keep an eye on the timer and pace yourself</li>
            </ul>
          </div>

          <button
            onClick={startTest}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
          >
            🚀 Start Test
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            Once you start, the timer will begin counting down
          </p>
        </div>
      </div>
    );
  }

  const currentQ = assignment.questionsGenerated[currentQuestion];

  // Safety check for current question
  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Invalid question data. Please contact your instructor.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {warnings.map((warning, index) => (
            <div key={index} className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              ⚠️ {warning}
              <button 
                onClick={() => setWarnings(prev => prev.filter((_, i) => i !== index))}
                className="float-right text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{assignment.title}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {assignment.questionsGenerated.length}
            </span>
            <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
              ⏱️ {formatTime(timeLeft)}
            </span>
            {/* Auto-save status */}
            <div className="flex items-center space-x-2">
              {autoSaving ? (
                <span className="text-blue-600 text-sm flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                  Saving...
                </span>
              ) : lastSaved ? (
                <span className="text-green-600 text-sm">
                  ✓ Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question completion status */}
        <div className="mt-2 text-sm text-gray-600">
          Progress: {Object.keys(answers).length} of {assignment.questionsGenerated.length} questions answered
        </div>
      </div>

      {/* Question */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold">Question {currentQuestion + 1}</h2>
          <div className="flex space-x-2">
            {currentQ.topic && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {currentQ.topic}
              </span>
            )}
            {currentQ.difficulty && (
              <span className={`px-2 py-1 rounded text-xs ${
                currentQ.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentQ.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentQ.difficulty}
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-800 mb-6 text-lg leading-relaxed">
          {currentQ.question}
        </p>

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
            onClick={() => {
              const newQuestion = Math.max(0, currentQuestion - 1);
              trackQuestionChange(currentQuestion, newQuestion);
              setCurrentQuestion(newQuestion);
            }}
            disabled={currentQuestion === 0}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex space-x-2 max-w-md overflow-x-auto">
            {assignment.questionsGenerated.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  trackQuestionChange(currentQuestion, index);
                  setCurrentQuestion(index);
                }}
                className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-primary-600 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
                title={answers[index] !== undefined ? `Question ${index + 1} - Answered` : `Question ${index + 1} - Not answered`}
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
              onClick={() => {
                const newQuestion = Math.min(assignment.questionsGenerated.length - 1, currentQuestion + 1);
                trackQuestionChange(currentQuestion, newQuestion);
                setCurrentQuestion(newQuestion);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Next →
            </button>
          )}
        </div>

        {/* Test summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Answered: {Object.keys(answers).length} / {assignment.questionsGenerated.length}
            </span>
            <span>
              Time remaining: {formatTime(timeLeft)}
              {timeLeft < 300 && (
                <span className="text-red-600 font-medium ml-2">⚠️ Less than 5 minutes!</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;