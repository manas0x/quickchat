const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// Get messages between two users
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
    .populate('sender', 'username avatar')
    .populate('recipient', 'username avatar')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching personal messages' });
  }
});

// Search messages in a private thread
router.get('/:userId/search', protect, async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);
    
    const messages = await Message.find({
        $or: [
            { sender: req.user._id, recipient: req.params.userId },
            { sender: req.params.userId, recipient: req.user._id }
        ],
        content: { $regex: query, $options: 'i' }
    })
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 });

    res.json(messages);
});

module.exports = router;
