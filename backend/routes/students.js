const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');

// Get all students
router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    let students;
    
    if (courseId) {
      // Get students enrolled in specific course
      students = await Student.find({ enrolledCourses: courseId }).populate('enrolledCourses');
    } else {
      // Get all students
      students = await Student.find().populate('enrolledCourses');
    }
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const { studentId, name, email, enrolledCourses = [] } = req.body;
    
    const student = new Student({
      studentId,
      name,
      email,
      enrolledCourses
    });
    
    await student.save();
    await student.populate('enrolledCourses');
    
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Student ID or email already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Get student by ID
router.get('/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId }).populate('enrolledCourses');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll student in course
router.post('/:studentId/enroll', async (req, res) => {
  try {
    const { courseId } = req.body;
    
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!student.enrolledCourses.includes(courseId)) {
      student.enrolledCourses.push(courseId);
      await student.save();
    }
    
    await student.populate('enrolledCourses');
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;