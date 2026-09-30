const express = require('express');

const {
  createPost,
  getPosts,
  getMyPosts,
  getMyDrafts,
  getPostById,
  updatePost,
  deletePost,
  searchPosts,
  semanticSearchPosts
} = require('../controllers/postController');

const {
  authenticate,
  optionalAuthenticate
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/my',
  authenticate,
  getMyPosts
);

router.get(
  '/my/drafts',
  authenticate,
  getMyDrafts
);

router.get(
  '/',
  optionalAuthenticate,
  getPosts
);

router.get(
  '/search',
  optionalAuthenticate,
  searchPosts
);

router.get(
  '/semantic-search',
  optionalAuthenticate,
  semanticSearchPosts
);

router.get(
  '/:id',
  optionalAuthenticate,
  getPostById
);

router.post(
  '/',
  authenticate,
  createPost
);

router.put(
  '/:id',
  authenticate,
  updatePost
);

router.delete(
  '/:id',
  authenticate,
  deletePost
);

module.exports = router;