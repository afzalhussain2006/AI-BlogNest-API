const express = require('express');

const {
  createComment,
  getCommentsByPost,
  getAllComments,
  updateCommentStatus,
  deleteComment
} = require('../controllers/commentController');

const {
  authenticate,
  authorize
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/',
  authenticate,
  createComment
);

router.get(
  '/post/:postId',
  getCommentsByPost
);


router.get(
  '/',
  authenticate,
  authorize('Admin', 'Editor'),
  getAllComments
);


router.put(
  '/:id/status',
  authenticate,
  authorize('Admin', 'Editor'),
  updateCommentStatus
);


router.delete(
  '/:id',
  authenticate,
  deleteComment
);

module.exports = router;