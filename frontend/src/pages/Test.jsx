import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentAPI, resultAPI } from '../services/api';

const Test = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const studentId = 'student-user'; // In real app, get from auth

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (testStarted && timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, testStarted]);

  const fetchAssignment = async () => {
    try {
      const response = await assignmentAPI.getById(id);
      const assignmentData = response.data;
      
      // Check if student is assigned to this test
      if (!assignmentData.assignedStudents.includes(studentId)) {
        setError('You are not assigned to this test.');
        return;
      }

      setAssignment(assignmentData);
      
      // Check if assignment has questions
      if (!assignmentData.questionsGenerated || assignmentData.questionsGenerated.length === 0) {
        setError('This assignment has no questions. Please contact your instructor.');
        return;
      }
      
      // Set timer: 2 minutes per question
      setTimeLeft(assignmentData.questionsGenerated.length * 120);
    } catch (err) {
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
    try {
      await assignmentAPI.start(id);
      setTestStarted(true);
    } catch (err) {
      setError('Failed to start test');
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Calculate score
      let correctAnswers = 0;
      const questionResults = assignment.questionsGenerated.map((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) correctAnswers++;
        
        return {
          questionId: question.questionId,
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          topic: question.topic || 'Unknown'
        };
      });

      const score = (correctAnswers / assignment.questionsGenerated.length) * 100;

      // Submit results
      await resultAPI.submit({
        assignmentId: id,
        student: studentId,
        answers: questionResults,
        score,
        totalQuestions: assignment.questionsGenerated.length,
        correctAnswers,
        timeTaken: (assignment.questionsGenerated.length * 120) - timeLeft
      });

      // Navigate to results or dashboard
      navigate('/student-dashboard', { 
        state: { 
          message: `Test completed! Score: ${score.toFixed(1)}%` 
        }
      });
    } catch (err) {
      setError('Failed to submit test');
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
              <span>{formatTime((assignment.questionsGenerated?.length || 0) * 120)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Topics:</span>
              <span>{assignment.selectedTopics?.join(', ') || assignment.targetTopics?.join(', ') || 'Mixed'}</span>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• You have 2 minutes per question</li>
              <li>• Select one answer per question</li>
              <li>• You can navigate between questions</li>
              <li>• Test will auto-submit when time expires</li>
              <li>• Make sure you have a stable internet connection</li>
            </ul>
          </div>

          <button
            onClick={startTest}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
          >
            Start Test
          </button>
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
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
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
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {assignment.questionsGenerated.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded text-sm ${
                  index === currentQuestion
                    ? 'bg-primary-600 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === assignment.questionsGenerated.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(assignment.questionsGenerated.length - 1, currentQuestion + 1))}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Test;