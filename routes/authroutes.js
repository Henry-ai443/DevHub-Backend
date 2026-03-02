
const express = require('express');
const router = express.Router();
const { signup, login, logout, refreshToken } = require('../controllers/authcontrollers');
const { authenticate } = require('../middleware/authmiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/refresh', authenticate, refreshToken);
