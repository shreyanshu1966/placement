import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { assignmentAPI, resultAPI, contextAPI, courseAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [studentContext, setStudentContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [generatingTest, setGeneratingTest] = useState(false);
  const [message, setMessage] = useState('');

  const studentId = user?.id || user?.studentId || 'demo-student';

  useEffect(() => {
    fetchDashboardData();
    
    // Check for success messages from test completion
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  }, [location.state]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch available courses
      const coursesResponse = await courseAPI.getAll();
      setCourses(coursesResponse.data);

      // Fetch assignments assigned to this student
      const assignmentsResponse = await assignmentAPI.getAll(studentId);
      setAssignments(assignmentsResponse.data);

      // Fetch recent results
      const resultsResponse = await resultAPI.getByStudent(studentId);
      setRecentResults(resultsResponse.data.slice(0, 5));

      // Fetch student context
      try {
        const contextResponse = await contextAPI.get(studentId);
        setStudentContext(contextResponse.data);
      } catch (err) {
        // Context might not exist yet
        console.log('No context found for student');
      }

      // Get AI recommendations for each course
      const recommendationsData = [];
      for (const course of coursesResponse.data) {
        try {
          const recommendation = await contextAPI.getRecommendation(studentId, course._id);
          recommendationsData.push({
            courseId: course._id,
            courseTitle: course.title,
            ...recommendation.data
          });
        } catch (err) {
          console.log(`No recommendation for course ${course._id}`);
        }
      }
      setRecommendations(recommendationsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAdaptiveTest = async (courseId) => {
    try {
      setGeneratingTest(true);
      
      // Generate adaptive assignment based on student context
      const response = await assignmentAPI.generate({
        courseId,
        studentId,
        adaptive: true
      });

      if (response.data && response.data._id) {
        // Redirect to assignment
        window.location.href = `/assignment/${response.data._id}`;
      }
    } catch (error) {
      console.error('Error generating adaptive test:', error);
      alert('Failed to generate test. Please try again.');
    } finally {
      setGeneratingTest(false);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Success/Info Messages */}
      {message && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <div className="flex justify-between items-center">
            <span>{message}</span>
            <button 
              onClick={() => setMessage('')}
              className="text-green-600 hover:text-green-800 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name || 'Student'}!
        </h1>
        <p className="text-gray-600">
          AI-powered adaptive learning tailored to your progress and learning style
        </p>
      </div>

      {/* Learning Profile Summary */}
      {studentContext && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Learning Profile</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {studentContext.averageScore?.toFixed(1) || 'N/A'}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {studentContext.totalAssignments || 0}
              </div>
              <div className="text-sm text-gray-600">Tests Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 capitalize">
                {studentContext.learningStyle || 'Analyzing...'}
              </div>
              <div className="text-sm text-gray-600">Learning Style</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 capitalize">
                {studentContext.preferredDifficulty || 'Medium'}
              </div>
              <div className="text-sm text-gray-600">Comfort Level</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Assigned Assessments */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">📋 Your Assignments</h2>
            
            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No assignments assigned to you yet</p>
                <div className="text-sm text-gray-400">
                  Your instructor will assign assessments that will appear here
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {assignment.courseId?.title} • {assignment.questionsGenerated?.length || 0} questions
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created {new Date(assignment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {assignment.proctorConfig?.enabled && (
                          <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                            Proctored
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${
                          assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {assignment.status === 'generated' ? 'Available' : assignment.status}
                        </span>
                        {assignment.status === 'generated' && (
                          <Link 
                            to={assignment.proctorConfig?.enabled ? `/proctored-test/${assignment._id}` : `/test/${assignment._id}`}
                            className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors"
                          >
                            {assignment.proctorConfig?.enabled ? 'Start Proctored Test' : 'Start Test'}
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {assignment.selectedTopics && assignment.selectedTopics.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Topics:</div>
                        <div className="flex flex-wrap gap-1">
                          {assignment.selectedTopics.map((topic, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {assignment.adaptiveReason && (
                      <div className="text-sm text-gray-600 italic">
                        "{assignment.adaptiveReason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">🎯 AI Recommendations</h2>
            
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Take your first test to get personalized recommendations!</p>
                <div className="space-y-2">
                  {courses.map(course => (
                    <button
                      key={course._id}
                      onClick={() => handleGenerateAdaptiveTest(course._id)}
                      disabled={generatingTest}
                      className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-gray-600">Start adaptive assessment</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{rec.courseTitle}</h3>
                        <p className="text-gray-600 text-sm">{rec.reasoning}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyBadge(rec.suggestedDifficulty)}`}>
                        {rec.suggestedDifficulty}
                      </span>
                    </div>
                    
                    {rec.focusTopics && rec.focusTopics.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Focus Areas:</div>
                        <div className="flex flex-wrap gap-1">
                          {rec.focusTopics.map((topic, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleGenerateAdaptiveTest(rec.courseId)}
                      disabled={generatingTest}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingTest ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </div>
                      ) : (
                        'Take Adaptive Test'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Courses */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">📚 Available Courses</h2>
            
            {courses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No courses available yet</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map(course => (
                  <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      {course.syllabus?.length || 0} topics • Faculty: {course.faculty || 'TBD'}
                    </div>
                    <button
                      onClick={() => handleGenerateAdaptiveTest(course._id)}
                      disabled={generatingTest}
                      className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                    >
                      Quick Test
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">📊 Recent Performance</h2>
            
            {recentResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No test results yet</p>
            ) : (
              <div className="space-y-3">
                {recentResults.map((result, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Test {index + 1}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-sm font-medium ${getPerformanceColor(result.score)}`}>
                      {result.score}%
                    </div>
                  </div>
                ))}
                <Link 
                  to="/results"
                  className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium mt-3"
                >
                  View All Results
                </Link>
              </div>
            )}
          </div>

          {/* Learning Insights */}
          {studentContext && studentContext.weakTopics && studentContext.weakTopics.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">💡 Learning Insights</h2>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-red-700 mb-2">Areas to Improve:</h4>
                  <div className="space-y-1">
                    {studentContext.weakTopics.slice(0, 3).map((topic, idx) => (
                      <div key={idx} className="text-sm text-gray-600 bg-red-50 px-2 py-1 rounded">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>

                {studentContext.strongTopics && studentContext.strongTopics.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-green-700 mb-2">Strengths:</h4>
                    <div className="space-y-1">
                      {studentContext.strongTopics.slice(0, 3).map((topic, idx) => (
                        <div key={idx} className="text-sm text-gray-600 bg-green-50 px-2 py-1 rounded">
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">⚡ Quick Actions</h2>
            <div className="space-y-2">
              <Link 
                to="/courses"
                className="block w-full text-center bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors text-sm"
              >
                Browse Courses
              </Link>
              <Link 
                to="/results"
                className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                View All Results
              </Link>
              <Link 
                to="/analytics"
                className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Learning Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;