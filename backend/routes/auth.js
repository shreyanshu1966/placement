const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'placement-system-secret-key-2025';
const JWT_EXPIRES_IN = '7d';

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, studentId, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // For students, check if studentId is provided and unique
    if (role === 'student') {
      if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required for student accounts' });
      }
      
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
    }

    // Create new user
    const userData = { email, password, name, role };
    if (role === 'student') {
      userData.studentId = studentId;
    } else if (role === 'faculty') {
      userData.department = department;
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('enrolledCourses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Quick login for development (remove in production)
router.post('/quick-login', async (req, res) => {
  try {
    const { role } = req.body;
    
    // Find or create a demo user
    let user = await User.findOne({ email: `demo-${role}@example.com` });
    
    if (!user) {
      const userData = {
        email: `demo-${role}@example.com`,
        password: '123456',
        name: role === 'student' ? 'Demo Student' : 'Demo Faculty',
        role: role
      };
      
      if (role === 'student') {
        userData.studentId = 'DEMO-STU-001';
      } else {
        userData.department = 'Computer Science';
      }
      
      user = new User(userData);
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Quick login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Quick login error:', error);
    res.status(500).json({ message: 'Quick login failed' });
  }
});

// Get users by role (for faculty to select students)
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    
    let filter = {};
    if (role) {
      filter.role = role;
    }
    
    const users = await User.find(filter).select('-password');
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = { router, authenticateToken };