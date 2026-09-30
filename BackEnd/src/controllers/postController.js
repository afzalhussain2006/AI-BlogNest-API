const mongoose = require('mongoose');
const Post = require('../models/Post');
const { generateEmbedding } = require('../services/geminiService');

const getUserId = (req) => req.user.id || req.user._id;

const isOwner = (post, userId) => {
  const authorId = post.author?._id
    ? post.author._id.toString()
    : post.author?.toString();

  return Boolean(authorId && String(authorId) === String(userId));
};

const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Title is required.'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Content is required.'
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        message: 'Title cannot exceed 200 characters.'
      });
    }

    if (excerpt && excerpt.trim().length > 500) {
      return res.status(400).json({
        message: 'Excerpt cannot exceed 500 characters.'
      });
    }

    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either draft or published.'
      });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        message: 'Tags must be an array.'
      });
    }

    const embeddingText = `
Title: ${title}
Excerpt: ${excerpt || ''}
Content: ${content}
Category: ${category || ''}
Tags: ${(tags || []).join(', ')}
`;

    let embedding;

    try {
      embedding = await generateEmbedding(embeddingText);
    } catch (embErr) {
      console.error(
        'Embedding generation warning:',
        embErr.message
      );
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt ? excerpt.trim() : undefined,
      author: getUserId(req),
      category: category ? category.trim() : undefined,
      tags: tags || [],
      status: status || 'draft',
      embedding
    });

    return res.status(201).json({
      message: 'Post created successfully.',
      post
    });
  } catch (error) {
    console.error(
      'Create post error:',
      error.message
    );

    return res.status(500).json({
      message: 'Failed to create post.'
    });
  }
};

async function getPosts(req, res) {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const { category, tag } = req.query;

    const filter = {
      status: 'published'
    };

    if (category) {
      filter.category = {
        $regex: category,
        $options: 'i'
      };
    }

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    const [posts, totalPosts] =
      await Promise.all([
        Post.find(filter)
          .populate('author', 'name role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        Post.countDocuments(filter)
      ]);

    const totalPages =
      Math.ceil(totalPosts / limit);

    return res.status(200).json({
      page,
      limit,
      totalPosts,
      totalPages,
      filters: {
        status: 'published',
        category: category || null,
        tag: tag || null
      },
      posts
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch posts.',
      error: error.message
    });
  }
}

async function getMyPosts(req, res) {
  try {
    const userId = getUserId(req);

    const {
      status,
      category,
      tag
    } = req.query;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const skip = (page - 1) * limit;

    const filter = {
      author: userId
    };

    if (req.user.role === 'Admin') {
      filter.status = 'published';
    } else if (
      status &&
      ['draft', 'published'].includes(status)
    ) {
      filter.status = status;
    }

    if (category) {
      filter.category = {
        $regex: category,
        $options: 'i'
      };
    }

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    const [posts, totalPosts] =
      await Promise.all([
        Post.find(filter)
          .populate('author', 'name role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        Post.countDocuments(filter)
      ]);

    const totalPages =
      Math.ceil(totalPosts / limit);

    return res.status(200).json({
      page,
      limit,
      totalPosts,
      totalPages,
      filters: {
        status:
          filter.status ||
          status ||
          null,

        category:
          category || null,

        tag:
          tag || null
      },
      posts
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch your posts.',
      error: error.message
    });
  }
}

async function getMyDrafts(req, res) {
  try {
    if (req.user.role === 'Admin') {
      return res.status(403).json({
        message: 'Draft access is not available for Admin.'
      });
    }

    const userId = getUserId(req);

    const posts = await Post.find({
      author: userId,
      status: 'draft'
    })
      .populate('author', 'name role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      totalPosts: posts.length,
      posts
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch your drafts.',
      error: error.message
    });
  }
}

