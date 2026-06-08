const { Announcement } = require('../config/db');

exports.createAnnouncement = async (req, res) => {
    try {
        const { title, body, type } = req.body;
        const adminId = req.userId;

        console.log('👉 ANNOUNCEMENT:', { title, body, adminId });

        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body required' });
        }

        let mediaUrl = null;
        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
        }

        const announcement = await Announcement.create({
            admin_id: adminId,
            type: type || 'text',
            title,
            body,
            media_url: mediaUrl,
        });

        res.json({ message: 'Created', id: announcement._id });
    } catch (err) {
        console.error('❌ ANN DB ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ created_at: -1 })
            .lean();

        const mapped = announcements.map(a => ({ ...a, id: a._id }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.findByIdAndDelete(id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
