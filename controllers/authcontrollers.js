const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');



const SALT_ROUNDS = 10;


/**
 * SIMPLE SIGNUP
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES (?, ?, ?)`,
      [email, passwordHash, role || 'CLIENT']
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { userId, role: role || 'CLIENT' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'User created successfully',
      token
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


/**
 * LOGIN
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      `SELECT id, password_hash, role, status, token_version
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tokenVersion: user.token_version
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.json({ 
      message:'Login Successfull',
      'token':token
     });

  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};


