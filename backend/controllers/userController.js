import User from '../models/User.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, department, batch, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (batch) query.batch = batch;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Students can only view their own profile, faculty and admin can view all
    if (req.user.role === 'student' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin/Faculty
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, semester, batch, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update object
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (department) fieldsToUpdate.department = department;
    if (semester) fieldsToUpdate.semester = semester;
    if (batch) fieldsToUpdate.batch = batch;

    // Only admin can update role and isActive
    if (req.user.role === 'admin') {
      if (role) fieldsToUpdate.role = role;
      if (typeof isActive !== 'undefined') fieldsToUpdate.isActive = isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user context (learning profile)
 * @route   GET /api/users/:id/context
 * @access  Private
 */
export const getUserContext = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Students can only view their own context
    if (req.user.role === 'student' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this context'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        context: user.context
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user context manually
 * @route   PUT /api/users/:id/context
 * @access  Private/Admin/Faculty
 */
export const updateUserContext = async (req, res, next) => {
  try {
    const { topicStrengths, difficultyPreference } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (topicStrengths) {
      // Convert object to Map
      Object.entries(topicStrengths).forEach(([topic, score]) => {
        user.context.topicStrengths.set(topic, score);
      });
    }

    if (difficultyPreference) {
      user.context.difficultyPreference = difficultyPreference;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User context updated successfully',
      data: user.context
    });
  } catch (error) {
    next(error);
  }
};
