const express = require('express')
const router = express.Router()
const Blog = require('../models/Blog')
const auth = require('../middleware/auth')

// GET /api/blog/stats - Get blog statistics including top contributors
router.get('/stats', async (req, res) => {
  try {
    // Get total members count (users who have created at least one post)
    const totalMembers = await Blog.distinct('authorEmail').then(emails => emails.length)
    
    // Get active today count (users who created posts today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeToday = await Blog.distinct('authorEmail', {
      createdAt: { $gte: today }
    }).then(emails => emails.length)
    
    res.json({
      success: true,
      data: {
        totalMembers,
        activeToday
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog stats',
      error: error.message
    })
  }
})

// GET /api/blog/top-contributors - Get top contributors by post count
router.get('/top-contributors', async (req, res) => {
  try {
    const { limit = 4 } = req.query
    
    // Aggregate to get top contributors by post count
    const topContributors = await Blog.aggregate([
      {
        $group: {
          _id: '$authorEmail',
          authorName: { $first: '$author' },
          postCount: { $sum: 1 }
        }
      },
      {
        $sort: { postCount: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 0,
          name: '$authorName',
          email: '$_id',
          postCount: 1
        }
      }
    ])
    
    // Add rank numbers
    const contributorsWithRank = topContributors.map((contributor, index) => ({
      ...contributor,
      rank: index + 1
    }))
    
    res.json({
      success: true,
      data: contributorsWithRank
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top contributors',
      error: error.message
    })
  }
})

// GET /api/blog/search - Search blog posts
router.get('/search', async (req, res) => {
  try {
    const { q, sort = 'newest' } = req.query
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      })
    }
    
    let sortOption = {}
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 }
        break
      case 'newest':
      default:
        sortOption = { createdAt: -1 }
        break
    }
    
    const searchRegex = new RegExp(q.trim(), 'i')
    const blogs = await Blog.find({
      $and: [
        {
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { tags: { $in: [searchRegex] } },
            { author: searchRegex }
          ]
        },
        {
          status: 'published',
          approvalStatus: 'approved'
        }
      ]
    })
      .sort(sortOption)
      .select('-__v')
    
    res.json({
      success: true,
      data: blogs,
      count: blogs.length,
      query: q
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching blog posts',
      error: error.message
    })
  }
})

// GET /api/blog - Get all blog posts with optional sorting and pagination
router.get('/', async (req, res) => {
  try {
    const { sort = 'newest', page = 1, limit = 10 } = req.query
    
    let sortOption = {}
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 }
        break
      case 'newest':
      default:
        sortOption = { createdAt: -1 }
        break
    }
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum
    
    const totalPosts = await Blog.countDocuments({ 
      status: 'published', 
      approvalStatus: 'approved' 
    })
    const blogs = await Blog.find({ 
      status: 'published', 
      approvalStatus: 'approved' 
    })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('-__v')
    
    const totalPages = Math.ceil(totalPosts / limitNum)
    
    res.json({
      success: true,
      data: blogs,
      count: blogs.length,
      totalPosts,
      totalPages,
      currentPage: pageNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog posts',
      error: error.message
    })
  }
})

// GET /api/blog/mine - Get posts created by current user
router.get('/mine', auth, async (req, res) => {
  try {
    const { sort = 'newest', page = 1, limit = 10 } = req.query

    let sortOption = {}
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 }
        break
      case 'newest':
      default:
        sortOption = { createdAt: -1 }
        break
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const filter = { authorEmail: req.user.email }

    const totalPosts = await Blog.countDocuments(filter)
    const blogs = await Blog.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('-__v')

    const totalPages = Math.ceil(totalPosts / limitNum)

    res.json({
      success: true,
      data: blogs,
      count: blogs.length,
      totalPosts,
      totalPages,
      currentPage: pageNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message
    })
  }
})

// GET /api/blog/my-posts - Get user's posts with approval status
router.get('/my-posts', auth, async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination || { page: 1, limit: 10, skip: 0 };

    const posts = await Blog.find({ authorId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments({ authorId: req.user._id });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message
    });
  }
});

// GET /api/blog/saved - Get posts bookmarked by current user
router.get('/saved', auth, async (req, res) => {
  try {
    const { sort = 'newest', page = 1, limit = 10 } = req.query

    let sortOption = {}
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 }
        break
      case 'newest':
      default:
        sortOption = { createdAt: -1 }
        break
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const filter = { 'bookmarks.userEmail': req.user.email }

    const totalPosts = await Blog.countDocuments(filter)
    const blogs = await Blog.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('-__v')

    const totalPages = Math.ceil(totalPosts / limitNum)

    res.json({
      success: true,
      data: blogs,
      count: blogs.length,
      totalPosts,
      totalPages,
      currentPage: pageNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching saved posts',
      error: error.message
    })
  }
})

// GET /api/blog/trending-hashtags - Get trending hashtags based on actual usage
router.get('/trending-hashtags', async (req, res) => {
  try {
    const { limit = 5 } = req.query
    
    // Aggregate to get trending hashtags from published and approved posts
    const trendingHashtags = await Blog.aggregate([
      {
        $match: {
          status: 'published',
          approvalStatus: 'approved',
          tags: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          recentPosts: { $sum: 1 } // Count of posts using this tag
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: '' } // Exclude null/empty tags
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 0,
          tag: { $concat: ['#', '$_id'] },
          count: 1,
          trend: 'up' // For now, we'll show all as trending up
        }
      }
    ])
    
    res.json({
      success: true,
      data: trendingHashtags
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trending hashtags',
      error: error.message
    })
  }
})

