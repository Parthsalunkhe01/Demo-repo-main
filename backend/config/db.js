const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Schemas ────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role:          { type: String, default: 'user', enum: ['user', 'admin'] },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const complaintSchema = new mongoose.Schema({
  user_id:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:                { type: String },
  category:             { type: String },
  location:             { type: String },
  description:          { type: String },
  image_url:            { type: String, default: null },
  completion_image_url: { type: String, default: null },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Rejected', 'In Progress', 'Completed'],
  },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const announcementSchema = new mongoose.Schema({
  admin_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:      { type: String, default: 'text' },
  title:     { type: String },
  body:      { type: String },
  media_url: { type: String, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// ─── Models ─────────────────────────────────────────────────────────────────

const User         = mongoose.model('User',         userSchema);
const Complaint    = mongoose.model('Complaint',    complaintSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);

// ─── Connection & Admin Seed ─────────────────────────────────────────────────

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/complaint_portal';

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Seed default admin account if not exists (password: admin123)
    const existing = await User.findOne({ email: 'admin@lonere.gov' });
    if (!existing) {
      const hash = bcrypt.hashSync('admin123', 10);
      await User.create({ name: 'Admin', email: 'admin@lonere.gov', password_hash: hash, role: 'admin' });
      console.log('✅ Default admin created: admin@lonere.gov / admin123');
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, User, Complaint, Announcement };
