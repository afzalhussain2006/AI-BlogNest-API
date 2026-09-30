const express = require('express');

const {
  generateBlog,
  summarizeBlog
} = require('../controllers/aiController');

const {
  chatWithAI,
  getChatHistory
} = require('../controllers/chatController');

const {
  authenticate
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/generate-blog',
  authenticate,
  generateBlog
);

router.post(
  '/summarize',
  authenticate,
  summarizeBlog
);

router.post(
  '/chat',
  authenticate,
  chatWithAI
);

router.get(
  '/chat/history',
  authenticate,
  getChatHistory
);

module.exports = router;