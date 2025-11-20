import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assignmentAPI, courseAPI } from '../services/api';

const AssignmentManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchAssignments();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getAll();
      let filteredAssignments = response.data;
      
      if (selectedCourse) {
        filteredAssignments = response.data.filter(
          assignment => assignment.courseId?._id === selectedCourse
        );
      }
      
      setAssignments(filteredAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await assignmentAPI.delete(assignmentId);
      setAssignments(assignments.filter(a => a._id !== assignmentId));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Failed to delete assignment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor your assessments</p>
        </div>
        <Link 
          to="/create-assessment"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create New Assessment
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 min-w-48"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Assignments Grid */}
      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCourse ? 'No assignments for the selected course.' : 'Get started by creating a new assessment.'}
            </p>
            <div className="mt-6">
              <Link
                to="/create-assessment"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Create Assessment
              </Link>
            </div>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                    {assignment.proctorConfig?.enabled && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                        Proctored
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">
                    Course: {assignment.courseId?.title || 'Unknown Course'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Questions: {assignment.questionsGenerated?.length || 0} | 
                    Created: {new Date(assignment.createdAt).toLocaleDateString()} |
                    Students: {assignment.assignedStudents?.length || 0}
                  </p>
                  {assignment.selectedTopics && assignment.selectedTopics.length > 0 && (
                    <div className="mt-3">
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
                </div>
                
                <div className="flex flex-col space-y-2 ml-6">
                  {assignment.proctorConfig?.enabled && (
                    <Link
                      to={`/proctoring/${assignment._id}`}
                      className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors text-center"
                    >
                      Proctoring Monitor
                    </Link>
                  )}
                  <Link
                    to={`/assignment/${assignment._id}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors text-center"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => deleteAssignment(assignment._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Assignment Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {assignment.completions || 0}
                  </div>
                  <div className="text-xs text-gray-500">Completions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {assignment.averageScore ? `${assignment.averageScore}%` : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {assignment.averageTime ? `${assignment.averageTime}m` : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Avg Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {assignment.proctorConfig?.enabled ? 
                      (assignment.suspiciousActivities || 0) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Suspicious</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentManagement;