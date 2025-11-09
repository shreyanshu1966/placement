import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { courseAPI, assignmentAPI } from '../services/api';

const AssignmentGenerate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get('courseId');

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    courseId: preselectedCourseId || '',
    studentId: 'student-001', // Default student ID for MVP
    customTopics: [],
    difficulty: 'medium',
    questionsPerTopic: 3
  });

  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      const course = courses.find(c => c._id === formData.courseId);
      setSelectedCourse(course);
    }
  }, [formData.courseId, courses]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTopicToggle = (topic) => {
    setFormData(prev => ({
      ...prev,
      customTopics: prev.customTopics.includes(topic)
        ? prev.customTopics.filter(t => t !== topic)
        : [...prev.customTopics, topic]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await assignmentAPI.generate(formData);
      navigate(`/assignment/${response.data._id}`);
    } catch (err) {
      setError('Failed to generate assignment. Please check if Ollama is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Generate Assignment</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Assignment Configuration</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course *
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="student-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Questions per Topic
              </label>
              <select
                name="questionsPerTopic"
                value={formData.questionsPerTopic}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="2">2 questions</option>
                <option value="3">3 questions</option>
                <option value="5">5 questions</option>
              </select>
            </div>
          </div>
        </div>

        {selectedCourse && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Select Topics (Optional)</h2>
            <p className="text-gray-600 mb-4">
              Leave empty to auto-select topics based on student's context, or manually select specific topics:
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedCourse.syllabus.map((item, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.customTopics.includes(item.topic)}
                    onChange={() => handleTopicToggle(item.topic)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{item.topic}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.difficulty}
                  </span>
                </label>
              ))}
            </div>

            {formData.customTopics.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Selected topics: {formData.customTopics.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AI Configuration</h2>
          <div className="bg-yellow-50 p-4 rounded-md mb-4">
            <div className="flex">
              <div className="text-yellow-500 mr-3">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800">Ollama Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Make sure Ollama is running with the llama3.2:1b model. 
                  Questions will be generated using AI based on the selected topics and difficulty level.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>AI analyzes the student's learning context (strengths/weaknesses)</li>
              <li>Generates personalized questions based on course syllabus</li>
              <li>Focuses on areas where the student needs improvement</li>
              <li>Creates industry-relevant questions for placement preparation</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.courseId}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentGenerate;