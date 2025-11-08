import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, questionAPI, assessmentAPI, userAPI, aiAPI } from '../../services/api';
import { Card, LoadingSpinner, Button, Modal, Input, Select, Badge } from '../common/UIComponents';
import { BookOpen, HelpCircle, ClipboardList, Users, Plus, Sparkles, Edit, Trash2 } from 'lucide-react';
import { useModal, useForm } from '../../hooks/useCustomHooks';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    courses: [],
    questions: [],
    assessments: [],
    students: [],
  });

  const courseModal = useModal();
  const questionModal = useModal();
  const assessmentModal = useModal();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, questionsRes, assessmentsRes, studentsRes] = await Promise.all([
        courseAPI.getAll(),
        questionAPI.getAll({ limit: 20 }),
        assessmentAPI.getAll(),
        userAPI.getAll({ role: 'student' }),
      ]);

      setData({
        courses: coursesRes.data.data || [],
        questions: questionsRes.data.data || [],
        assessments: assessmentsRes.data.data || [],
        students: studentsRes.data.data || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const courseForm = useForm(
    { name: '', code: '', semester: '', credits: 3 },
    async (values) => {
      await courseAPI.create(values);
      courseModal.close();
      fetchDashboardData();
    }
  );

  const handleGenerateAIQuestions = async (courseId) => {
    try {
      await aiAPI.generateQuestions({ courseId, count: 10 });
      alert('AI questions generated successfully!');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to generate questions');
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
    { icon: BookOpen, label: 'My Courses', value: data.courses.length, color: 'bg-blue-500' },
    { icon: HelpCircle, label: 'Questions', value: data.questions.length, color: 'bg-green-500' },
    { icon: ClipboardList, label: 'Assessments', value: data.assessments.length, color: 'bg-purple-500' },
    { icon: Users, label: 'Students', value: data.students.length, color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage courses, questions, and assessments.</p>
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

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={courseModal.open} className="flex items-center justify-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Course</span>
          </Button>
          <Button
            onClick={() => navigate('/questions/create')}
            variant="secondary"
            className="flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Question</span>
          </Button>
          <Button
            onClick={() => navigate('/assessments/create')}
            variant="success"
            className="flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Assessment</span>
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Courses */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
            <Button onClick={courseModal.open} variant="secondary" className="text-sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {data.courses.map((course) => (
              <div
                key={course._id}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{course.code}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGenerateAIQuestions(course._id)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                      title="Generate AI Questions"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/courses/${course._id}/edit`)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Questions */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Question Bank</h2>
            <button
              onClick={() => navigate('/questions')}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {data.questions.slice(0, 5).map((question) => (
              <div
                key={question._id}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{question.text?.substring(0, 80)}...</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'danger'}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant="default">{question.type}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Assessments */}
      <Card className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Assessments</h2>
          <Button onClick={() => navigate('/assessments/create')} variant="primary" className="text-sm">
            <Plus className="w-4 h-4 mr-1" />
            Create New
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.assessments.map((assessment) => (
                <tr key={assessment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assessment.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {assessment.course?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assessment.questions?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assessment.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/assessments/${assessment._id}`)}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/assessments/${assessment._id}/results`)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Results
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Course Modal */}
      <Modal isOpen={courseModal.isOpen} onClose={courseModal.close} title="Create New Course">
        <form onSubmit={courseForm.handleSubmit} className="space-y-4">
          <Input
            label="Course Name"
            name="name"
            value={courseForm.values.name}
            onChange={courseForm.handleChange}
            error={courseForm.errors.name}
            required
          />
          <Input
            label="Course Code"
            name="code"
            value={courseForm.values.code}
            onChange={courseForm.handleChange}
            error={courseForm.errors.code}
            required
          />
          <Input
            label="Semester"
            name="semester"
            value={courseForm.values.semester}
            onChange={courseForm.handleChange}
            error={courseForm.errors.semester}
            required
          />
          <Input
            label="Credits"
            name="credits"
            type="number"
            value={courseForm.values.credits}
            onChange={courseForm.handleChange}
            error={courseForm.errors.credits}
            required
          />
          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={courseForm.loading} className="flex-1">
              {courseForm.loading ? 'Creating...' : 'Create Course'}
            </Button>
            <Button type="button" variant="secondary" onClick={courseModal.close}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyDashboard;
