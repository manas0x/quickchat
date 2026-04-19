const mongoose = require('mongoose');

const channelSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
        type: String,
        default: "Text Channels"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPrivate: {
        type: Boolean,
        default: false
    }
  },
  {
    timestamps: true,
  }
);

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
