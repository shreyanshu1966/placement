import React, { useState, useEffect } from 'react';
import { resultAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EnhancedAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [compareStudent, setCompareStudent] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('overview'); // overview, detailed, comparison
  const [timeframe, setTimeframe] = useState('all');

  const isStudent = user?.role === 'student';
  const currentStudentId = isStudent ? user.id : selectedStudent;

  useEffect(() => {
    if (isStudent) {
      setSelectedStudent(user.id);
    } else {
      fetchStudents();
    }
  }, [isStudent, user]);

  useEffect(() => {
    if (currentStudentId) {
      fetchAnalyticsData();
    }
  }, [currentStudentId, timeframe]);

  const fetchStudents = async () => {
    try {
      const response = await authAPI.getUsersByRole('student');
      setStudents(response.data);
      if (response.data.length > 0) {
        setSelectedStudent(response.data[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch students');
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, dashboardResponse] = await Promise.all([
        resultAPI.getAnalytics(currentStudentId),
        resultAPI.getDashboard(currentStudentId, timeframe)
      ]);
      
      setAnalytics(analyticsResponse.data);
      setDashboardData(dashboardResponse.data);
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    if (!compareStudent || !currentStudentId) return;
    
    try {
      const results1 = await resultAPI.getByStudent(currentStudentId);
      const results2 = await resultAPI.getByStudent(compareStudent);
      
      if (results1.data.length === 0 || results2.data.length === 0) {
        setError('Both students must have test results to compare');
        return;
      }

      // Find common assignments
      const commonAssignments = results1.data.filter(r1 => 
        results2.data.some(r2 => r2.assignmentId._id === r1.assignmentId._id)
      );

      if (commonAssignments.length === 0) {
        setError('No common tests found between these students');
        return;
      }

      const comparisonData = {
        student1: {
          id: currentStudentId,
          name: students.find(s => s._id === currentStudentId)?.name || 'Student 1',
          results: results1.data
        },
        student2: {
          id: compareStudent,
          name: students.find(s => s._id === compareStudent)?.name || 'Student 2',
          results: results2.data
        },
        commonTests: commonAssignments.map(r1 => {
          const r2 = results2.data.find(r => r.assignmentId._id === r1.assignmentId._id);
          return {
            assignment: r1.assignmentId,
            student1Score: r1.score,
            student2Score: r2.score,
            student1Time: r1.timeSpent,
            student2Time: r2.timeSpent
          };
        })
      };

      setComparison(comparisonData);
    } catch (err) {
      setError('Failed to fetch comparison data');
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive performance analytics and insights</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Student Selection (Faculty only) */}
          {!isStudent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Timeframe Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>

          {/* View Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Type
            </label>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed Analysis</option>
              <option value="comparison">Compare Students</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Overview View */}
      {view === 'overview' && dashboardData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-primary-600">{dashboardData.overview.totalTests}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className={`text-3xl font-bold ${getPerformanceColor(dashboardData.overview.averageScore)}`}>
                {dashboardData.overview.averageScore}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-gray-900">{dashboardData.overview.totalTimeSpent}m</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-2xl">{getTrendIcon(dashboardData.performance.trend)}</div>
              <div className="text-sm text-gray-600 capitalize">{dashboardData.performance.trend}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600">
                {dashboardData.performance.percentile || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Percentile</div>
            </div>
          </div>

          {/* Performance Chart */}
          {dashboardData.charts.scoreProgress.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
              <div className="h-80">
                <div className="flex items-end h-64 space-x-1">
                  {dashboardData.charts.scoreProgress.map((point, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="relative group">
                        <div 
                          className="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm w-full transition-all hover:from-primary-700 hover:to-primary-500 cursor-pointer"
                          style={{ height: `${(point.score / 100) * 240}px`, minHeight: '4px' }}
                        ></div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {point.title}<br/>
                          Score: {point.score}%<br/>
                          Time: {point.timeSpent}m<br/>
                          {point.rank && `Rank: #${point.rank}`}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 text-center transform -rotate-45">
                        Test {point.test}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>Oldest</span>
                  <span>Latest</span>
                </div>
              </div>
            </div>
          )}

          {/* Topic Performance Heatmap */}
          {dashboardData.charts.topicPerformance.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Topic Performance Heatmap</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dashboardData.charts.topicPerformance.map((topic, index) => {
                  const intensity = topic.score / 100;
                  const bgColor = intensity >= 0.8 ? 'bg-green-500' :
                                intensity >= 0.6 ? 'bg-yellow-500' :
                                intensity >= 0.4 ? 'bg-orange-500' : 'bg-red-500';
                  
                  return (
                    <div key={index} className={`${bgColor} text-white p-4 rounded-lg`}>
                      <div className="font-medium text-sm mb-1">{topic.topic}</div>
                      <div className="text-2xl font-bold">{topic.score}%</div>
                      <div className="text-xs opacity-90">{topic.tests} tests</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-green-600">💪 Strengths</h3>
              {dashboardData.topics.strengths.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.topics.strengths.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">{topic.topic}</div>
                        <div className="text-sm text-gray-600">{topic.testsCount} tests • {topic.totalQuestions} questions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-bold">{topic.averageScore}%</div>
                        <div className="text-xs text-gray-500">{topic.accuracy}% accuracy</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Take more tests to identify your strengths</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600">🎯 Areas for Improvement</h3>
              {dashboardData.topics.weaknesses.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.topics.weaknesses.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium">{topic.topic}</div>
                        <div className="text-sm text-gray-600">{topic.testsCount} tests • {topic.totalQuestions} questions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-600 font-bold">{topic.averageScore}%</div>
                        <div className="text-xs text-gray-500">{topic.accuracy}% accuracy</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Great job! No major weak areas identified</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {dashboardData.recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">🎓 Personalized Recommendations</h3>
              <div className="space-y-3">
                {dashboardData.recommendations.map((rec, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4 py-3 bg-primary-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{rec.message}</p>
                        <p className="text-sm text-gray-600 mt-1">Action: {rec.action}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ml-4 ${
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
        </div>
      )}

      {/* Detailed Analysis View */}
      {view === 'detailed' && analytics && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Detailed Performance Analysis</h3>
            
            {analytics.totalTests > 0 ? (
              <div className="space-y-6">
                {/* Advanced Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{analytics.averageScore.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.strongTopics.length}</div>
                    <div className="text-sm text-gray-600">Strong Topics</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analytics.weakTopics.length}</div>
                    <div className="text-sm text-gray-600">Weak Topics</div>
                  </div>
                </div>

                {/* Progress Trend */}
                {analytics.progressTrend.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Recent Progress</h4>
                    <div className="space-y-2">
                      {analytics.progressTrend.map((trend, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">{trend.testName}</span>
                          <span className={getPerformanceColor(trend.score)}>
                            {trend.score}%
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(trend.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement Rate */}
                {analytics.improvement !== null && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Improvement Rate</h4>
                    <p className={`text-lg font-semibold ${
                      analytics.improvement > 0 ? 'text-green-600' : 
                      analytics.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {analytics.improvement > 0 ? '+' : ''}{analytics.improvement.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Compared to previous tests
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No test data available for detailed analysis
              </p>
            )}
          </div>
        </div>
      )}

      {/* Comparison View */}
      {view === 'comparison' && !isStudent && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Student Comparison</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare with Student
                </label>
                <select
                  value={compareStudent}
                  onChange={(e) => setCompareStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose a student to compare...</option>
                  {students.filter(s => s._id !== selectedStudent).map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchComparison}
                  disabled={!compareStudent || !selectedStudent}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Compare Students
                </button>
              </div>
            </div>

            {comparison && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-lg">{comparison.student1.name}</h4>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {(comparison.student1.results.reduce((sum, r) => sum + r.score, 0) / comparison.student1.results.length).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-lg">{comparison.student2.name}</h4>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-green-600">
                        {(comparison.student2.results.reduce((sum, r) => sum + r.score, 0) / comparison.student2.results.length).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Common Test Comparisons</h4>
                  <div className="space-y-3">
                    {comparison.commonTests.map((test, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h5 className="font-medium mb-2">{test.assignment.title}</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">{comparison.student1.name}:</span>
                            <span className={`ml-2 font-semibold ${getPerformanceColor(test.student1Score)}`}>
                              {test.student1Score}%
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({formatTime(test.student1Time)})
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">{comparison.student2.name}:</span>
                            <span className={`ml-2 font-semibold ${getPerformanceColor(test.student2Score)}`}>
                              {test.student2Score}%
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({formatTime(test.student2Time)})
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && (!dashboardData || dashboardData.overview.totalTests === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {selectedStudent ? 'No analytics data available for this student' : 'Select a student to view analytics'}
          </div>
          {isStudent && (
            <Link 
              to="/student-dashboard"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Take Your First Test
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedAnalytics;