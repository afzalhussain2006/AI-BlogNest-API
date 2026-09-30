const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

async function createComment(req, res) {
  try {
    const { post, content } = req.body;
    if (!post || !post.trim()) {
  return res.status(400).json({
    message: 'Post ID is required.'
  });
}

if (!content || !content.trim()) {
  return res.status(400).json({
    message: 'Comment content is required.'
  });
}

if (content.trim().length > 1000) {
  return res.status(400).json({
    message: 'Comment cannot exceed 1000 characters.'
  });
}

    if (!post || !content) {
      return res.status(400).json({
        message: 'Post ID and comment content are required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(post)) {
      return res.status(400).json({
        message: 'Invalid post ID.'
      });
    }

    const existingPost = await Post.findById(post);

    if (!existingPost) {
      return res.status(404).json({
        message: 'Post not found.'
      });
    }

    if (existingPost.status === 'draft') {
      return res.status(400).json({
        message: 'Cannot comment on a draft post.'
      });
    }

    const comment = await Comment.create({
      post,
      user: req.user.id,
      content
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name role')
      .populate('post', 'title');

    return res.status(201).json({
      message: 'Comment created successfully.',
      comment: populatedComment
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create comment.',
      error: error.message
    });
  }
}

async function getCommentsByPost(req, res) {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        message: 'Invalid post ID.'
      });
    }

    const comments = await Comment.find({
      post: postId,
      status: 'approved'
    })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      comments
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch comments.',
      error: error.message
    });
  }
}

async function getAllComments(req, res) {
  try {
    const comments = await Comment.find()
      .populate('user', 'name role')
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      comments
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch comments.',
      error: error.message
    });
  }
}

async function updateCommentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid comment ID.'
      });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid comment status.'
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('user', 'name role')
      .populate('post', 'title');

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found.'
      });
    }

    return res.status(200).json({
      message: 'Comment status updated successfully.',
      comment
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update comment status.',
      error: error.message
    });
  }
}

async function deleteComment(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid comment ID.'
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found.'
      });
    }

    const isOwner = comment.user.toString() === req.user.id;
    const isModerator = ['Admin', 'Editor'].includes(req.user.role);

    if (!isOwner && !isModerator) {
      return res.status(403).json({
        message: 'You do not have permission to delete this comment.'
      });
    }

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Comment deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete comment.',
      error: error.message
    });
  }
}

module.exports = {
  createComment,
  getCommentsByPost,
  getAllComments,
  updateCommentStatus,
  deleteComment
};