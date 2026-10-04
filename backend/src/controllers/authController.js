const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { Op } = require('sequelize');

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Can be username or email

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { Email: identifier.trim() },
          { Username: identifier.trim() }
        ]
      },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    if (user.Status === 'Inactive' || user.Status === 'Suspended') {
      return res.status(403).json({ error: `Account is ${user.Status.toLowerCase()}. Please contact administrator.` });
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    const secret = process.env.JWT_SECRET || 'buildcorp_super_secret_jwt_key_2026_aiml_srm';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      {
        id: user.User_ID,
        username: user.Username,
        role: user.role ? user.role.Role_Name : 'User'
      },
      secret,
      { expiresIn }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        User_ID: user.User_ID,
        Username: user.Username,
        Email: user.Email,
        Full_Name: user.Full_Name,
        Role_ID: user.Role_ID,
        Role_Name: user.role ? user.role.Role_Name : 'User',
        Status: user.Status
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An error occurred during authentication.' });
  }
};

const register = async (req, res) => {
  try {
    const { Username, Email, Password, Full_Name, Role_ID, Status } = req.body;

    // Check if username or email already exists
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ Email }, { Username }]
      }
    });

    if (existing) {
      if (existing.Email === Email) {
        return res.status(400).json({ error: 'Email is already registered in the system.' });
      }
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    const role = await Role.findByPk(Role_ID);
    if (!role) {
      return res.status(400).json({ error: 'Invalid Role_ID specified.' });
    }

    const newUser = await User.create({
      Username,
      Email,
      Password_Hash: Password,
      Full_Name,
      Role_ID,
      Status: Status || 'Active'
    });

    const userWithRole = await User.findByPk(newUser.User_ID, {
      include: [{ model: Role, as: 'role' }]
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: userWithRole
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Error creating user account.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.User_ID, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};

module.exports = {
  login,
  register,
  getMe
};
