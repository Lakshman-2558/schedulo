const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { findUserForLogin, findUserByEmail, findUserByEmployeeId, findUserById, createUser, getModelByRole } = require('../utils/userHelper');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user (Admin only)
// @access  Private/Admin
router.post('/register', protect, async (req, res) => {
  try {
    // Only admin can register users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can register users'
      });
    }

    const { name, email, password, role, employeeId, department, campus, phone, isHOD, subject, subjects } = req.body;

    // Validate employeeId is required for all roles
    if (!employeeId || !employeeId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required for all users'
      });
    }

    // Check if user exists across all collections (by email or employeeId)
    const existingUserResult = await findUserByEmail(email);
    if (existingUserResult && existingUserResult.user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if employeeId already exists
    const existingEmployeeIdResult = await findUserByEmployeeId(employeeId);
    if (existingEmployeeIdResult && existingEmployeeIdResult.user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this Employee ID'
      });
    }

    // Handle subjects array (if provided as comma-separated string or array)
    let subjectsArray = [];
    if (subjects) {
      if (Array.isArray(subjects)) {
        subjectsArray = subjects.map(s => s.toString().trim()).filter(s => s);
      } else {
        subjectsArray = subjects.toString().split(',').map(s => s.trim()).filter(s => s);
      }
    } else if (subject) {
      subjectsArray = [subject.toString().trim()];
    }

    // Create user
    const userRole = role || 'faculty';

    // Validate subject name is required for faculty role
    if (userRole === 'faculty' && !subject && (!subjects || subjectsArray.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required for faculty users'
      });
    }
    const userData = {
      name,
      email,
      password,
      role: userRole,
      employeeId,
      department,
      campus,
      phone
    };

    // Add role-specific fields
    if (userRole === 'faculty') {
      userData.subject = subject;
      userData.subjects = subjectsArray;
    }

    const user = await createUser(userData);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        campus: user.campus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { employeeId, password } = req.body;

      // Validate that employeeId is provided and not empty
      if (!employeeId || !employeeId.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required'
        });
      }

      // Check if user exists by employeeId ONLY (no email fallback)
      const userResult = await findUserForLogin(employeeId.trim());
      if (!userResult || !userResult.user) {
        console.log(`❌ Login attempt failed: User not found - Employee ID: ${employeeId}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials - Employee ID not found. Please check your Employee ID or contact administrator.'
        });
      }

      const { user } = userResult;

      // Check if user is active
      if (!user.isActive) {
        console.log(`❌ Login attempt failed: User account deactivated - Identifier: ${employeeId}`);
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log(`❌ Login attempt failed: Incorrect password - Identifier: ${employeeId}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials - Incorrect password'
        });
      }

      const identifier = user.employeeId || user.email;
      console.log(`✅ Login successful: ${identifier} (${userResult.role})`);

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: userResult.role || user.role,
          employeeId: user.employeeId || null,
          department: user.department || null,
          campus: user.campus || null
        }
      });
    } catch (error) {
      console.error('❌ Error in /api/auth/login:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error during login'
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is already set by protect middleware using findUserById
    // findUserById returns a plain object with role property (password already excluded via .select('-password'))
    if (!req.user) {
      console.error('❌ req.user is null/undefined in /api/auth/me');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create a clean user object
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      employeeId: req.user.employeeId || null,
      department: req.user.department || null,
      campus: req.user.campus || null,
      phone: req.user.phone || null,
      isActive: req.user.isActive !== undefined ? req.user.isActive : true
    };

    // Add role-specific fields
    if (req.user.role === 'faculty') {
      userData.subject = req.user.subject || null;
      userData.subjects = req.user.subjects || [];
    }

    console.log(`✅ /api/auth/me: Returning user data for ${userData.email} (${userData.role})`);

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('❌ Error in /api/auth/me:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request OTP for password reset (only requires Employee ID)
// @access  Public
router.post('/forgot-password',
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { employeeId } = req.body;
      const FacultyCredentials = require('../models/FacultyCredentials');
      const emailService = require('../services/emailService');

      // Find faculty by employeeId
      const faculty = await FacultyCredentials.findOne({
        employeeId: employeeId.trim()
      });

      if (!faculty) {
        // Don't reveal whether user exists or not for security
        return res.json({
          success: true,
          message: 'If your employee ID matches our records, you will receive an OTP at your registered email address.'
        });
      }

      // Check if user is active
      if (!faculty.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Set OTP expiry to 5 minutes from now
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      // Save OTP to database
      faculty.resetOTP = otp;
      faculty.resetOTPExpires = otpExpiry;
      await faculty.save();

      // Send OTP email
      try {
        await emailService.sendPasswordResetOTP({
          name: faculty.name,
          email: faculty.email,
          employeeId: faculty.employeeId
        }, otp);

        console.log(`✅ OTP sent successfully to: ${faculty.email} for Employee ID: ${employeeId}`);

        res.json({
          success: true,
          message: 'OTP has been sent to your registered email address. It will expire in 5 minutes.',
          email: faculty.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Masked email for security
        });
      } catch (emailError) {
        console.error('❌ Error sending OTP email:', emailError);
        res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again later.'
        });
      }
    } catch (error) {
      console.error('❌ Error in /api/auth/forgot-password:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred. Please try again later.'
      });
    }
  }
);

