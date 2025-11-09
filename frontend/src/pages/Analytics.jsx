import React, { useState, useEffect } from 'react';
import { resultAPI, contextAPI } from '../services/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState('student-001');

  useEffect(() => {
    fetchAnalytics();
    fetchContext();
  }, [studentId]);

  const fetchAnalytics = async () => {
    try {
      const response = await resultAPI.getAnalytics(studentId);
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContext = async () => {
    try {
      const response = await contextAPI.get(studentId);
      setContext(response.data);
    } catch (err) {
      console.error('Failed to fetch context:', err);
    }
  };

  const handleStudentChange = (e) => {
    setStudentId(e.target.value);
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics || analytics.totalTests === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
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

        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No test data available for analytics</div>
          <p className="text-gray-600 mb-6">Take some tests to see your performance analytics</p>
          <a 
            href="/generate-assignment"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Take Your First Test
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
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

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {analytics.averageScore}%
          </div>
          <div className="text-gray-600">Average Score</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {analytics.totalTests}
          </div>
          <div className="text-gray-600">Tests Completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {analytics.strongTopics.length}
          </div>
          <div className="text-gray-600">Strong Topics</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {analytics.weakTopics.length}
          </div>
          <div className="text-gray-600">Areas to Improve</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Strengths and Weaknesses */}
        <div className="space-y-6">
          {/* Strong Topics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-green-800">Strong Topics</h2>
            {analytics.strongTopics.length > 0 ? (
              <div className="space-y-3">
                {analytics.strongTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{topic.topic}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${topic.averageScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {Math.round(topic.averageScore)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No strong topics identified yet. Keep taking tests!</p>
            )}
          </div>

          {/* Weak Topics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-red-800">Areas to Improve</h2>
            {analytics.weakTopics.length > 0 ? (
              <div className="space-y-3">
                {analytics.weakTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{topic.topic}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${topic.averageScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-red-600">
                        {Math.round(topic.averageScore)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Great! No weak areas identified.</p>
            )}
          </div>
        </div>

        {/* Student Context */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Learning Profile</h2>
          
          {context && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Learning Style</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {context.learningStyle || 'Not specified'}
                </span>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Current Strengths</h3>
                <div className="flex flex-wrap gap-2">
                  {context.strengths && context.strengths.length > 0 ? (
                    context.strengths.map((strength, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {strength}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">None identified yet</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Areas for Improvement</h3>
                <div className="flex flex-wrap gap-2">
                  {context.weaknesses && context.weaknesses.length > 0 ? (
                    context.weaknesses.map((weakness, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                        {weakness}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">None identified yet</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Recent Performance</h3>
                <div className="space-y-2">
                  {context.performanceHistory && context.performanceHistory.length > 0 ? (
                    context.performanceHistory.slice(-3).map((perf, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{perf.topic}</span>
                        <span className={`font-medium ${
                          perf.score >= 70 ? 'text-green-600' : 
                          perf.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {perf.score}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No performance data yet</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Trend */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Progress Trend</h2>
        {analytics.progressTrend.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.progressTrend.map((test, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm truncate">{test.testName}</h4>
                    <span className={`text-sm font-medium ${
                      test.score >= 70 ? 'text-green-600' : 
                      test.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {test.score}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(test.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No progress data available yet.</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Recommendations</h2>
        <div className="space-y-3">
          {analytics.weakTopics.length > 0 && (
            <div className="flex items-start">
              <div className="text-blue-600 mr-3 mt-1">📚</div>
              <div>
                <h4 className="font-medium text-blue-800">Focus on Weak Areas</h4>
                <p className="text-blue-700 text-sm">
                  Spend more time studying: {analytics.weakTopics.slice(0, 3).map(t => t.topic).join(', ')}
                </p>
              </div>
            </div>
          )}
          
          {analytics.averageScore < 60 && (
            <div className="flex items-start">
              <div className="text-blue-600 mr-3 mt-1">⚡</div>
              <div>
                <h4 className="font-medium text-blue-800">Increase Practice</h4>
                <p className="text-blue-700 text-sm">
                  Your average score is {analytics.averageScore}%. Take more practice tests to improve.
                </p>
              </div>
            </div>
          )}

          {analytics.strongTopics.length > 0 && (
            <div className="flex items-start">
              <div className="text-blue-600 mr-3 mt-1">🎯</div>
              <div>
                <h4 className="font-medium text-blue-800">Maintain Strengths</h4>
                <p className="text-blue-700 text-sm">
                  Keep practicing {analytics.strongTopics.slice(0, 2).map(t => t.topic).join(' and ')} to maintain your strong performance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;