import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resultAPI, questionBankAPI, courseAPI } from '../services/api';

const FacultyDashboard = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [batchAnalytics, setBatchAnalytics] = useState(null);
  const [questionBankStats, setQuestionBankStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchDashboardData();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
      if (!selectedCourse && response.data.length > 0) {
        setSelectedCourse(response.data[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch courses');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [courseResponse, batchResponse, statsResponse] = await Promise.all([
        courseAPI.getById(selectedCourse),
        resultAPI.getBatchAnalytics(selectedCourse),
        questionBankAPI.getStats(selectedCourse)
      ]);

      setCourse(courseResponse.data);
      setBatchAnalytics(batchResponse.data);
      setQuestionBankStats(statsResponse.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestionBank = async (topics) => {
    try {
      setLoading(true);
      await questionBankAPI.generateBank({
        courseId: selectedCourse,
        topics,
        questionsPerTopic: 10,
        faculty: 'faculty-user'
      });
      
      // Refresh stats
      const statsResponse = await questionBankAPI.getStats(selectedCourse);
      setQuestionBankStats(statsResponse.data);
      
      alert('Question bank generated successfully!');
    } catch (err) {
      alert('Failed to generate question bank');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !course) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {course && (
        <>
          {/* Course Overview */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">{course.title}</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {batchAnalytics?.totalStudents || 0}
                </div>
                <div className="text-gray-600">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {batchAnalytics?.totalTests || 0}
                </div>
                <div className="text-gray-600">Tests Taken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {batchAnalytics?.averageScore || 0}%
                </div>
                <div className="text-gray-600">Class Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {questionBankStats?.stats?.length || 0}
                </div>
                <div className="text-gray-600">Topics Covered</div>
              </div>
            </div>
          </div>

          {/* Question Bank Management */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Question Bank</h3>
                <button
                  onClick={() => handleGenerateQuestionBank(course.syllabus.map(s => s.topic))}
                  disabled={loading}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  Generate Questions
                </button>
              </div>
              
              {questionBankStats?.stats ? (
                <div className="space-y-3">
                  {questionBankStats.stats.map((topicStat, index) => (
                    <div key={index} className="border border-gray-200 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{topicStat._id}</h4>
                        <span className="text-sm text-gray-500">
                          {topicStat.totalQuestions} questions
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {topicStat.difficulties.map((diff, idx) => (
                          <div key={idx} className="text-center">
                            <div className={`px-2 py-1 rounded text-xs ${
                              diff.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              diff.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {diff.difficulty}: {diff.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions in bank yet</p>
                  <p className="text-sm">Click "Generate Questions" to create question bank</p>
                </div>
              )}
            </div>

            {/* Class Performance by Topic */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Topic Performance</h3>
              {batchAnalytics?.topicPerformance?.length > 0 ? (
                <div className="space-y-3">
                  {batchAnalytics.topicPerformance.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{topic.topic}</span>
                          <span className="text-sm text-gray-600">
                            {topic.averageScore}% ({topic.totalAttempts} attempts)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              topic.averageScore >= 70 ? 'bg-green-500' :
                              topic.averageScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${topic.averageScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No performance data available
                </div>
              )}
            </div>
          </div>

          {/* Student Performance Table */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-4">Student Performance</h3>
            {batchAnalytics?.studentPerformance?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Student ID</th>
                      <th className="text-left py-2">Average Score</th>
                      <th className="text-left py-2">Tests Taken</th>
                      <th className="text-left py-2">Trend</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchAnalytics.studentPerformance.map((student, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 font-medium">{student.studentId}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            student.averageScore >= 70 ? 'bg-green-100 text-green-800' :
                            student.averageScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.averageScore}%
                          </span>
                        </td>
                        <td className="py-2">{student.totalTests}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            student.trend === 'improving' ? 'bg-green-100 text-green-800' :
                            student.trend === 'declining' ? 'bg-red-100 text-red-800' :
                            student.trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {student.trend}
                          </span>
                        </td>
                        <td className="py-2">
                          {student.averageScore >= 70 ? '🟢 Good' :
                           student.averageScore >= 50 ? '🟡 Needs Improvement' : '🔴 Requires Attention'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No student performance data available
              </div>
            )}
          </div>

          {/* Insights and Recommendations */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Insights & Recommendations</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Areas Needing Attention</h4>
                {batchAnalytics?.weakestTopics?.length > 0 ? (
                  <ul className="space-y-1">
                    {batchAnalytics.weakestTopics.map((topic, index) => (
                      <li key={index} className="text-blue-700 text-sm">
                        • {topic.topic} ({topic.averageScore}% class average)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-blue-700 text-sm">No specific weak areas identified</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Strong Areas</h4>
                {batchAnalytics?.strongestTopics?.length > 0 ? (
                  <ul className="space-y-1">
                    {batchAnalytics.strongestTopics.map((topic, index) => (
                      <li key={index} className="text-blue-700 text-sm">
                        • {topic.topic} ({topic.averageScore}% class average)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-blue-700 text-sm">Students are developing skills across all areas</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FacultyDashboard;