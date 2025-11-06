import Course from '../models/Course.js';
import User from '../models/User.js';

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Private
 */
export const getCourses = async (req, res, next) => {
  try {
    const {
      department,
      semester,
      faculty,
      academicYear,
      isActive,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (faculty) query.faculty = faculty;
    if (academicYear) query.academicYear = academicYear;
    if (isActive) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // If student, show only their enrolled courses or courses for their semester
    if (req.user.role === 'student') {
      query.$or = [
        { 'studentsEnrolled.student': req.user._id },
        { semester: req.user.semester, department: req.user.department }
      ];
    }

    // If faculty, show only their courses
    if (req.user.role === 'faculty') {
      query.faculty = req.user._id;
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .populate('faculty', 'name email department')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Private
 */
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'name email department')
      .populate('studentsEnrolled.student', 'name email rollNumber');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Private/Faculty/Admin
 */
export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      code,
      description,
      department,
      semester,
      credits,
      syllabus,
      learningOutcomes,
      references,
      academicYear
    } = req.body;

    // Set faculty as creator if not admin
    const facultyId = req.user.role === 'admin' && req.body.faculty
      ? req.body.faculty
      : req.user._id;

    const course = await Course.create({
      title,
      code,
      description,
      department,
      semester,
      credits,
      faculty: facultyId,
      syllabus,
      learningOutcomes,
      references,
      academicYear
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private/Faculty/Admin
 */
export const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the faculty or admin
    if (
      req.user.role !== 'admin' &&
      course.faculty.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enroll student in course
 * @route   POST /api/courses/:id/enroll
 * @access  Private/Student/Admin
 */
export const enrollStudent = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get student ID (from body if admin, or current user if student)
    const studentId = req.user.role === 'admin' && req.body.studentId
      ? req.body.studentId
      : req.user._id;

    // Check if already enrolled
    const alreadyEnrolled = course.studentsEnrolled.some(
      enrollment => enrollment.student.toString() === studentId.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Student already enrolled in this course'
      });
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Enroll student
    course.studentsEnrolled.push({
      student: studentId,
      progress: 0,
      completedTopics: []
    });

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Student enrolled successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student progress in course
 * @route   PUT /api/courses/:id/progress
 * @access  Private/Student/Faculty/Admin
 */
export const updateProgress = async (req, res, next) => {
  try {
    const { studentId, completedTopics, progress } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Determine which student to update
    const targetStudentId = studentId || req.user._id;

    // Find student enrollment
    const enrollmentIndex = course.studentsEnrolled.findIndex(
      enrollment => enrollment.student.toString() === targetStudentId.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not enrolled in this course'
      });
    }

    // Update progress
    if (completedTopics) {
      course.studentsEnrolled[enrollmentIndex].completedTopics = completedTopics;
    }
    if (typeof progress !== 'undefined') {
      course.studentsEnrolled[enrollmentIndex].progress = progress;
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: course.studentsEnrolled[enrollmentIndex]
    });
  } catch (error) {
    next(error);
  }
};
