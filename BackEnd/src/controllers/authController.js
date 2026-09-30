const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required.'
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
  name,
  email: email.toLowerCase(),
  password: hashedPassword,
  role: 'Reader'
});

    const token = createToken(user);

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);

    res.status(500).json({
      message: 'Registration failed.'
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const token = createToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);

    res.status(500).json({
      message: 'Login failed.'
    });
  }
}
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    res.json({
      user
    });
  } catch (error) {
    console.error('Get current user error:', error.message);

    res.status(500).json({
      message: 'Failed to get user.'
    });
  }
}
module.exports = {
  register,
  login,
  getMe
};