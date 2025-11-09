import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentAPI, resultAPI } from '../services/api';

const Assignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeStarted, setTimeStarted] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const response = await assignmentAPI.getById(id);
      setAssignment(response.data);
      setAnswers(new Array(response.data.questionsGenerated.length).fill(null));
    } catch (err) {
      setError('Failed to fetch assignment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startAssignment = async () => {
    try {
      await assignmentAPI.start(id);
      setIsStarted(true);
      setTimeStarted(new Date());
      setAssignment(prev => ({ ...prev, status: 'in-progress' }));
    } catch (err) {
      setError('Failed to start assignment');
      console.error(err);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { selectedAnswer: answerIndex };
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < assignment.questionsGenerated.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitAssignment = async () => {
    setSubmitting(true);
    setError('');

    try {
      const timeSpent = timeStarted ? Math.round((new Date() - timeStarted) / 60000) : 0; // in minutes
      
      const submissionData = {
        assignmentId: id,
        studentId: assignment.studentId,
        answers: answers,
        timeSpent: timeSpent
      };

      const response = await resultAPI.submit(submissionData);
      navigate(`/results?resultId=${response.data._id}`);
    } catch (err) {
      setError('Failed to submit assignment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading assignment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">Assignment not found</div>
      </div>
    );
  }

  if (!isStarted && assignment.status === 'generated') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{assignment.title}</h1>
          <p className="text-gray-600 mb-6">Course: {assignment.courseId.title}</p>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Assignment Overview</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div>
                <p><strong>Total Questions:</strong> {assignment.questionsGenerated.length}</p>
                <p><strong>Difficulty:</strong> {assignment.difficulty}</p>
                <p><strong>Student ID:</strong> {assignment.studentId}</p>
              </div>
              <div>
                <p><strong>Target Topics:</strong></p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {assignment.targetTopics.map((topic, index) => (
                    <span key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
            <ul className="text-left text-yellow-700 space-y-1">
              <li>• Answer all questions to the best of your ability</li>
              <li>• You can navigate between questions using Next/Previous buttons</li>
              <li>• Review your answers before submitting</li>
              <li>• Time will be tracked once you start</li>
            </ul>
          </div>

          <button
            onClick={startAssignment}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
          >
            Start Assignment
          </button>
        </div>
      </div>
    );
  }

  const question = assignment.questionsGenerated[currentQuestion];
  const progress = ((currentQuestion + 1) / assignment.questionsGenerated.length) * 100;
  const answeredCount = answers.filter(a => a !== null).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestion + 1} of {assignment.questionsGenerated.length}
          </span>
          <span className="text-sm text-gray-500">
            Answered: {answeredCount}/{assignment.questionsGenerated.length}
          </span>
        </div>
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium">
                {question.topic}
              </span>
              <span className={`px-2 py-1 rounded text-sm ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficulty}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {question.question}
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label 
              key={index}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                answers[currentQuestion]?.selectedAnswer === index
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={index}
                checked={answers[currentQuestion]?.selectedAnswer === index}
                onChange={() => handleAnswerSelect(index)}
                className="mr-3 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-4">
          {currentQuestion < assignment.questionsGenerated.length - 1 ? (
            <button
              onClick={nextQuestion}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitAssignment}
              disabled={submitting || answeredCount === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Navigation:</h3>
        <div className="flex flex-wrap gap-2">
          {assignment.questionsGenerated.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-primary-600 text-white'
                  : answers[index] !== null
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assignment;