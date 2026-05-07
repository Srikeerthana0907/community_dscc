const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get private chat history
router.get('/private/:user1/:user2', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.user1, recipient: req.params.user2 },
        { sender: req.params.user2, recipient: req.params.user1 }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get group chat history
router.get('/group/:groupId', async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
