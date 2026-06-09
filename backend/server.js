const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);

// Catch-all route to serve index.html for any frontend routes
app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) return next();
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check
app.get('/api/test-db', (req, res) => {
    const state = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    if (state === 1) {
        res.json({ status: 'OK', message: 'MongoDB connected successfully!' });
    } else {
        res.status(500).json({ status: 'Error', message: `MongoDB readyState: ${state}` });
    }
});

// Error Handling
app.use((err, req, res, next) => {
    console.error('❌ SERVER ERROR:', err);
    if (err.stack) console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        console.log(`   Database: MongoDB`);
        console.log(`   Test DB connection: http://localhost:${PORT}/api/test-db\n`);
    });

    // Explicitly keep the process alive
    process.stdin.resume();

    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down...');
        server.close(() => {
            mongoose.connection.close();
            process.exit(0);
        });
    });
});
