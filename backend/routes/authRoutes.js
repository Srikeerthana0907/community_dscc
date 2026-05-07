const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    const finalAvatar = avatar || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}`;
    const user = new User({ username, email, password, avatar: finalAvatar });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username avatar');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/join-community', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByIdAndUpdate(userId, { isCommunityMember: true }, { new: true });
        res.json({ user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, isCommunityMember: user.isCommunityMember } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
