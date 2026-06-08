const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');

exports.register = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        email = email.trim().toLowerCase();

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await User.create({ name, email, password_hash: hashedPassword });

        res.status(201).json({
            message: 'User registered successfully!',
            userId: user._id,
        });
    } catch (err) {
        console.error('[register]', err);
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        email = email.trim().toLowerCase();

        const user = await User.findOne({ email });
        console.log('👤 User from DB:', user); // DEBUG

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (!user.password_hash) {
            return res.status(500).json({ message: 'Password hash missing in DB' });
        }

        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('[login]', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password_hash');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        console.error('[getMe]', err);
        res.status(500).json({ message: err.message });
    }
};
