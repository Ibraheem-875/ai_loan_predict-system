const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

const generateAdminToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        admin: { id: 'mock-admin-id', name, email },
        token: generateAdminToken('mock-admin-id'),
        message: 'Admin registered in Demo Mode (No DB)',
      });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      token: generateAdminToken(admin._id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.json({
        admin: { id: 'mock-admin-id', name: 'Demo Admin', email },
        token: generateAdminToken('mock-admin-id'),
        message: 'Admin logged in in Demo Mode (No DB)',
      });
    }

    const admin = await Admin.findOne({ email });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      return res.json({
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
        token: generateAdminToken(admin._id),
      });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAdminMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ admin: { id: 'mock-admin-id', name: 'Demo Admin', email: 'admin@demo.com' } });
    }
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    return res.json({ admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
