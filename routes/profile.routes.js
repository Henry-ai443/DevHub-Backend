const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controllers.js');
const auth = require('../middleware/authmiddleware');

router.get('/me', auth, profileController.getMyProfile);

module.exports = router;
