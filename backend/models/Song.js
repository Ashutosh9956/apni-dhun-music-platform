const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true
    },
    genre: {
      type: String,
      required: true,
      trim: true
    },
    cover: {
      type: String,
      default: 'https://placehold.co/400x400/302044/ffffff?text=Apni+Dhun'
    },
    audio: {
      type: String,
      required: true
    },
    album: {
      type: String,
      default: ''
    },
    duration: {
      type: String,
      default: '3:30'
    },
    playCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.mongoId = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Song', songSchema);
