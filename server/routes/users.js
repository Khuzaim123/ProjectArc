const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Configure multer for file upload
const upload = multer({
    dest: 'uploads/temp/',
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Please upload an image file'), false);
        }
        cb(null, true);
    },
});

// All routes are protected
router.use(protect);

// Profile routes
router.get('/profile', userController.getProfile);
router.patch(
    '/profile',
    userController.updateProfileValidation,
    userController.updateProfile
);

// Avatar upload
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

// Notification preferences
router.get('/preferences', userController.getPreferences);
router.patch(
    '/preferences',
    userController.updatePreferencesValidation,
    userController.updatePreferences
);

module.exports = router;
