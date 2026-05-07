const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  sentimentScore: {
    type: Number,
    required: false
  },
  aiRecommendation: {
    type: String,
    required: false
  },
  author: {
    type: String,
    default: 'Anonymous'
  },
  likes: [{ type: String }],
  comments: [{
    text: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);
