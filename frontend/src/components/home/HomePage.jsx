import { Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Users, 
  Award,
  BookOpen,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Menu,
  X
} from 'lucide-react';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white page-transition">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Navigation */}
          <nav className="flex justify-between items-center mb-8 sm:mb-12 lg:mb-16">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                AI Assessment
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-3 lg:space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm lg:text-base"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mb-6 p-4 bg-gray-50 rounded-lg fade-in">
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center pb-12 sm:pb-16 lg:pb-24">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>AI-Powered Learning Platform</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Smart Assessments for
                <span className="block text-blue-600 mt-2">
                  Better Learning
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                Adaptive testing powered by AI. Get personalized feedback, 
                track your progress, and achieve better learning outcomes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base sm:text-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center border-2 border-blue-600 text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-base sm:text-lg"
                >
                  View Demo
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-4 sm:pt-6 lg:pt-8">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">10K+</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Students</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">500+</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Educators</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">95%</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration - Hidden on mobile */}
            <div className="hidden lg:block relative">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-xl p-6 lg:p-8">
                <div className="bg-white rounded-lg p-4 lg:p-6 space-y-4">
                  {/* Mock Assessment Card */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Data Structures</div>
                      <div className="text-sm text-gray-500">20 Questions • 60 min</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress: 75%</span>
                      <span>15/20 Done</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">AI Assisted</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">12:30 Left</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-3 -left-3 bg-white p-2.5 lg:p-3 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900 text-sm">98%</span>
                </div>
              </div>

              <div className="absolute -bottom-3 -right-3 bg-white p-2.5 lg:p-3 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                  <span className="font-semibold text-gray-900 text-sm">+15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Powerful Features for Modern Learning
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, manage, and analyze assessments
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="p-5 sm:p-6 lg:p-8 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Questions</h3>
              <p className="text-gray-600 text-sm">
                Generate intelligent questions automatically using advanced AI models.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 sm:p-6 lg:p-8 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Adaptive Learning</h3>
              <p className="text-gray-600 text-sm">
                Adjusts difficulty based on performance. Personalized learning paths.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 sm:p-6 lg:p-8 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 text-sm">
                Deep insights into performance. Track progress and identify gaps.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 sm:p-6 lg:p-8 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real-Time Testing</h3>
              <p className="text-gray-600 text-sm">
                Auto-save answers and instant submission. Seamless experience.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 sm:p-6 lg:p-8 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Role-Based Access</h3>
              <p className="text-gray-600 text-sm">
                Separate dashboards for students, faculty, and admins.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 sm:p-6 lg:p-8 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Learning Assistant</h3>
              <p className="text-gray-600 text-sm">
                24/7 AI tutor. Get explanations and personalized help instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="absolute -top-4 left-6 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow">
                  1
                </div>
                <div className="pt-4">
                  <BookOpen className="w-10 h-10 text-blue-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Create Account</h3>
                  <p className="text-gray-600 text-sm">
                    Sign up as a student or faculty member. Set up your profile in minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200 hover:border-cyan-300 transition-colors">
                <div className="absolute -top-4 left-6 w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow">
                  2
                </div>
                <div className="pt-4">
                  <BarChart3 className="w-10 h-10 text-cyan-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Take Assessments</h3>
                  <p className="text-gray-600 text-sm">
                    Access courses, take assessments, and get feedback on your performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200 hover:border-green-300 transition-colors">
                <div className="absolute -top-4 left-6 w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow">
                  3
                </div>
                <div className="pt-4">
                  <Award className="w-10 h-10 text-green-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Track Progress</h3>
                  <p className="text-gray-600 text-sm">
                    Monitor your journey with detailed analytics and personalized insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              See what our users have to say
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-lg border border-gray-200">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                "Saves me hours of work creating assessments. The question variety is excellent."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  SJ
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900 text-sm">Dr. Sarah Johnson</div>
                  <div className="text-xs text-gray-600">CS Professor</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-lg border border-gray-200">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                "The adaptive learning really works! My grades have improved significantly."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  MC
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900 text-sm">Michael Chen</div>
                  <div className="text-xs text-gray-600">CS Student</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-lg border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                "Analytics dashboard is excellent! I can track every student's progress easily."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  RP
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900 text-sm">Rachel Patel</div>
                  <div className="text-xs text-gray-600">Math Instructor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8">
            Join thousands of students and educators today
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg font-semibold text-base sm:text-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base sm:text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                <span className="text-white font-bold text-base sm:text-lg">AI Assessment</span>
              </div>
              <p className="text-xs sm:text-sm">
                Modern assessments for better learning outcomes.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2025 AI Assessment Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
