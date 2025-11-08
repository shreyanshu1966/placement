import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Award,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Book,
  CheckCircle2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('semester');

  // Mock data
  const performanceData = [
    { month: 'Aug', score: 75, average: 70 },
    { month: 'Sep', score: 82, average: 75 },
    { month: 'Oct', score: 88, average: 78 },
    { month: 'Nov', score: 92, average: 80 },
  ];

  const courseScores = [
    { course: 'Data Structures', score: 92 },
    { course: 'Database Systems', score: 88 },
    { course: 'Web Development', score: 95 },
    { course: 'Operating Systems', score: 85 },
  ];

  const assessmentTypes = [
    { name: 'Assignments', value: 35, color: '#3b82f6' },
    { name: 'Quizzes', value: 20, color: '#8b5cf6' },
    { name: 'Midterms', value: 25, color: '#10b981' },
    { name: 'Finals', value: 20, color: '#f59e0b' },
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 6 },
    { day: 'Wed', hours: 5 },
    { day: 'Thu', hours: 7 },
    { day: 'Fri', hours: 3 },
    { day: 'Sat', hours: 2 },
    { day: 'Sun', hours: 1 },
  ];

  const topicMastery = [
    { topic: 'Arrays & Strings', mastery: 95 },
    { topic: 'Linked Lists', mastery: 90 },
    { topic: 'Trees & Graphs', mastery: 85 },
    { topic: 'Sorting Algorithms', mastery: 92 },
    { topic: 'Dynamic Programming', mastery: 78 },
  ];

  const recentAssessments = [
    { name: 'DS Lab 3', score: 92, outOf: 100, date: 'Nov 5', status: 'graded' },
    { name: 'DB Quiz 4', score: 18, outOf: 20, date: 'Nov 3', status: 'graded' },
    { name: 'Web Project 2', score: 95, outOf: 100, date: 'Nov 1', status: 'graded' },
    { name: 'OS Midterm', score: 85, outOf: 100, date: 'Oct 28', status: 'graded' },
  ];

  const stats = {
    overallGPA: 3.8,
    completedCourses: 12,
    totalCredits: 48,
    averageScore: 89,
    rank: '12 / 156',
    studyHours: 28,
    assessmentsPending: 3,
    streak: 14
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
              <p className="text-blue-100">Track your academic progress and achievements</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="week" className="text-slate-900">This Week</option>
              <option value="month" className="text-slate-900">This Month</option>
              <option value="semester" className="text-slate-900">This Semester</option>
              <option value="year" className="text-slate-900">This Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="text-sm font-medium text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +0.3
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.overallGPA}</p>
            <p className="text-sm text-slate-600">Overall GPA</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">Top 10%</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.averageScore}%</p>
            <p className="text-sm text-slate-600">Average Score</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-500" />
              <span className="text-sm font-medium text-slate-600">This Week</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.studyHours}h</p>
            <p className="text-sm text-slate-600">Study Time</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.streak}</p>
            <p className="text-sm text-slate-600">Day Streak</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Trend */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Performance Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Your Score"
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Class Average"
                    dot={{ fill: '#94a3b8', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Course Performance */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Course Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="course" stroke="#64748b" angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#64748b" domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Activity */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Weekly Study Hours</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-600">Total this week:</span>
                <span className="font-bold text-slate-900">{weeklyActivity.reduce((sum, d) => sum + d.hours, 0)} hours</span>
              </div>
            </div>

            {/* Topic Mastery */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Topic Mastery Levels</h2>
              <div className="space-y-4">
                {topicMastery.map((topic, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-900">{topic.topic}</span>
                      <span className="text-sm font-semibold text-slate-900">{topic.mastery}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          topic.mastery >= 90 ? 'bg-green-500' :
                          topic.mastery >= 80 ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${topic.mastery}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Assessment Distribution */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Assessment Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie
                    data={assessmentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                  >
                    {assessmentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {assessmentTypes.map((type, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                      <span className="text-slate-600">{type.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{type.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Assessments */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Assessments</h2>
              <div className="space-y-3">
                {recentAssessments.map((assessment, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{assessment.name}</h3>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {assessment.score}/{assessment.outOf}
                      </span>
                      <span className="text-sm text-slate-500">{assessment.date}</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(assessment.score / assessment.outOf) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-6">Additional Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <div className="flex items-center space-x-2">
                    <Book className="w-5 h-5" />
                    <span>Courses Completed</span>
                  </div>
                  <span className="font-bold">{stats.completedCourses}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Total Credits</span>
                  </div>
                  <span className="font-bold">{stats.totalCredits}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Class Rank</span>
                  </div>
                  <span className="font-bold">{stats.rank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Pending Tasks</span>
                  </div>
                  <span className="font-bold">{stats.assessmentsPending}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
