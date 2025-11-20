import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resultAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EnhancedResults = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const resultId = searchParams.get('resultId');
  const [view, setView] = useState('overview'); // overview, detailed, comparison
  
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [questionAnalysis, setQuestionAnalysis] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('all');

  const studentId = user?.id || 'demo-student';

  useEffect(() => {
    if (resultId) {
      fetchSingleResult(resultId);
    } else {
      fetchResultsOverview();
    }
  }, [resultId, timeframe]);

  const fetchSingleResult = async (id) => {
    try {
      setLoading(true);
      const [resultResponse, analysisResponse] = await Promise.all([
        resultAPI.getById(id),
        resultAPI.getQuestionAnalysis(id)
      ]);
      
      setSelectedResult(resultResponse.data);
      setQuestionAnalysis(analysisResponse.data);
      
      if (resultResponse.data.assignmentId) {
        const comparisonResponse = await resultAPI.getComparison(
          resultResponse.data.studentId,
          resultResponse.data.assignmentId._id
        );
        setComparison(comparisonResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch result details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsOverview = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, resultsResponse, learningPathResponse] = await Promise.all([
        resultAPI.getDashboard(studentId, timeframe),
        resultAPI.getByStudent(studentId),
        resultAPI.getLearningPath(studentId)
      ]);
      
      setDashboardData(dashboardResponse.data);
      setResults(resultsResponse.data);
      setLearningPath(learningPathResponse.data);
    } catch (err) {
      setError('Failed to fetch results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '🔄';
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  // Single Result View
  if (selectedResult && questionAnalysis) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/results" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Results
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Test Analysis</h1>
          <p className="text-gray-600">{selectedResult.assignmentId.title}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'detailed', 'comparison'].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {view === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
              <div className="text-center">
                <div className={`text-4xl font-bold p-4 rounded-lg ${getScoreColor(selectedResult.score)}`}>
                  {selectedResult.score}%
                </div>
                <p className="text-gray-600 mt-2">
                  {questionAnalysis.summary.correctAnswers} of {questionAnalysis.summary.totalQuestions} correct
                </p>
                <p className="text-sm text-gray-500">
                  Time: {formatTime(selectedResult.timeSpent)}
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            {selectedResult.performance && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Class Comparison</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rank:</span>
                    <span className="font-semibold">#{selectedResult.performance.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Percentile:</span>
                    <span className="font-semibold">{selectedResult.performance.percentile}th</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class Average:</span>
                    <span className="font-semibold">{selectedResult.performance.averageScore}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Insights */}
            {selectedResult.analytics && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Insights</h3>
                <div className="space-y-2">
                  {selectedResult.analytics.strengths.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-600">Strengths:</p>
                      <p className="text-sm text-gray-600">{selectedResult.analytics.strengths.join(', ')}</p>
                    </div>
                  )}
                  {selectedResult.analytics.weaknesses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-600">Areas for Improvement:</p>
                      <p className="text-sm text-gray-600">{selectedResult.analytics.weaknesses.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Topic Performance */}
        {view === 'overview' && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Topic Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedResult.topicWiseScore.map((topic, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{topic.topic}</h4>
                    <span className={`px-2 py-1 rounded text-sm ${getScoreColor(topic.percentage)}`}>
                      {topic.percentage}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {topic.correct} of {topic.total} questions
                  </div>
                  {topic.averageTimePerQuestion && (
                    <div className="text-xs text-gray-500">
                      Avg time: {formatTime(topic.averageTimePerQuestion)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Question Analysis */}
        {view === 'detailed' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Question-by-Question Analysis</h3>
            </div>
            <div className="divide-y">
              {questionAnalysis.questions.map((q, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Question {q.questionIndex}</h4>
                      <p className="text-gray-700 mb-3">{q.question}</p>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        q.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Your Answer:</span>
                      <p className={`text-sm ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {q.studentAnswer}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                      <p className="text-sm text-green-600">{q.correctAnswer}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Topic: {q.topic}</span>
                    <span>Difficulty: {q.difficulty}</span>
                    <span>Time: {formatTime(q.timeSpent)}</span>
                  </div>
                  
                  {q.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <span className="text-sm font-medium text-blue-800">Explanation:</span>
                      <p className="text-sm text-blue-700 mt-1">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison View */}
        {view === 'comparison' && comparison && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Class Comparison</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{comparison.student.score}%</div>
                  <div className="text-sm text-gray-600">Your Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{comparison.class.averageScore}%</div>
                  <div className="text-sm text-gray-600">Class Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">#{comparison.student.rank}</div>
                  <div className="text-sm text-gray-600">Your Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{comparison.student.percentile}%</div>
                  <div className="text-sm text-gray-600">Percentile</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
              <div className="space-y-2">
                {comparison.distribution.scoreRanges.map((range, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-20 text-sm font-medium">{range.range}%</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                      <div 
                        className="bg-primary-600 h-4 rounded-full"
                        style={{ width: `${(range.count / comparison.class.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-gray-600">{range.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Results Overview
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Results & Analytics</h1>
        <p className="text-gray-600">Track your performance and identify areas for improvement</p>
      </div>

      {/* Timeframe Filter */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['all', 'week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeframe === period
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === 'all' ? 'All Time' : `Last ${period.charAt(0).toUpperCase() + period.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {dashboardData && dashboardData.overview.totalTests > 0 ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Tests</h3>
              <div className="text-3xl font-bold text-gray-900">{dashboardData.overview.totalTests}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Average Score</h3>
              <div className={`text-3xl font-bold ${getScoreColor(dashboardData.overview.averageScore).split(' ')[0]}`}>
                {dashboardData.overview.averageScore}%
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Time Spent</h3>
              <div className="text-3xl font-bold text-gray-900">{dashboardData.overview.totalTimeSpent}m</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Performance Trend</h3>
              <div className="text-2xl">
                {getTrendIcon(dashboardData.performance.trend)}
                <span className="text-lg font-medium ml-2 capitalize">
                  {dashboardData.performance.trend}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          {dashboardData.charts.scoreProgress.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Score Progress</h3>
              <div className="h-64 flex items-end space-x-2">
                {dashboardData.charts.scoreProgress.map((point, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="bg-primary-600 rounded-t w-full transition-all hover:bg-primary-700"
                      style={{ height: `${(point.score / 100) * 200}px` }}
                      title={`Test ${point.test}: ${point.score}%`}
                    ></div>
                    <div className="text-xs text-gray-600 mt-1 text-center">
                      {point.test}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Strengths</h3>
              {dashboardData.topics.strengths.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.topics.strengths.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{topic.topic}</span>
                      <span className="text-green-600 font-semibold">{topic.averageScore}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Take more tests to identify your strengths</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Areas for Improvement</h3>
              {dashboardData.topics.weaknesses.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.topics.weaknesses.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{topic.topic}</span>
                      <span className="text-red-600 font-semibold">{topic.averageScore}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Great job! No major weak areas identified</p>
              )}
            </div>
          </div>

          {/* Learning Recommendations */}
          {learningPath && learningPath.recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Personalized Learning Path</h3>
              <div className="space-y-4">
                {learningPath.recommendations.map((rec, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{rec.message}</p>
                        <p className="text-sm text-gray-600 mt-1">Estimated time: {rec.estimatedTime}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Test Results */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Recent Test Results</h3>
            </div>
            <div className="divide-y">
              {results.slice(0, 10).map((result) => (
                <div key={result._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {result.assignmentId?.title || 'Test'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {result.assignmentId?.courseId?.title} • 
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </span>
                      <Link 
                        to={`/results?resultId=${result._id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No test results found</div>
          <Link 
            to="/student-dashboard"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Take Your First Test
          </Link>
        </div>
      )}
    </div>
  );
};

export default EnhancedResults;