const express = require('express');
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['officer', 'auditor', 'admin']),
  department: z.string().min(1),
});

router.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }

  const { email, password } = result.data;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const userInfo = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  };

  res.json({ token, user: userInfo });
});

router.post('/register', async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }

  const existing = await User.findOne({ email: result.data.email });
  if (existing) {
    return res.status(400).json({ error: 'Email already in use' });
  }

  const user = new User({
    name: result.data.name,
    email: result.data.email,
    passwordHash: result.data.password, // handled by pre-save hook
    role: result.data.role,
    department: result.data.department,
  });

  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const userInfo = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  };

  res.status(201).json({ token, user: userInfo });
});

module.exports = router;
