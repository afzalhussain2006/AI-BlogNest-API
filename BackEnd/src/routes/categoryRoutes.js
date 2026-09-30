const express = require('express');

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const {
  authenticate,
  authorize
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, getCategories);
router.get('/:id', authenticate, getCategoryById);

router.post(
  '/',
  authenticate,
  authorize('Admin', 'Editor'),
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize('Admin', 'Editor'),
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize('Admin', 'Editor'),
  deleteCategory
);

module.exports = router;