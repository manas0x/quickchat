const mongoose = require('mongoose');
const Channel = require('../models/Channel');
const dotenv = require('dotenv');

dotenv.config();

const seedChannels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quickchat');

    // Clear existing
    await Channel.deleteMany({});

    const channels = [
      { name: 'general', description: 'General discussion for everyone' },
      { name: 'development', description: 'Tech talk and coding' },
      { name: 'announcements', description: 'Important updates' },
      { name: 'random', description: 'Off-topic fun' }
    ];

    await Channel.insertMany(channels);
    console.log('Channels seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding channels:', error);
    process.exit(1);
  }
};

seedChannels();