async function getPostById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid post ID.'
      });
    }

    const post = await Post.findById(id)
      .populate('author', 'name role');

    if (!post) {
      return res.status(404).json({
        message: 'Post not found.'
      });
    }

    if (post.status === 'draft') {
      if (!req.user) {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }

      if (req.user.role === 'Admin') {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }

      const userId = getUserId(req);

      if (!isOwner(post, userId)) {
        return res.status(404).json({
          message: 'Post not found.'
        });
      }
    }

    return res.status(200).json({
      post
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch post.'
    });
  }
}

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid post ID.'
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found.'
      });
    }

    const userId = getUserId(req);

    const owner = isOwner(
      post,
      userId
    );

    const isAdmin =
      req.user.role === 'Admin';

    const isEditor =
      req.user.role === 'Editor';

    if (post.status === 'draft') {
      if (
        isAdmin ||
        !owner
      ) {
        return res.status(403).json({
          message:
            'You are not allowed to update or publish this draft.'
        });
      }
    } else {
      if (
        !owner &&
        !isAdmin &&
        !isEditor
      ) {
        return res.status(403).json({
          message:
            'You are not allowed to update this post.'
        });
      }
    }

    const {
      title,
      content,
      excerpt,
      category,
      tags,
      status
    } = req.body;

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          message: 'Title cannot be empty.'
        });
      }

      if (title.trim().length > 200) {
        return res.status(400).json({
          message:
            'Title cannot exceed 200 characters.'
        });
      }

      post.title = title.trim();
    }

    if (content !== undefined) {
      if (!content || !content.trim()) {
        return res.status(400).json({
          message: 'Content cannot be empty.'
        });
      }

      post.content = content.trim();
    }

    if (excerpt !== undefined) {
      if (
        excerpt &&
        excerpt.trim().length > 500
      ) {
        return res.status(400).json({
          message:
            'Excerpt cannot exceed 500 characters.'
        });
      }

      post.excerpt =
        excerpt
          ? excerpt.trim()
          : '';
    }

    if (category !== undefined) {
      post.category =
        category
          ? category.trim()
          : '';
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          message: 'Tags must be an array.'
        });
      }

      post.tags = tags;
    }

    if (status !== undefined) {
      if (
        !['draft', 'published']
          .includes(status)
      ) {
        return res.status(400).json({
          message:
            'Status must be either draft or published.'
        });
      }

      if (
        post.status === 'draft' &&
        status === 'published' &&
        !owner
      ) {
        return res.status(403).json({
          message:
            'Only the draft owner can publish this post.'
        });
      }

      post.status = status;
    }

    if (
      title !== undefined ||
      content !== undefined ||
      category !== undefined ||
      tags !== undefined ||
      status === 'published'
    ) {
      try {
        const embeddingText = `
Title: ${post.title}
Excerpt: ${post.excerpt || ''}
Content: ${post.content}
Category: ${post.category || ''}
Tags: ${(post.tags || []).join(', ')}
`;

        const embedding =
          await generateEmbedding(
            embeddingText
          );

        if (embedding) {
          post.embedding = embedding;
        }
      } catch (embErr) {
        console.error(
          'Embedding regeneration warning:',
          embErr.message
        );
      }
    }

    await post.save();

    return res.status(200).json({
      message:
        post.status === 'published'
          ? 'Post published successfully.'
          : 'Post updated successfully.',
      post
    });
  } catch (error) {
    console.error(
      'Update post error:',
      error.message
    );

    return res.status(500).json({
      message: 'Failed to update post.',
      error: error.message
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid post ID.'
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found.'
      });
    }

    const userId = getUserId(req);

    const owner =
      isOwner(post, userId);

    const isAdmin =
      req.user.role === 'Admin';

    const isEditor =
      req.user.role === 'Editor';

    if (post.status === 'draft') {
      if (
        isAdmin ||
        !owner
      ) {
        return res.status(403).json({
          message:
            'You are not allowed to delete this draft.'
        });
      }
    } else {
      if (
        !owner &&
        !isAdmin &&
        !isEditor
      ) {
        return res.status(403).json({
          message:
            'You are not allowed to delete this post.'
        });
      }
    }

    await post.deleteOne();

    return res.status(200).json({
      message:
        'Post deleted successfully.'
    });
  } catch (error) {
    console.error(
      'Delete post error:',
      error.message
    );

    return res.status(500).json({
      message:
        'Failed to delete post.'
    });
  }
};

async function searchPosts(req, res) {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: 'Search query is required.'
      });
    }

    const searchTerm = q.trim();

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip =
      (page - 1) * limit;

    const pipeline = [
      {
        $search: {
          index: 'post_search',
          text: {
            query: searchTerm,
            path: [
              'title',
              'content',
              'excerpt',
              'category',
              'tags'
            ]
          }
        }
      },
      {
        $match: {
          status: 'published'
        }
      },
      {
        $facet: {
          posts: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author'
              }
            },
            {
              $unwind: {
                path: '$author',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                title: 1,
                content: 1,
                excerpt: 1,
                category: 1,
                tags: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                author: {
                  _id: '$author._id',
                  name: '$author.name',
                  role: '$author.role'
                }
              }
            }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const result =
      await Post.aggregate(pipeline);

    const posts =
      result[0]?.posts || [];

    const totalPosts =
      result[0]
        ?.totalCount[0]
        ?.count || 0;

    const totalPages =
      Math.ceil(
        totalPosts / limit
      );

    return res.status(200).json({
      query: searchTerm,
      page,
      limit,
      totalPosts,
      totalPages,
      posts
    });
  } catch (error) {
    console.error(
      'Search error:',
      error.message
    );

    return res.status(500).json({
      message:
        'Failed to search posts.',
      error: error.message
    });
  }
}

async function semanticSearchPosts(req, res) {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message:
          'Semantic search query is required.'
      });
    }

    const query = q.trim();

    const queryEmbedding =
      await generateEmbedding(query);

    const results =
      await Post.aggregate([
        {
          $vectorSearch: {
            index: 'post_vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 10
          }
        },
        {
          $match: {
            status: 'published'
          }
        },
        {
          $addFields: {
            score: {
              $meta:
                'vectorSearchScore'
            }
          }
        },
        {
          $limit: 10
        },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author'
          }
        },
        {
          $unwind: {
            path: '$author',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            title: 1,
            content: 1,
            excerpt: 1,
            category: 1,
            tags: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            score: 1,
            author: {
              _id: '$author._id',
              name: '$author.name',
              role: '$author.role'
            }
          }
        }
      ]);

    return res.status(200).json({
      query,
      count: results.length,
      results
    });
  } catch (error) {
    console.error(
      'Semantic search error:',
      error.message
    );

    return res.status(500).json({
      message:
        'Failed to perform semantic search.',
      error: error.message
    });
  }
}

module.exports = {
  createPost,
  getPosts,
  getMyPosts,
  getMyDrafts,
  getPostById,
  updatePost,
  deletePost,
  searchPosts,
  semanticSearchPosts
};