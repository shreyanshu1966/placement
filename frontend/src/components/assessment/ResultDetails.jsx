import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  ArrowLeft,
  Download,
  BarChart3
} from 'lucide-react';
import { resultAPI } from '../../services/api';

const ResultDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResultDetails();
  }, [id]);

  const fetchResultDetails = async () => {
    try {
      setLoading(true);
      const response = await resultAPI.getById(id);
      setResult(response.data?.data || mockResult);
    } catch (error) {
      console.error('Error fetching result:', error);
      setResult(mockResult);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockResult = {
    id: id,
    assessmentTitle: 'Data Structures Midterm',
    courseName: 'CS301 - Data Structures',
    studentName: 'John Doe',
    submittedAt: new Date().toISOString(),
    score: 78,
    totalMarks: 100,
    percentage: 78,
    timeTaken: 82,
    totalTime: 90,
    grade: 'B+',
    status: 'passed',
    correctAnswers: 23,
    wrongAnswers: 5,
    skipped: 2,
    totalQuestions: 30,
    topicPerformance: [
      { topic: 'Arrays & Strings', score: 8, total: 10, percentage: 80 },
      { topic: 'Linked Lists', score: 7, total: 8, percentage: 87.5 },
      { topic: 'Stacks & Queues', score: 5, total: 7, percentage: 71.4 },
      { topic: 'Trees', score: 3, total: 5, percentage: 60 }
    ],
    questions: [
      {
        id: 'q1',
        text: 'What is the time complexity of binary search?',
        userAnswer: 'O(log n)',
        correctAnswer: 'O(log n)',
        isCorrect: true,
        points: 3,
        topic: 'Algorithms',
        explanation: 'Binary search divides the search space in half at each step, resulting in O(log n) complexity.'
      },
      {
        id: 'q2',
        text: 'Which data structure uses LIFO principle?',
        userAnswer: 'Queue',
        correctAnswer: 'Stack',
        isCorrect: false,
        points: 0,
        topic: 'Stacks & Queues',
        explanation: 'Stack follows Last In First Out (LIFO) principle, while Queue follows FIFO.'
      },
      {
        id: 'q3',
        text: 'In a linked list, what does the head pointer point to?',
        userAnswer: 'First node',
        correctAnswer: 'First node',
        isCorrect: true,
        points: 2,
        topic: 'Linked Lists',
        explanation: 'The head pointer in a linked list points to the first node of the list.'
      }
    ],
    classAverage: 72,
    rank: 12,
    totalStudents: 45,
    feedback: 'Good performance! Focus more on tree data structures to improve further.',
    strengths: ['Arrays & Strings', 'Linked Lists'],
    weaknesses: ['Trees', 'Graph Algorithms']
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h2>
          <p className="text-gray-600 mb-6">The result you're looking for doesn't exist.</p>
          <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-600 bg-green-100';
    if (grade === 'B+' || grade === 'B') return 'text-blue-600 bg-blue-100';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {result.assessmentTitle}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">{result.courseName}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap self-start sm:self-auto">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-8 h-8 text-blue-600" />
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(result.grade)}`}>
                {result.grade}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
              {result.score}/{result.totalMarks}
            </div>
            <div className="text-sm text-gray-600">Total Score ({result.percentage}%)</div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
              {result.correctAnswers}/{result.totalQuestions}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
              {result.timeTaken}m
            </div>
            <div className="text-sm text-gray-600">Time Taken (out of {result.totalTime}m)</div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
              #{result.rank}
            </div>
            <div className="text-sm text-gray-600">Class Rank (of {result.totalStudents})</div>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Performance Comparison</h2>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Score</span>
                <span className="text-sm font-bold text-blue-600">{result.percentage}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${result.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Class Average</span>
                <span className="text-sm font-bold text-gray-600">{result.classAverage}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${result.classAverage}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            {result.percentage > result.classAverage ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">
                  {(result.percentage - result.classAverage).toFixed(1)}% above class average
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium">
                  {(result.classAverage - result.percentage).toFixed(1)}% below class average
                </span>
              </>
            )}
          </div>
        </div>

        {/* Topic-wise Performance */}
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Topic-wise Performance</h2>
          <div className="space-y-4">
            {result.topicPerformance.map((topic, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {topic.score}/{topic.total} ({topic.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      topic.percentage >= 80 ? 'bg-green-600' :
                      topic.percentage >= 60 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${topic.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-green-50 p-5 sm:p-6 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-green-900">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-green-900">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 p-5 sm:p-6 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-red-900">Areas to Improve</h3>
            </div>
            <ul className="space-y-2">
              {result.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-red-900">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Feedback */}
        {result.feedback && (
          <div className="bg-blue-50 p-5 sm:p-6 rounded-lg border border-blue-200 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-900">AI Insights</h3>
            </div>
            <p className="text-sm sm:text-base text-blue-900">{result.feedback}</p>
          </div>
        )}

        {/* Question-by-Question Review */}
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Question Review</h2>
          <div className="space-y-6">
            {result.questions.map((question, index) => (
              <div
                key={question.id}
                className={`p-4 sm:p-5 rounded-lg border-2 ${
                  question.isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${
                    question.isCorrect ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {question.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <XCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Question {index + 1}</span>
                      <span className="text-xs font-medium text-gray-600">{question.points} points</span>
                    </div>
                    <p className="text-sm sm:text-base font-medium text-gray-900 mb-3">{question.text}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Your Answer: </span>
                        <span className={question.isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {question.userAnswer}
                        </span>
                      </div>
                      {!question.isCorrect && (
                        <div>
                          <span className="font-medium text-gray-700">Correct Answer: </span>
                          <span className="text-green-700">{question.correctAnswer}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200">
                        <span className="font-medium text-gray-700">Explanation: </span>
                        <span className="text-gray-600">{question.explanation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            to={`/courses/${result.courseId || '1'}`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            Go to Course
          </Link>
          <Link
            to="/analytics"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultDetails;
