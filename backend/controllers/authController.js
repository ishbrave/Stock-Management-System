const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

//Handle user login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        //Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        //Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        //Create JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Validate token endpoint
exports.validateToken = async (req, res) => {
    try {
        // If we reach here, the token has already been validated by authMiddleware
        res.json({ message: 'Token is valid', user: req.user });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ message: 'Token validation failed' });
    }
};

exports.register = async (req, res) => {
    try {
        console.log('Register endpoint hit with body:', req.body);
        const { username, password, email } = req.body;

        // Validate inputs
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        const exists = await User.findOne({ username });
        if (exists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new User({ username, password, email });
        await user.save();

        console.log('User registered successfully:', username);
        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                message: 'If an account with that email exists, a password reset link has been generated.'
            });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const payload = {
            message: 'Password reset link generated successfully.',
        };

        if (process.env.NODE_ENV !== 'production') {
            payload.resetToken = rawToken;
            payload.resetPath = `/reset-password/${rawToken}`;
            payload.expiresAt = resetPasswordExpires;
        }

        res.json(payload);
    } catch (error) {
        console.error('Request password reset error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Reset token is invalid or has expired' });
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
