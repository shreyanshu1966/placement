import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';

const CourseCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    faculty: '',
    syllabus: [{ topic: '', subtopics: [''], difficulty: 'medium' }]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSyllabusChange = (index, field, value) => {
    const newSyllabus = [...formData.syllabus];
    newSyllabus[index][field] = value;
    setFormData(prev => ({
      ...prev,
      syllabus: newSyllabus
    }));
  };

  const handleSubtopicChange = (syllabusIndex, subtopicIndex, value) => {
    const newSyllabus = [...formData.syllabus];
    newSyllabus[syllabusIndex].subtopics[subtopicIndex] = value;
    setFormData(prev => ({
      ...prev,
      syllabus: newSyllabus
    }));
  };

  const addSyllabusItem = () => {
    setFormData(prev => ({
      ...prev,
      syllabus: [...prev.syllabus, { topic: '', subtopics: [''], difficulty: 'medium' }]
    }));
  };

  const removeSyllabusItem = (index) => {
    if (formData.syllabus.length > 1) {
      const newSyllabus = formData.syllabus.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        syllabus: newSyllabus
      }));
    }
  };

  const addSubtopic = (syllabusIndex) => {
    const newSyllabus = [...formData.syllabus];
    newSyllabus[syllabusIndex].subtopics.push('');
    setFormData(prev => ({
      ...prev,
      syllabus: newSyllabus
    }));
  };

  const removeSubtopic = (syllabusIndex, subtopicIndex) => {
    const newSyllabus = [...formData.syllabus];
    if (newSyllabus[syllabusIndex].subtopics.length > 1) {
      newSyllabus[syllabusIndex].subtopics = newSyllabus[syllabusIndex].subtopics.filter((_, i) => i !== subtopicIndex);
      setFormData(prev => ({
        ...prev,
        syllabus: newSyllabus
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Filter out empty topics and subtopics
      const cleanedSyllabus = formData.syllabus
        .filter(item => item.topic.trim())
        .map(item => ({
          ...item,
          subtopics: item.subtopics.filter(sub => sub.trim())
        }));

      const courseData = {
        ...formData,
        syllabus: cleanedSyllabus
      };

      await courseAPI.create(courseData);
      navigate('/courses');
    } catch (err) {
      setError('Failed to create course. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Course</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Course Information</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Data Structures and Algorithms"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faculty Name
              </label>
              <input
                type="text"
                name="faculty"
                value={formData.faculty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Dr. Smith"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Brief description of the course"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Syllabus</h2>
            <button
              type="button"
              onClick={addSyllabusItem}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Add Topic
            </button>
          </div>

          <div className="space-y-6">
            {formData.syllabus.map((item, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">Topic {index + 1}</h3>
                  {formData.syllabus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSyllabusItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic Name *
                    </label>
                    <input
                      type="text"
                      value={item.topic}
                      onChange={(e) => handleSyllabusChange(index, 'topic', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Arrays and Strings"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={item.difficulty}
                      onChange={(e) => handleSyllabusChange(index, 'difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Subtopics
                    </label>
                    <button
                      type="button"
                      onClick={() => addSubtopic(index)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Add Subtopic
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {item.subtopics.map((subtopic, subtopicIndex) => (
                      <div key={subtopicIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={subtopic}
                          onChange={(e) => handleSubtopicChange(index, subtopicIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., Array traversal, Two-pointer technique"
                        />
                        {item.subtopics.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubtopic(index, subtopicIndex)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseCreate;