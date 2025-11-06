import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} role - User's role (student, faculty, admin)
 * @returns {string} JWT token
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId,
      role: role 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Generate refresh token
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );
};
