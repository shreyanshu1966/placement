import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Award,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');

  const courses = [
    {
      id: 1,
      title: 'Data Structures & Algorithms',
      code: 'CS301',
      department: 'Computer Science',
      instructor: 'Dr. Sarah Mitchell',
      credits: 4,
      enrolled: 156,
      capacity: 200,
      rating: 4.7,
      semester: 'Fall 2025',
      description: 'Master fundamental data structures and algorithms essential for software development.',
      progress: 45,
      status: 'enrolled',
      nextClass: 'Mon, Nov 11, 10:00 AM'
    },
    {
      id: 2,
      title: 'Database Management Systems',
      code: 'CS302',
      department: 'Computer Science',
      instructor: 'Prof. Michael Chen',
      credits: 3,
      enrolled: 142,
      capacity: 180,
      rating: 4.5,
      semester: 'Fall 2025',
      description: 'Learn database design, SQL, normalization, and transaction management.',
      progress: 62,
      status: 'enrolled',
      nextClass: 'Tue, Nov 12, 2:00 PM'
    },
    {
      id: 3,
      title: 'Web Development',
      code: 'CS205',
      department: 'Computer Science',
      instructor: 'Dr. Emily Rodriguez',
      credits: 3,
      enrolled: 178,
      capacity: 200,
      rating: 4.8,
      semester: 'Fall 2025',
      description: 'Build modern web applications using HTML, CSS, JavaScript, and React.',
      progress: 38,
      status: 'enrolled',
      nextClass: 'Wed, Nov 13, 11:00 AM'
    },
    {
      id: 4,
      title: 'Machine Learning',
      code: 'CS401',
      department: 'Computer Science',
      instructor: 'Dr. James Wilson',
      credits: 4,
      enrolled: 98,
      capacity: 120,
      rating: 4.9,
      semester: 'Fall 2025',
      description: 'Explore machine learning algorithms, neural networks, and AI applications.',
      progress: 0,
      status: 'available',
      nextClass: null
    },
    {
      id: 5,
      title: 'Operating Systems',
      code: 'CS303',
      department: 'Computer Science',
      instructor: 'Prof. Linda Thompson',
      credits: 4,
      enrolled: 134,
      capacity: 160,
      rating: 4.6,
      semester: 'Fall 2025',
      description: 'Understand OS concepts including processes, threads, memory management.',
      progress: 55,
      status: 'enrolled',
      nextClass: 'Thu, Nov 14, 9:00 AM'
    },
    {
      id: 6,
      title: 'Computer Networks',
      code: 'CS304',
      department: 'Computer Science',
      instructor: 'Dr. Robert Garcia',
      credits: 3,
      enrolled: 121,
      capacity: 150,
      rating: 4.4,
      semester: 'Fall 2025',
      description: 'Study network protocols, architecture, and security fundamentals.',
      progress: 0,
      status: 'available',
      nextClass: null
    }
  ];

  const departments = ['all', 'Computer Science', 'Mathematics', 'Engineering'];
  const semesters = ['all', 'Fall 2025', 'Spring 2026', 'Summer 2026'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    const matchesSemester = selectedSemester === 'all' || course.semester === selectedSemester;
    return matchesSearch && matchesDepartment && matchesSemester;
  });

  const enrolledCourses = filteredCourses.filter(c => c.status === 'enrolled');
  const availableCourses = filteredCourses.filter(c => c.status === 'available');

  return (
    <div className="min-h-screen bg-gray-50 page-transition">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Courses</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and explore your academic courses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="flex-1 sm:flex-none">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {semesters.map(sem => (
                  <option key={sem} value={sem}>
                    {sem === 'all' ? 'All Semesters' : sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Enrolled Courses</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{enrolledCourses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Credits</p>
                <p className="text-3xl font-bold text-slate-900">
                  {enrolledCourses.reduce((sum, c) => sum + c.credits, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Progress</p>
                <p className="text-3xl font-bold text-slate-900">
                  {Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Available</p>
                <p className="text-3xl font-bold text-slate-900">{availableCourses.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Enrolled Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {course.code}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-semibold text-slate-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-200">
                      <div className="flex items-center space-x-1 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span>{course.enrolled}/{course.capacity}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-slate-900">{course.rating}</span>
                      </div>
                    </div>

                    {course.nextClass && (
                      <div className="mt-3 flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span>Next: {course.nextClass}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        {availableCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map(course => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {course.code}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Instructor</span>
                        <span className="font-medium text-slate-900">{course.instructor}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Credits</span>
                        <span className="font-medium text-slate-900">{course.credits}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-200 mb-4">
                      <div className="flex items-center space-x-1 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span>{course.enrolled}/{course.capacity}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-slate-900">{course.rating}</span>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Enroll Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
