const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controllers');
const { authenticate, optionalAuth } = require('../middleware/authmiddleware');
const upload = require('../middleware/avatarUpload');
const { isDeveloper, isClient } = require('../utils/rbac');

// Get own profile (for authenticated users)
router.get('/me', authenticate, profileController.getMyProfile);

// Browse public developers (optional auth for personalization)
router.get('/developers/browse', optionalAuth, profileController.browseDevelopers);

// Get public developer profile
router.get('/developer/:developerId', optionalAuth, profileController.getDeveloperProfile);

// Update own developer profile
router.put(
  '/me/developer',
  authenticate,
  isDeveloper,
  upload.single('avatar'),
  profileController.updateDeveloperProfile
);

// Update own client profile
router.put(
  '/me/client',
  authenticate,
  isClient,
  profileController.updateClientProfile
);