// @route   POST /api/auth/verify-otp-only
// @desc    Verify OTP without resetting password (just validation)
// @access  Public
router.post('/verify-otp-only',
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { employeeId, otp } = req.body;
      const FacultyCredentials = require('../models/FacultyCredentials');

      // Find faculty by employeeId
      const faculty = await FacultyCredentials.findOne({
        employeeId: employeeId.trim()
      });

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Invalid employee ID'
        });
      }

      // Check if OTP exists and is not expired
      if (!faculty.resetOTP || !faculty.resetOTPExpires) {
        return res.status(400).json({
          success: false,
          message: 'No OTP request found. Please request a new OTP.'
        });
      }

      // Check if OTP is expired
      if (new Date() > faculty.resetOTPExpires) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new one.'
        });
      }

      // Verify OTP
      if (faculty.resetOTP !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP. Please check and try again.'
        });
      }

      // OTP is valid - just return success (don't reset password yet)
      console.log(`✅ OTP verified successfully for: ${faculty.email}`);

      res.json({
        success: true,
        message: 'OTP verified successfully. You can now set your new password.'
      });
    } catch (error) {
      console.error('❌ Error in /api/auth/verify-otp-only:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred. Please try again later.'
      });
    }
  }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and allow password reset
// @access  Public
router.post('/verify-otp',
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { employeeId, otp, newPassword } = req.body;
      const FacultyCredentials = require('../models/FacultyCredentials');

      // Find faculty by employeeId
      const faculty = await FacultyCredentials.findOne({
        employeeId: employeeId.trim()
      });

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Invalid employee ID'
        });
      }

      // Check if OTP exists and is not expired
      if (!faculty.resetOTP || !faculty.resetOTPExpires) {
        return res.status(400).json({
          success: false,
          message: 'No OTP request found. Please request a new OTP.'
        });
      }

      // Check if OTP is expired
      if (new Date() > faculty.resetOTPExpires) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new one.'
        });
      }

      // Verify OTP
      if (faculty.resetOTP !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP. Please check and try again.'
        });
      }

      // OTP is valid, update password
      faculty.password = newPassword;
      faculty.resetOTP = undefined;
      faculty.resetOTPExpires = undefined;
      await faculty.save();

      console.log(`✅ Password reset successful for: ${faculty.email}`);

      res.json({
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.'
      });
    } catch (error) {
      console.error('❌ Error in /api/auth/verify-otp:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred. Please try again later.'
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password (while logged in)
// @access  Private
router.post('/reset-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get the user model based on role
      const Model = getModelByRole(req.user.role);
      const user = await Model.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      console.log(`✅ Password changed successfully for: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('❌ Error in /api/auth/reset-password:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while changing password'
      });
    }
  }
);

module.exports = router;

