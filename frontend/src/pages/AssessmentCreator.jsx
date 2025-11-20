import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { courseAPI, questionBankAPI, assignmentAPI, authAPI } from '../services/api';

const AssessmentCreator = () => {
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get('courseId');
  
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(preselectedCourseId || '');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  
  // Proctoring configuration
  const [proctoringEnabled, setProctoringEnabled] = useState(false);
  const [proctoringConfig, setProctoringConfig] = useState({
    webcamRequired: true,
    screenRecording: true,
    audioMonitoring: false,
    faceDetection: true,
    eyeTracking: false,
    browserLockdown: true,
    preventCopyPaste: true,
    preventRightClick: true,
    preventTabSwitch: true,
    allowCalculator: false,
    allowNotes: false,
    maxSuspiciousActivities: 5,
    autoTerminateOnCritical: true,
    recordingQuality: 'medium'
  });
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [creationProgress, setCreationProgress] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchStudents(); // Fetch students immediately since they're not course-specific anymore
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      // Course selection logic without re-fetching students
      const course = courses.find(c => c._id === selectedCourse);
      if (course) {
        setSelectedTopics(course.syllabus.map(s => s.topic));
        setAssessmentTitle(`Assessment - ${course.title}`);
      }
    }
  }, [selectedCourse, courses]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await authAPI.getUsersByRole('student');
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students');
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedTopics([]);
    setSelectedStudents([]);
    
    const course = courses.find(c => c._id === courseId);
    if (course) {
      // Auto-select all topics
      setSelectedTopics(course.syllabus.map(s => s.topic));
      setAssessmentTitle(`Assessment - ${course.title}`);
    }
  };

  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(s => s !== studentId)
        : [...prev, studentId]
    );
  };

  const handlePreviewQuestions = async () => {
    if (!selectedCourse || selectedTopics.length === 0) {
      setError('Please select a course and at least one topic');
      return;
    }

    try {
      setPreviewing(true);
      setError('');
      setCreationProgress('Generating question preview...');

      const response = await assignmentAPI.previewQuestions({
        courseId: selectedCourse,
        selectedTopics,
        questionsPerTopic: 3
      });

      setPreviewQuestions(response.data.questions);
      setShowPreview(true);
      setCreationProgress('');
    } catch (err) {
      setError('Failed to generate question preview');
      console.error(err);
    } finally {
      setPreviewing(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedCourse || selectedTopics.length === 0 || selectedStudents.length === 0) {
      setError('Please select a course, topics, and students');
      return;
    }

    try {
      setCreating(true);
      setError('');
      setMessage('');
      setShowPreview(false);

      // Progress updates
      setCreationProgress('Checking question bank...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setCreationProgress('Generating questions with AI...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCreationProgress('Creating assignment...');

      // Create assignment for selected students
      await assignmentAPI.create({
        courseId: selectedCourse,
        selectedTopics,
        assignedStudents: selectedStudents,
        createdBy: 'faculty-user',
        title: assessmentTitle,
        proctorConfig: {
          enabled: proctoringEnabled,
          ...proctoringConfig
        }
      });

      setCreationProgress('');
      setMessage(`Successfully created assessment "${assessmentTitle}" for ${selectedStudents.length} students!`);
      
      // Reset form
      setSelectedCourse('');
      setSelectedTopics([]);
      setSelectedStudents([]);
      setAssessmentTitle('');
      setPreviewQuestions([]);
    } catch (err) {
      setCreationProgress('');
      setError('Failed to create assignment. Please check if the AI service is running and try again.');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateQuestionBank = async () => {
    if (!selectedCourse || selectedTopics.length === 0) {
      setError('Please select a course and at least one topic');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setMessage('');

      await questionBankAPI.generateBank({
        courseId: selectedCourse,
        topics: selectedTopics,
        questionsPerTopic: 10,
        faculty: 'faculty-user'
      });

      setMessage(`Successfully generated question bank for ${selectedTopics.length} topics! You can now create assignments.`);
    } catch (err) {
      setError('Failed to generate question bank. Please check if Ollama is running.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const selectedCourseData = courses.find(c => c._id === selectedCourse);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Assessment</h1>
        <p className="text-gray-600">
          Create assignments for specific students. Select course, topics, and students to generate personalized assessments.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {/* Step 1: Select Course */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Select Course</h2>
        
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No courses available</p>
            <Link 
              to="/courses/create"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Create Course First
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div 
                key={course._id}
                onClick={() => handleCourseSelect(course._id)}
                className={`border p-4 rounded-lg cursor-pointer transition-all ${
                  selectedCourse === course._id 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                <div className="text-sm text-gray-500">
                  {course.syllabus?.length || 0} topics • {course.faculty || 'No faculty assigned'}
                </div>
                {selectedCourse === course._id && (
                  <div className="mt-2">
                    <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Select Topics */}
      {selectedCourseData && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Select Topics for Assessment</h2>
          <p className="text-gray-600 mb-4">
            Choose which topics to include in the assessment.
          </p>

          <div className="mb-4">
            <button
              onClick={() => setSelectedTopics(
                selectedTopics.length === selectedCourseData.syllabus.length 
                  ? [] 
                  : selectedCourseData.syllabus.map(s => s.topic)
              )}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {selectedTopics.length === selectedCourseData.syllabus.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {selectedCourseData.syllabus.map((topic, index) => (
              <label 
                key={index}
                className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic.topic)}
                  onChange={() => handleTopicToggle(topic.topic)}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{topic.topic}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      topic.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  {topic.subtopics && topic.subtopics.length > 0 && (
                    <div className="mt-1 text-sm text-gray-600">
                      Subtopics: {topic.subtopics.join(', ')}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {selectedTopics.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>{selectedTopics.length} topics selected:</strong> {selectedTopics.join(', ')}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Approximately {selectedTopics.length * 3} questions per student
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Students */}
      {selectedCourse && selectedTopics.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 3: Select Students</h2>
          <p className="text-gray-600 mb-4">
            Choose which students should take this assessment.
          </p>

          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No students enrolled in this course</p>
              <div className="text-sm text-gray-400">
                Students need to be enrolled in the course to appear here
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <button
                  onClick={() => setSelectedStudents(
                    selectedStudents.length === students.length 
                      ? [] 
                      : students.map(s => s._id)
                  )}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedStudents.length} of {students.length} students selected
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <label 
                    key={student._id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleStudentToggle(student._id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">{student.studentId}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </div>
                  </label>
                ))}
              </div>

              {selectedStudents.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>{selectedStudents.length} students selected</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Each student will receive a personalized assessment with {selectedTopics.length * 3} questions
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Step 4: Proctoring Configuration */}
      {selectedCourse && selectedTopics.length > 0 && selectedStudents.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 4: Proctoring Configuration</h2>
          <p className="text-gray-600 mb-4">
            Configure proctoring settings for this assessment to ensure exam integrity.
          </p>

          {/* Enable Proctoring Toggle */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={proctoringEnabled}
                onChange={(e) => setProctoringEnabled(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
              />
              <div>
                <span className="font-medium text-gray-900">Enable Proctored Exam</span>
                <p className="text-sm text-gray-600">
                  Activate webcam monitoring, screen recording, and anti-cheating measures
                </p>
              </div>
            </label>
          </div>

          {/* Proctoring Settings */}
          {proctoringEnabled && (
            <div className="border-l-4 border-primary-500 pl-6 space-y-6">
              {/* Monitoring Features */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🎥 Monitoring Features</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.webcamRequired}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        webcamRequired: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Webcam Required</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.screenRecording}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        screenRecording: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Screen Recording</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.faceDetection}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        faceDetection: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Face Detection</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.audioMonitoring}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        audioMonitoring: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Audio Monitoring</span>
                  </label>
                </div>
              </div>

              {/* Security Restrictions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🔒 Security Restrictions</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.browserLockdown}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        browserLockdown: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Browser Lockdown</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.preventCopyPaste}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        preventCopyPaste: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Prevent Copy/Paste</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.preventRightClick}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        preventRightClick: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Prevent Right Click</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.preventTabSwitch}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        preventTabSwitch: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Prevent Tab Switching</span>
                  </label>
                </div>
              </div>

              {/* Allowed Tools */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🛠️ Allowed Tools</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.allowCalculator}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        allowCalculator: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Allow Calculator</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.allowNotes}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        allowNotes: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Allow Notes</span>
                  </label>
                </div>
              </div>

              {/* Advanced Settings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">⚙️ Advanced Settings</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Suspicious Activities
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={proctoringConfig.maxSuspiciousActivities}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        maxSuspiciousActivities: parseInt(e.target.value)
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recording Quality
                    </label>
                    <select
                      value={proctoringConfig.recordingQuality}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        recordingQuality: e.target.value
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">Low (faster upload)</option>
                      <option value="medium">Medium (balanced)</option>
                      <option value="high">High (best quality)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={proctoringConfig.autoTerminateOnCritical}
                      onChange={(e) => setProctoringConfig(prev => ({
                        ...prev,
                        autoTerminateOnCritical: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm">Auto-terminate on critical violations</span>
                  </label>
                </div>
              </div>

              {/* Proctoring Preview */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Proctoring Rules Preview</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <div>• Students will need to grant webcam and microphone access</div>
                  <div>• The exam will run in fullscreen mode (if browser lockdown is enabled)</div>
                  <div>• All activities will be recorded and monitored</div>
                  <div>• Suspicious activities will result in warnings or test termination</div>
                  <div>• Students will see real-time monitoring indicators during the exam</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Preview Questions & Create */}
      {selectedCourse && selectedTopics.length > 0 && selectedStudents.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 5: Preview & Create Assignment</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              value={assessmentTitle}
              onChange={(e) => setAssessmentTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter assignment title..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="text-blue-500 mr-3">ℹ️</div>
              <div>
                <h4 className="font-medium text-blue-800">Assignment Summary:</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• <strong>Course:</strong> {selectedCourseData.title}</li>
                  <li>• <strong>Topics:</strong> {selectedTopics.join(', ')}</li>
                  <li>• <strong>Students:</strong> {selectedStudents.length} selected</li>
                  <li>• <strong>Questions:</strong> ~{selectedTopics.length * 3} per student</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {creationProgress && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
                <span className="text-yellow-800">{creationProgress}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handlePreviewQuestions}
              disabled={previewing || creating || !selectedTopics.length}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {previewing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Preview...
                </div>
              ) : (
                'Preview Questions'
              )}
            </button>

            <button
              onClick={handleCreateAssignment}
              disabled={creating || previewing || !assessmentTitle.trim()}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Assignment...
                </div>
              ) : (
                'Create Assignment'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Question Preview Modal */}
      {showPreview && previewQuestions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Question Preview</h2>
          
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">
              Preview of {previewQuestions.length} questions that will be included in the assignment.
              These are either existing questions from the question bank or newly generated ones.
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-4">
            {previewQuestions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                  <div className="flex space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {question.topic}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-800 mb-3 font-medium">{question.question}</p>
                
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className={`p-2 rounded border ${
                        optIndex === question.correctAnswer 
                          ? 'bg-green-50 border-green-300 text-green-800' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className="font-mono text-sm mr-2">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      {option}
                      {optIndex === question.correctAnswer && (
                        <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close Preview
            </button>
            <button
              onClick={handleCreateAssignment}
              disabled={creating || !assessmentTitle.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              Create Assignment with These Questions
            </button>
          </div>
        </div>
      )}

      {/* Alternative: Generate Question Bank Only */}
      {selectedCourse && selectedTopics.length > 0 && selectedStudents.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Alternative: Generate Question Bank Only</h2>
          
          <div className="bg-yellow-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="text-yellow-500 mr-3">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800">Generate Question Bank:</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• This will create a reusable question bank for adaptive testing</li>
                  <li>• Students will automatically get personalized tests from this bank</li>
                  <li>• You can assign students later or let them take adaptive tests</li>
                  <li>• Make sure Ollama is running with llama3.2:1b model</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateQuestionBank}
            disabled={generating}
            className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Question Bank...
              </div>
            ) : (
              'Generate Question Bank Only'
            )}
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 text-center">
        <div className="space-x-4">
          <Link 
            to="/faculty-dashboard"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Faculty Dashboard
          </Link>
          <span className="text-gray-300">|</span>
          <Link 
            to="/courses"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Manage Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCreator;