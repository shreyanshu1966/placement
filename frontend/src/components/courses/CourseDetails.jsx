import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Award, 
  Clock,
  FileText,
  CheckCircle2,
  PlayCircle,
  Download,
  MessageSquare,
  TrendingUp,
  Target
} from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock course data with complete information
  useEffect(() => {
    const mockCourse = {
      id: id || '1',
      title: 'Data Structures & Algorithms',
      code: 'CS301',
      instructor: 'Dr. Sarah Mitchell',
      instructorEmail: 'sarah.mitchell@university.edu',
      department: 'Computer Science',
      credits: 4,
      semester: 'Fall 2025',
      enrolledStudents: 156,
      maxCapacity: 200,
      rating: 4.7,
      totalRatings: 89,
      description: 'Master the fundamental concepts of data structures and algorithms essential for software development. This comprehensive course covers array manipulation, linked lists, trees, graphs, sorting algorithms, searching techniques, and computational complexity analysis.',
      prerequisites: ['CS101 - Programming Fundamentals', 'CS201 - Object-Oriented Programming'],
      learningObjectives: [
        'Understand and implement fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs',
        'Analyze time and space complexity of algorithms using Big O notation',
        'Design and implement efficient sorting and searching algorithms',
        'Apply data structures and algorithms to solve real-world programming problems',
        'Develop problem-solving skills for technical interviews and competitive programming'
      ],
      schedule: {
        lectures: 'Monday & Wednesday, 10:00 AM - 11:30 AM',
        lab: 'Friday, 2:00 PM - 4:00 PM',
        location: 'Engineering Building, Room 204',
        officeHours: 'Tuesday & Thursday, 3:00 PM - 5:00 PM'
      },
      syllabus: [
        {
          week: '1-2',
          title: 'Introduction & Arrays',
          topics: [
            'Course overview and expectations',
            'Algorithm analysis and Big O notation',
            'Array data structure and operations',
            'Dynamic arrays and resizing',
            'Two-pointer technique and sliding window'
          ],
          readings: 'Chapter 1-2',
          assignments: 'Lab 1: Array Manipulation'
        },
        {
          week: '3-4',
          title: 'Linked Lists',
          topics: [
            'Singly linked lists implementation',
            'Doubly linked lists',
            'Circular linked lists',
            'List reversal and manipulation',
            'Floyd\'s cycle detection algorithm'
          ],
          readings: 'Chapter 3',
          assignments: 'Lab 2: Linked List Operations'
        },
        {
          week: '5-6',
          title: 'Stacks & Queues',
          topics: [
            'Stack implementation and applications',
            'Queue implementation (linear and circular)',
            'Deque and priority queues',
            'Expression evaluation',
            'BFS and DFS introduction'
          ],
          readings: 'Chapter 4-5',
          assignments: 'Midterm Project'
        },
        {
          week: '7-8',
          title: 'Trees & Binary Search Trees',
          topics: [
            'Tree terminology and properties',
            'Binary tree traversals (inorder, preorder, postorder)',
            'Binary Search Tree operations',
            'AVL trees and balancing',
            'Tree applications and problems'
          ],
          readings: 'Chapter 6-7',
          assignments: 'Lab 3: Tree Implementation'
        },
        {
          week: '9-10',
          title: 'Heaps & Priority Queues',
          topics: [
            'Heap data structure',
            'Min-heap and max-heap operations',
            'Heap sort algorithm',
            'Priority queue applications',
            'Heapify and build heap'
          ],
          readings: 'Chapter 8',
          assignments: 'Lab 4: Heap Operations'
        },
        {
          week: '11-12',
          title: 'Sorting Algorithms',
          topics: [
            'Bubble, Selection, and Insertion sort',
            'Merge sort and Quick sort',
            'Counting sort and Radix sort',
            'Sorting algorithm comparison',
            'Stability and in-place sorting'
          ],
          readings: 'Chapter 9',
          assignments: 'Lab 5: Sorting Comparison'
        },
        {
          week: '13-14',
          title: 'Graphs & Advanced Topics',
          topics: [
            'Graph representations (adjacency matrix/list)',
            'Graph traversals (BFS, DFS)',
            'Shortest path algorithms (Dijkstra, Bellman-Ford)',
            'Minimum spanning tree (Kruskal, Prim)',
            'Dynamic programming introduction'
          ],
          readings: 'Chapter 10-11',
          assignments: 'Final Project'
        },
        {
          week: '15',
          title: 'Review & Final Exam',
          topics: [
            'Comprehensive review',
            'Problem-solving strategies',
            'Interview preparation tips',
            'Final exam preparation'
          ],
          readings: 'All chapters',
          assignments: 'Final Examination'
        }
      ],
      assessments: [
        { name: 'Lab Assignments (5)', weight: '25%', description: 'Weekly programming assignments' },
        { name: 'Midterm Examination', weight: '25%', description: 'Covers weeks 1-7' },
        { name: 'Final Project', weight: '20%', description: 'Comprehensive data structures project' },
        { name: 'Final Examination', weight: '25%', description: 'Cumulative final exam' },
        { name: 'Participation & Quizzes', weight: '5%', description: 'Class engagement and weekly quizzes' }
      ],
      resources: [
        {
          type: 'textbook',
          title: 'Introduction to Algorithms (4th Edition)',
          author: 'Cormen, Leiserson, Rivest, Stein',
          required: true
        },
        {
          type: 'video',
          title: 'MIT OpenCourseWare - Algorithms',
          link: 'https://ocw.mit.edu',
          required: false
        },
        {
          type: 'tool',
          title: 'LeetCode Practice Problems',
          description: 'For additional practice',
          required: false
        },
        {
          type: 'document',
          title: 'Course Lecture Slides',
          description: 'Available on course portal',
          required: true
        }
      ],
      announcements: [
        {
          date: '2025-11-05',
          title: 'Midterm Exam Schedule',
          content: 'Midterm examination will be held on November 18th. Review sessions scheduled for November 15th and 17th.'
        },
        {
          date: '2025-11-01',
          title: 'Office Hours Change',
          content: 'This week office hours moved to Wednesday 3-5 PM due to conference attendance.'
        },
        {
          date: '2025-10-28',
          title: 'Lab 3 Due Date Extended',
          content: 'Due to technical issues, Lab 3 deadline extended to November 3rd at 11:59 PM.'
        }
      ],
      progress: {
        completed: 45,
        total: 100,
        currentModule: 'Stacks & Queues',
        nextDeadline: 'Lab 3 - November 10, 2025'
      }
    };

    setCourse(mockCourse);
  }, [id]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {course.code}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {course.credits} Credits
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{course.semester}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>{course.enrolledStudents} / {course.maxCapacity} Enrolled</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Award
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(course.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/40'
                    }`}
                  />
                ))}
                <span className="ml-2 font-semibold">{course.rating}</span>
              </div>
              <span className="text-sm text-blue-100">({course.totalRatings} ratings)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm font-medium">{course.progress.completed}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-green-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${course.progress.completed}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-blue-100">
              Current: {course.progress.currentModule} • Next: {course.progress.nextDeadline}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {['overview', 'syllabus', 'assessments', 'resources', 'announcements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="card">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Course</h2>
                <p className="text-slate-600 leading-relaxed">{course.description}</p>
              </div>

              {/* Learning Objectives */}
              <div className="card">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Learning Objectives</h2>
                <div className="space-y-3">
                  {course.learningObjectives.map((obj, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-600">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="card">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Schedule</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Lectures</p>
                    <p className="text-slate-900">{course.schedule.lectures}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Lab Sessions</p>
                    <p className="text-slate-900">{course.schedule.lab}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Location</p>
                    <p className="text-slate-900">{course.schedule.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Office Hours</p>
                    <p className="text-slate-900">{course.schedule.officeHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Prerequisites */}
              <div className="card">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Prerequisites</h3>
                <div className="space-y-2">
                  {course.prerequisites.map((prereq, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <BookOpen className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <PlayCircle className="w-5 h-5" />
                    <span>Start Next Lesson</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    <Download className="w-5 h-5" />
                    <span>Download Syllabus</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span>Ask Question</span>
                  </button>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="card">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Instructor</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    SM
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{course.instructor}</p>
                    <p className="text-sm text-slate-500">{course.department}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{course.instructorEmail}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'syllabus' && (
          <div className="space-y-4">
            {course.syllabus.map((module, idx) => (
              <div key={idx} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Week {module.week}: {module.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{module.readings}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {module.week}
                  </span>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Topics Covered:</h4>
                  <ul className="space-y-1">
                    {module.topics.map((topic, topicIdx) => (
                      <li key={topicIdx} className="flex items-start space-x-2 text-slate-600">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm">
                    <span className="font-semibold text-slate-700">Assignment: </span>
                    <span className="text-slate-600">{module.assignments}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Grading Breakdown</h2>
              <div className="space-y-4">
                {course.assessments.map((assessment, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{assessment.name}</h3>
                        <span className="text-lg font-bold text-blue-600">{assessment.weight}</span>
                      </div>
                      <p className="text-sm text-slate-600">{assessment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Assessments</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Lab 3: Tree Implementation</p>
                      <p className="text-sm text-slate-600">Due: November 10, 2025</p>
                    </div>
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Midterm Examination</p>
                      <p className="text-sm text-slate-600">Date: November 18, 2025</p>
                    </div>
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Your Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600">Overall Grade</span>
                      <span className="text-lg font-bold text-green-600">A- (88%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Class Average:</span>
                    <span className="font-semibold">82%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Your Rank:</span>
                    <span className="font-semibold">12 / 156</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid md:grid-cols-2 gap-6">
            {course.resources.map((resource, idx) => (
              <div key={idx} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      resource.type === 'textbook' ? 'bg-blue-100' :
                      resource.type === 'video' ? 'bg-purple-100' :
                      resource.type === 'tool' ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      {resource.type === 'textbook' && <BookOpen className="w-5 h-5 text-blue-600" />}
                      {resource.type === 'video' && <PlayCircle className="w-5 h-5 text-purple-600" />}
                      {resource.type === 'tool' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {resource.type === 'document' && <FileText className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{resource.title}</h3>
                      {resource.author && (
                        <p className="text-sm text-slate-600">by {resource.author}</p>
                      )}
                    </div>
                  </div>
                  {resource.required && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Required
                    </span>
                  )}
                </div>
                {resource.description && (
                  <p className="text-sm text-slate-600">{resource.description}</p>
                )}
                {resource.link && (
                  <a
                    href={resource.link}
                    className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    <span>Access Resource</span>
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-4">
            {course.announcements.map((announcement, idx) => (
              <div key={idx} className="card">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{announcement.title}</h3>
                      <span className="text-sm text-slate-500">{announcement.date}</span>
                    </div>
                    <p className="text-slate-600">{announcement.content}</p>
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

export default CourseDetails;
