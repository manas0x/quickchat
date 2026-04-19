const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// Get all channels
router.get('/', protect, async (req, res) => {
  const channels = await Channel.find({});
  res.json(channels);
});

// Create channel
router.post('/', protect, async (req, res) => {
  const { name, description, isPrivate } = req.body;

  const channelExists = await Channel.findOne({ name });
  if (channelExists) {
    return res.status(400).json({ message: 'Channel name already exists' });
  }

  const channel = new Channel({ 
    name, 
    description, 
    isPrivate,
    createdBy: req.user._id,
    members: [req.user._id] // Creator is always a member
  });
  const createdChannel = await channel.save();
  res.status(201).json(createdChannel);
});

// Get messages for a channel
router.get('/:id/messages', protect, async (req, res) => {
  const messages = await Message.find({ channel: req.params.id })
    .populate('sender', 'username avatar')
    .sort({ createdAt: 1 });
  res.json(messages);
});

// Add member to channel
router.post('/:id/members', protect, async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (channel) {
    if (channel.members.includes(req.body.userId)) {
        return res.status(400).json({ message: 'User already in channel' });
    }
    channel.members.push(req.body.userId);
    await channel.save();
    res.json({ message: 'Member added' });
  } else {
    res.status(404).json({ message: 'Channel not found' });
  }
});

// Search messages in a channel
router.get('/:id/search', protect, async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  
  const messages = await Message.find({ 
    channel: req.params.id,
    content: { $regex: query, $options: 'i' }
  })
  .populate('sender', 'username avatar')
  .sort({ createdAt: -1 });
  
  res.json(messages);
});

module.exports = router;