// GET /api/blog/:id - Get a single blog post
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const blog = await Blog.findById(id).select('-__v')
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }
    
    res.json({
      success: true,
      data: blog
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post',
      error: error.message
    })
  }
})

// POST /api/blog - Create a new blog post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, image, category, tags } = req.body
    
    // Validation - only title and content required
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      })
    }
    
    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      })
    }
    
    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Content must be less than 5000 characters'
      })
    }
    
    const newBlog = new Blog({
      title: title.trim(),
      content: content.trim(),
      excerpt: content.substring(0, 200) + '...',
      image: image || null,
      author: req.user.name,
      authorEmail: req.user.email,
      authorId: req.user._id,
      category: category || null,
      tags: tags || [],
      likes: [],
      bookmarks: [],
      shares: [],
      comments: [],
      status: 'pending_approval',
      approvalStatus: 'pending'
    })
    
    const savedBlog = await newBlog.save()
    
    res.status(201).json({
      success: true,
      message: 'Thank you for your submission! Your blog post has been sent for review. We will notify you once it\'s approved and published.',
      data: savedBlog
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating blog post',
      error: error.message
    })
  }
})

// POST /api/blog/:id/like - Toggle like on a blog post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params
    const userEmail = req.user.email
    
    const blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }
    
    // Check if user already liked the post
    const existingLikeIndex = blog.likes.findIndex(like => like.userEmail === userEmail)
    
    if (existingLikeIndex > -1) {
      // Unlike - remove the like
      blog.likes.splice(existingLikeIndex, 1)
    } else {
      // Like - add the like
      blog.likes.push({ userEmail })
    }
    
    const updatedBlog = await blog.save()
    
    res.json({
      success: true,
      message: existingLikeIndex > -1 ? 'Post unliked' : 'Post liked',
      data: updatedBlog,
      liked: existingLikeIndex === -1
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating like',
      error: error.message
    })
  }
})

// POST /api/blog/:id/bookmark - Toggle bookmark on a blog post
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const { id } = req.params
    const userEmail = req.user.email
    
    const blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }
    
    const existingBookmark = blog.bookmarks.find(bookmark => bookmark.userEmail === userEmail)
    
    if (existingBookmark) {
      // Remove bookmark
      blog.bookmarks = blog.bookmarks.filter(bookmark => bookmark.userEmail !== userEmail)
      await blog.save()
      
      res.json({
        success: true,
        bookmarked: false,
        bookmarkCount: blog.bookmarks.length,
        message: 'Post unbookmarked'
      })
    } else {
      // Add bookmark
      blog.bookmarks.push({
        userEmail: userEmail,
        userId: req.user._id,
        createdAt: new Date()
      })
      await blog.save()
      
      res.json({
        success: true,
        bookmarked: true,
        bookmarkCount: blog.bookmarks.length,
        message: 'Post bookmarked'
      })
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    res.status(500).json({
      success: false,
      message: 'Error toggling bookmark',
      error: error.message
    })
  }
})

// POST /api/blog/:id/comments - Add a comment to a blog post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      })
    }
    
    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be less than 500 characters'
      })
    }
    
    const blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }
    
    const newComment = {
      content: content.trim(),
      author: req.user.name,
      authorEmail: req.user.email
    }
    
    blog.comments.push(newComment)
    const updatedBlog = await blog.save()
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: updatedBlog
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    })
  }
})


// PUT /api/blog/:id - Update a blog post
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, category, tags, image } = req.body
    
    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      })
    }
    
    const blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }
    
    // Check if user owns the post
    if (blog.authorEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts'
      })
    }
    
    // Update the blog post
    blog.title = title.trim()
    blog.content = content.trim()
    blog.excerpt = content.substring(0, 200) + '...'
    blog.category = category || blog.category
    blog.tags = tags || blog.tags
    blog.image = image !== undefined ? image : blog.image
    blog.updatedAt = new Date()
    
    const updatedBlog = await blog.save()
    
    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedBlog
    })
  } catch (error) {
    console.error('Error updating blog post:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating blog post',
      error: error.message
    })
  }
})

// POST /api/blog/:id/share - Share a blog post
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params
    
    const blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }
    
    // Increment share count by adding user to shares array
    const existingShare = blog.shares.find(share => 
      share.userEmail === req.user.email || share.userId.toString() === req.user._id.toString()
    )
    
    if (!existingShare) {
      blog.shares.push({
        userEmail: req.user.email,
        userId: req.user._id,
        createdAt: new Date()
      })
    }
    
    await blog.save()
    
    res.json({
      success: true,
      message: 'Post shared successfully',
      shareCount: blog.shares.length
    })
  } catch (error) {
    console.error('Error sharing blog post:', error)
    res.status(500).json({
      success: false,
      message: 'Error sharing blog post',
      error: error.message
    })
  }
})

// DELETE /api/blog/:id - Delete a blog post
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    
    const blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }
    
    // Check if user owns the post
    if (blog.authorEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      })
    }
    
    await Blog.findByIdAndDelete(id)
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting blog post',
      error: error.message
    })
  }
})

// Get top contributors
router.get('/top-contributors', async (req, res) => {
  try {
    // Aggregate posts by author to get top contributors
    const topContributors = await Blog.aggregate([
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 },
          lastPost: { $max: '$createdAt' }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: '' } // Exclude null/empty authors
        }
      },
      {
        $sort: { postCount: -1 }
      },
      {
        $limit: 4
      },
      {
        $project: {
          name: '$_id',
          postCount: 1,
          lastPost: 1,
          _id: 0
        }
      }
    ])

    res.json({
      success: true,
      data: topContributors
    })
  } catch (error) {
    console.error('Error fetching top contributors:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top contributors'
    })
  }
})

module.exports = router