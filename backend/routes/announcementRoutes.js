const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', announcementController.getAllAnnouncements);
router.post('/', verifyToken, isAdmin, upload.single('media'), announcementController.createAnnouncement);
router.delete('/:id', verifyToken, isAdmin, announcementController.deleteAnnouncement);

module.exports = router;
