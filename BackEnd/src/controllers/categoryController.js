
const mongoose = require('mongoose');
const Category = require('../models/Category');

function createSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
  return res.status(400).json({
    message: 'Category name is required.'
  });
}

if (name.trim().length > 100) {
  return res.status(400).json({
    message: 'Category name cannot exceed 100 characters.'
  });
}

if (description && description.trim().length > 500) {
  return res.status(400).json({
    message: 'Category description cannot exceed 500 characters.'
  });
}

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        message: 'Category name is required.'
      });
    }

    const slug = createSlug(name);

    if (!slug) {
      return res.status(400).json({
        message: 'Enter a valid category name.'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      slug
    });

    return res.status(201).json({
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Category name or slug already exists.'
      });
    }

    console.error('Create category error:', error.message);
    return res.status(500).json({
      message: 'Failed to create category.'
    });
  }
}

async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });

    return res.status(200).json({
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch categories.'
    });
  }
}

async function getCategoryById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid category ID.'
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: 'Category not found.'
      });
    }

    return res.status(200).json({ category });
  } catch (error) {
    console.error('Get category error:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch category.'
    });
  }
}

async function updateCategory(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid category ID.'
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: 'Category not found.'
      });
    }

    if (req.body.name !== undefined) {
      if (
        typeof req.body.name !== 'string' ||
        !req.body.name.trim()
      ) {
        return res.status(400).json({
          message: 'Enter a valid category name.'
        });
      }

      const slug = createSlug(req.body.name);

      if (!slug) {
        return res.status(400).json({
          message: 'Enter a valid category name.'
        });
      }

      category.name = req.body.name.trim();
      category.slug = slug;
    }

    if (req.body.description !== undefined) {
      category.description = req.body.description;
    }

    await category.save();

    return res.status(200).json({
      message: 'Category updated successfully.',
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Category name or slug already exists.'
      });
    }

    console.error('Update category error:', error.message);
    return res.status(500).json({
      message: 'Failed to update category.'
    });
  }
}

async function deleteCategory(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid category ID.'
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: 'Category not found.'
      });
    }

    return res.status(200).json({
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    console.error('Delete category error:', error.message);
    return res.status(500).json({
      message: 'Failed to delete category.'
    });
  }
}

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
