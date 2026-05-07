const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { name, description, adminId } = req.body;
    const group = new Group({ name, description, admin: adminId, members: [adminId] });
    await group.save();
    await User.findByIdAndUpdate(adminId, { $push: { groups: group._id } });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().populate('admin', 'username avatar');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:groupId/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findByIdAndUpdate(req.params.groupId, { $addToSet: { members: userId } }, { new: true });
    await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } });
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
