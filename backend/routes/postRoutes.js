const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Generate AI Recommendation based on sentiment score
const generateRecommendation = (score) => {
  if (score < -2) {
    return "AI Support: It sounds like you're going through a very tough time. Please consider reaching out to a professional counselor or a trusted friend. You don't have to face this alone.";
  } else if (score < 0) {
    return "AI Support: I sense some stress or sadness in your words. Remember to take breaks, practice self-care, and be gentle with yourself today.";
  } else if (score > 2) {
    return "AI Support: It's wonderful to hear such positivity! Keep spreading good energy and maintaining these healthy habits.";
  } else {
    return "AI Support: Thank you for sharing your thoughts with the community. Every shared experience helps someone else.";
  }
};

// GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new community message
router.post('/', async (req, res) => {
  try {
    const { content, author } = req.body;
    
    // Perform sentiment analysis
    const result = sentiment.analyze(content);
    const aiRecommendation = generateRecommendation(result.score);
    
    const newPost = new Post({
      content,
      author: author || 'Anonymous',
      sentimentScore: result.score,
      aiRecommendation
    });
    
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST like/unlike a post
router.post('/:id/like', async (req, res) => {
  try {
    const { username } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const likeIndex = post.likes.indexOf(username);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1); // Unlike
    } else {
      post.likes.push(username); // Like
    }
    
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST comment on a post
router.post('/:id/comment', async (req, res) => {
  try {
    const { text, author } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.comments.push({ text, author: author || 'Anonymous' });
    const updatedPost = await post.save();
    res.status(201).json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
