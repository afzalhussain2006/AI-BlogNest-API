const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Category', categorySchema);