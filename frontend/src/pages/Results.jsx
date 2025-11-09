import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resultAPI, assignmentAPI } from '../services/api';

const Results = () => {
  const [searchParams] = useSearchParams();
  const resultId = searchParams.get('resultId');
  
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState('student-001');

  useEffect(() => {
    if (resultId) {
      fetchSingleResult(resultId);
    } else {
      fetchStudentResults();
    }
  }, [resultId, studentId]);

  const fetchSingleResult = async (id) => {
    try {
      const response = await resultAPI.getById(id);
      setSelectedResult(response.data);
      setStudentId(response.data.studentId);
    } catch (err) {
      setError('Failed to fetch result');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentResults = async () => {
    try {
      const response = await resultAPI.getByStudent(studentId);
      setResults(response.data);
    } catch (err) {
      setError('Failed to fetch results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    setStudentId(e.target.value);
    setLoading(true);
    setSelectedResult(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading results...</div>
      </div>
    );
  }

  if (selectedResult) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Test Result</h1>
          <Link 
            to="/results"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to all results
          </Link>
        </div>

        {/* Score Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {selectedResult.score}%
            </div>
            <div className="text-gray-600">Overall Score</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {selectedResult.answers.filter(a => a.isCorrect).length}
            </div>
            <div className="text-gray-600">Correct Answers</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {selectedResult.timeSpent || 0}
            </div>
            <div className="text-gray-600">Minutes Spent</div>
          </div>
        </div>

        {/* Topic-wise Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Topic-wise Performance</h2>
          <div className="space-y-4">
            {selectedResult.topicWiseScore.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{topic.topic}</span>
                    <span className="text-sm text-gray-600">
                      {topic.correct}/{topic.total} ({topic.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        topic.percentage >= 70 ? 'bg-green-500' :
                        topic.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${topic.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Answers */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Detailed Review</h2>
          <div className="space-y-6">
            {selectedResult.assignmentId.questionsGenerated.map((question, index) => {
              const answer = selectedResult.answers[index];
              return (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-lg">Question {index + 1}</h3>
                    <div className="flex gap-2">
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm">
                        {question.topic}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-900 mb-4">{question.question}</p>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className={`p-3 rounded border ${
                          optionIndex === question.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : optionIndex === answer.selectedAnswer && !answer.isCorrect
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">
                            {optionIndex === question.correctAnswer && '✓ '}
                            {optionIndex === answer.selectedAnswer && optionIndex !== question.correctAnswer && '✗ '}
                          </span>
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Student ID:</label>
          <select
            value={studentId}
            onChange={handleStudentChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="student-001">student-001</option>
            <option value="student-002">student-002</option>
            <option value="student-003">student-003</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No test results found for {studentId}</div>
          <Link 
            to="/generate-assignment"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Take Your First Test
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <div key={result._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">
                  {result.assignmentId.courseId.title}
                </h3>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  result.score >= 70 ? 'bg-green-100 text-green-800' :
                  result.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {result.score}%
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Questions:</span> {result.totalQuestions}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Correct:</span> {result.answers.filter(a => a.isCorrect).length}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Time:</span> {result.timeSpent || 0} minutes
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {new Date(result.completedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</h4>
                <div className="flex flex-wrap gap-1">
                  {result.topicWiseScore.slice(0, 3).map((topic, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {topic.topic} ({topic.percentage}%)
                    </span>
                  ))}
                  {result.topicWiseScore.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{result.topicWiseScore.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <Link 
                to={`/results?resultId=${result._id}`}
                className="block w-full text-center bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;