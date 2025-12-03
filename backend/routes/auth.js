const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../mailer');

const router = express.Router();

// ======================
//      REGISTRO
// ======================
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { username, email, password, dateOfBirth } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      profile: {
        firstName: "",
        lastName: "",
        bio: "",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
      }
    });

    await user.save();
    console.log('User registered successfully:', user.username);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ======================
//      LOGIN
// ======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
//   OLVIDÉ MI CONTRASEÑA
// ======================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // No revelamos si el correo existe
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hora

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(expires);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error requesting password reset' });
  }
});

// ======================
//   RESTABLECER CONTRASEÑA
// ======================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// ======================
//      OBTENER PERFIL
// ======================
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======================
//    ACTUALIZAR PERFIL
// ======================
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, bio, email, dateOfBirth } = req.body;

    const updates = {};
    if (firstName !== undefined) updates["profile.firstName"] = firstName;
    if (lastName !== undefined) updates["profile.lastName"] = lastName;
    if (bio !== undefined) updates["profile.bio"] = bio;
    if (email !== undefined) updates.email = email;
    if (dateOfBirth !== undefined) {
      updates["profile.dateOfBirth"] = dateOfBirth ? new Date(dateOfBirth) : undefined;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
