import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { assessmentAPI } from '../../services/api';

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, missed
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getAll();
      setAssessments(response.data?.data || mockAssessments);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setAssessments(mockAssessments);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for when API is not available
  const mockAssessments = [
    {
      id: '1',
      title: 'Data Structures Midterm',
      course: 'CS301 - Data Structures',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      totalMarks: 100,
      questionCount: 30,
      status: 'upcoming',
      attempted: false
    },
    {
      id: '2',
      title: 'Algorithms Quiz 3',
      course: 'CS302 - Algorithms',
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      totalMarks: 50,
      questionCount: 15,
      status: 'completed',
      attempted: true,
      score: 42,
      percentage: 84
    },
    {
      id: '3',
      title: 'Database Systems Final',
      course: 'CS303 - Database Systems',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      totalMarks: 150,
      questionCount: 40,
      status: 'active',
      attempted: false
    },
    {
      id: '4',
      title: 'OOP Concepts Test',
      course: 'CS304 - Object Oriented Programming',
      startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      totalMarks: 75,
      questionCount: 20,
      status: 'missed',
      attempted: false
    },
    {
      id: '5',
      title: 'Web Development Quiz',
      course: 'CS305 - Web Development',
      startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      totalMarks: 40,
      questionCount: 12,
      status: 'completed',
      attempted: true,
      score: 38,
      percentage: 95
    },
    {
      id: '6',
      title: 'Software Engineering Midterm',
      course: 'CS306 - Software Engineering',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      totalMarks: 100,
      questionCount: 25,
      status: 'upcoming',
      attempted: false
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'missed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'active': return <TrendingUp className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'missed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesFilter = filter === 'all' || assessment.status === filter;
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: assessments.length,
    upcoming: assessments.filter(a => a.status === 'upcoming').length,
    completed: assessments.filter(a => a.status === 'completed').length,
    active: assessments.filter(a => a.status === 'active').length,
    avgScore: assessments.filter(a => a.attempted).reduce((sum, a) => sum + (a.percentage || 0), 0) / assessments.filter(a => a.attempted).length || 0
  };

  return (
    <div className="min-h-screen bg-gray-50 page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Assessments</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and track all your assessments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Upcoming</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.upcoming}</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Avg Score</div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.avgScore.toFixed(0)}%</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'active', 'upcoming', 'completed', 'missed'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap text-xs sm:text-sm transition-colors ${
                    filter === filterOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-lg border border-gray-200 text-center">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No assessments found</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your filters or search query'
                : 'No assessments available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex-1">
                          {assessment.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm font-medium capitalize whitespace-nowrap ${getStatusColor(assessment.status)}`}>
                          {getStatusIcon(assessment.status)}
                          {assessment.status}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-3">{assessment.course}</p>
                      
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{formatDate(assessment.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{assessment.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{assessment.questionCount} questions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{assessment.totalMarks} marks</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Display for Completed */}
                  {assessment.status === 'completed' && assessment.attempted && (
                    <div className="mb-4 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base font-medium text-green-900">Your Score</span>
                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-bold text-green-700">
                            {assessment.score}/{assessment.totalMarks}
                          </div>
                          <div className="text-xs sm:text-sm text-green-600">
                            {assessment.percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {assessment.status === 'active' && !assessment.attempted && (
                      <Link
                        to={`/assessments/${assessment.id}/take`}
                        className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center text-sm sm:text-base"
                      >
                        Start Assessment
                      </Link>
                    )}
                    {assessment.status === 'upcoming' && (
                      <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base">
                        Set Reminder
                      </button>
                    )}
                    {assessment.status === 'completed' && assessment.attempted && (
                      <Link
                        to={`/results/${assessment.id}`}
                        className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center text-sm sm:text-base"
                      >
                        View Results
                      </Link>
                    )}
                    <Link
                      to={`/courses/${assessment.courseId || '1'}`}
                      className="flex-1 sm:flex-none border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center text-sm sm:text-base"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsPage;
