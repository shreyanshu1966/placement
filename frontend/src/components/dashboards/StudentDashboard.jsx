import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, assessmentAPI, resultAPI, analyticsAPI } from '../../services/api';
import { Card, LoadingSpinner, Badge } from '../common/UIComponents';
import { BookOpen, Clock, TrendingUp, Award, Play, Eye } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    courses: [],
    assessments: [],
    recentResults: [],
    analytics: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, assessmentsRes, resultsRes, analyticsRes] = await Promise.all([
        courseAPI.getAll({ limit: 10 }),
        assessmentAPI.getAll({ limit: 5 }),
        resultAPI.getMyResults(),
        analyticsAPI.getDashboard(),
      ]);

      setData({
        courses: coursesRes.data.data || [],
        assessments: assessmentsRes.data.data || [],
        recentResults: resultsRes.data.data?.slice(0, 5) || [],
        analytics: analyticsRes.data.data || null,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      icon: BookOpen,
      label: 'Enrolled Courses',
      value: data.courses.length,
      color: 'bg-blue-500',
    },
    {
      icon: Clock,
      label: 'Pending Assessments',
      value: data.assessments.filter(a => !a.completed).length,
      color: 'bg-yellow-500',
    },
    {
      icon: TrendingUp,
      label: 'Average Score',
      value: data.analytics?.averageScore?.toFixed(1) || '0',
      color: 'bg-green-500',
    },
    {
      icon: Award,
      label: 'Tests Completed',
      value: data.recentResults.length,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your learning overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="flex items-center">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      {data.analytics?.performanceTrend && data.analytics.performanceTrend.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.analytics.performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Courses */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
            <button
              onClick={() => navigate('/courses')}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {data.courses.length > 0 ? (
              data.courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.code}</p>
                    </div>
                    <Badge variant="info">{course.semester}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No courses enrolled yet</p>
            )}
          </div>
        </Card>

        {/* Available Assessments */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Assessments</h2>
            <button
              onClick={() => navigate('/assessments')}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {data.assessments.length > 0 ? (
              data.assessments.map((assessment) => (
                <div
                  key={assessment._id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{assessment.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>{assessment.questions?.length || 0} Questions</span>
                        <span>•</span>
                        <span>{assessment.duration} min</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/assessments/${assessment._id}/take`)}
                      className="ml-4 flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No assessments available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Results */}
      <Card className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
          <button
            onClick={() => navigate('/results')}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            View All
          </button>
        </div>
        {data.recentResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.assessment?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.score}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={result.grade === 'A' || result.grade === 'B' ? 'success' : 'warning'}>
                        {result.grade}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/results/${result._id}`)}
                        className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No results yet. Start taking assessments!</p>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
