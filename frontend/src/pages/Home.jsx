import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Adaptive Assessment System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Automated, intelligent testing that adapts to each student's learning progress
        </p>
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">🔄 Simplified Automated Flow</h2>
          <p className="text-blue-800 text-sm">
            Faculty uploads syllabus → AI generates question bank → Students take adaptive tests → 
            System analyzes performance → Future tests automatically adapt to student needs
          </p>
        </div>
      </div>

      {/* User Type Selection */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Faculty Portal</h2>
            <p className="text-gray-600">
              Create courses, generate question banks, and analyze student performance
            </p>
          </div>
          <div className="space-y-3">
            <Link 
              to="/faculty-dashboard" 
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Faculty Dashboard
            </Link>
            <Link 
              to="/create-assessment" 
              className="block w-full bg-white text-blue-600 text-center py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-blue-200"
            >
              Create Assessment
            </Link>
            <Link 
              to="/courses" 
              className="block w-full bg-white text-blue-600 text-center py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-blue-200"
            >
              Manage Courses
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">👨‍🎓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h2>
            <p className="text-gray-600">
              Take adaptive tests and track your personalized learning progress
            </p>
          </div>
          <div className="space-y-3">
            <Link 
              to="/student-dashboard" 
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Student Dashboard
            </Link>
            <Link 
              to="/results" 
              className="block w-full bg-white text-green-600 text-center py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-green-200"
            >
              View Results
            </Link>
            <Link 
              to="/analytics" 
              className="block w-full bg-white text-green-600 text-center py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-green-200"
            >
              Learning Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* System Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-purple-500 text-3xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold mb-2">AI Question Banks</h3>
          <p className="text-gray-600 text-sm">
            Pre-generated question banks using Ollama LLaMA 3.2 for instant test creation
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-orange-500 text-3xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">Adaptive Testing</h3>
          <p className="text-gray-600 text-sm">
            Tests automatically adjust difficulty and topics based on student performance
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-blue-500 text-3xl mb-4">📈</div>
          <h3 className="text-lg font-semibold mb-2">Learning Analytics</h3>
          <p className="text-gray-600 text-sm">
            Track strengths, weaknesses, and learning patterns for personalized insights
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-green-500 text-3xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold mb-2">Automated Flow</h3>
          <p className="text-gray-600 text-sm">
            Minimal manual intervention - system handles test generation and adaptation
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-semibold mb-2">Upload Syllabus</h4>
            <p className="text-sm text-gray-600">Faculty creates course with detailed syllabus</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h4 className="font-semibold mb-2">AI Generates Bank</h4>
            <p className="text-sm text-gray-600">System creates question bank for all topics</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h4 className="font-semibold mb-2">Adaptive Testing</h4>
            <p className="text-sm text-gray-600">Students get personalized tests automatically</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">4</span>
            </div>
            <h4 className="font-semibold mb-2">Continuous Adaptation</h4>
            <p className="text-sm text-gray-600">System learns and adapts to each student</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <p className="text-gray-600 mb-6">Ready to experience adaptive learning?</p>
        <div className="space-x-4">
          <Link 
            to="/create-assessment" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Creating Assessments
          </Link>
          <Link 
            to="/student-dashboard" 
            className="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium"
          >
            View Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;