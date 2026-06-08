const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/', verifyToken, upload.single('image'), complaintController.createComplaint);
router.get('/my', verifyToken, complaintController.getMyComplaints);
router.get('/all', complaintController.getAllComplaints);

// Admin routes
router.patch('/:id/status', verifyToken, isAdmin, upload.single('proof'), complaintController.updateComplaintStatus);
router.delete('/:id', verifyToken, isAdmin, complaintController.deleteComplaint);

module.exports = router;
