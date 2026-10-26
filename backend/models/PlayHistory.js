const mongoose = require('mongoose');

const playHistorySchema = new mongoose.Schema(
  {
    songId: {
      type: Number,
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    playedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PlayHistory', playHistorySchema);
