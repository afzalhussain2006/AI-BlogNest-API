const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    content: {
      type: String,
      required: true
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: 500
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    category: {
      type: String,
      trim: true,
      maxlength: 100
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    embedding: {
  type: [Number],
  default: undefined
 }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Post', postSchema);