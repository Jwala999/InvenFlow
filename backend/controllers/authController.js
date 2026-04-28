const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Register ──────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered.' 
      });
    }

    // Only admin can create other admins, otherwise default to staff
    const assignedRole = (req.user?.role === 'admin' && role === 'admin') 
      ? 'admin' 
      : 'staff';

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: assignedRole 
    });

    const token = generateToken(user._id);

    // Create notification for new registration
    await Notification.create({
      type: 'register',
      title: 'New Account Created',
      message: `${name} (${email}) just created an account as ${assignedRole}.`,
      icon: 'user-plus',
      user: user._id,
      meta: { 
        userId: user._id, 
        role: assignedRole 
      },
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required.' 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account deactivated. Contact admin.' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Create login notification
    await Notification.create({
      type: 'login',
      title: 'User Logged In',
      message: `${user.name} (${user.role}) signed in to InvenFlow.`,
      icon: 'log-in',
      user: user._id,
      meta: { 
        userId: user._id, 
        email: user.email 
      },
    });

    const token = generateToken(user._id);
    user.password = undefined; // Remove password from response

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User ──────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ 
      success: true, 
      data: { user } 
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully.', 
      data: { user } 
    });
  } catch (error) {
    next(error);
  }
};

// ─── Change Password ───────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect.' 
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({ 
      success: true, 
      message: 'Password updated successfully.', 
      data: { token } 
    });
  } catch (error) {
    next(error);
  }
};