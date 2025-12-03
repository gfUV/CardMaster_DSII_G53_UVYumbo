const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ======================
//      REGISTRO
// ======================
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { username, email, password, dateOfBirth } = req.body;

    // Hashear la contraseña antes de crear el usuario
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con perfil vacío por defecto
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
    if (dateOfBirth !== undefined) updates["profile.dateOfBirth"] = dateOfBirth ? new Date(dateOfBirth) : undefined;

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
