const { Complaint } = require('../config/db');

// CREATE
exports.createComplaint = async (req, res) => {
    try {
        const { title, category, location, description } = req.body;
        const userId = req.userId;

        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        if (!title || !category || !location || !description) {
            return res.status(400).json({ message: 'All fields required' });
        }

        const complaint = await Complaint.create({
            user_id: userId,
            title,
            category,
            location,
            description,
            image_url: imageUrl,
        });

        res.json({ message: 'Created', id: complaint._id });
    } catch (err) {
        console.error('❌ CREATE ERROR:', err);
        res.status(500).json({ message: err.message });
    }
};

// GET ALL (Admin) — populated with user name & email
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('user_id', 'name email')
            .sort({ created_at: -1 })
            .lean();

        // Map populated fields to match old SQLite response shape
        const mapped = complaints.map(c => ({
            ...c,
            id: c._id,
            user_name:  c.user_id ? c.user_id.name  : null,
            user_email: c.user_id ? c.user_id.email : null,
            user_id:    c.user_id ? c.user_id._id   : null,
        }));

        res.json(mapped);
    } catch (err) {
        console.error('❌ FETCH ERROR:', err);
        res.status(500).json({ message: err.message });
    }
};

// GET MY COMPLAINTS
exports.getMyComplaints = async (req, res) => {
    try {
        const userId = req.userId;

        const complaints = await Complaint.find({ user_id: userId })
            .sort({ created_at: -1 })
            .lean();

        const mapped = complaints.map(c => ({ ...c, id: c._id }));
        res.json(mapped);
    } catch (err) {
        console.error('❌ FETCH MY ERROR:', err);
        res.status(500).json({ message: err.message });
    }
};

// UPDATE STATUS (Admin)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log('👉 UPDATE STATUS ATTEMPT:', {
            id,
            status,
            userId: req.userId,
            file: req.file ? req.file.filename : 'none',
            body: req.body,
        });

        if (!id || !status) {
            console.warn('⚠️  Missing ID or Status in request');
            return res.status(400).json({ message: 'Missing id or status' });
        }

        const updateFields = { status };
        let completionImageUrl = null;
        if (req.file) {
            completionImageUrl = `/uploads/${req.file.filename}`;
            updateFields.completion_image_url = completionImageUrl;
        }

        const updated = await Complaint.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updated) {
            console.warn('⚠️  No document updated. ID might not exist.');
            return res.status(404).json({ message: 'Complaint not found.' });
        }

        console.log('✅ UPDATE SUCCESS:', updated._id);
        res.json({ message: 'Complaint status updated successfully', completionImageUrl });
    } catch (err) {
        console.error('❌ CONTROLLER CRASH:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};

// DELETE (Admin)
exports.deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        await Complaint.findByIdAndDelete(id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('❌ DELETE ERROR:', err);
        res.status(500).json({ message: err.message });
    }
};
