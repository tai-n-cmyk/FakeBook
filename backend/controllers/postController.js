import Post from '../models/Post.js';
import User from '../models/User.js';

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, privacy } = req.body;
    
    let images = [];
    if (req.files) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const post = new Post({
      user: req.user._id,
      content,
      images,
      privacy: privacy || 'public',
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a post
// @route   PUT /api/posts/:id
// @access  Private
const editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    if (post.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to edit this post');
    }

    post.content = req.body.content || post.content;
    post.privacy = req.body.privacy || post.privacy;

    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
      post.images = imagePaths;
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      if (post.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this post');
      }

      if (post.sharedFrom) {
        await Post.findByIdAndUpdate(post.sharedFrom, { $inc: { shareCount: -1 } });
      }

      await post.deleteOne();
      res.json({ message: 'Post removed' });
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Newsfeed
// @route   GET /api/posts/newsfeed
// @access  Private
const getNewsfeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const posts = await Post.find({
      $or: [
        { user: req.user._id },
        { user: { $in: user.friends }, privacy: { $in: ['public', 'friends'] } },
        { user: { $in: user.following }, privacy: 'public' }
      ]
    })
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar')
      .populate({
        path: 'sharedFrom',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      })
      .sort({ createdAt: -1 });

    const filteredPosts = posts.map(post => {
      let postObj = post.toObject();
      if (postObj.sharedFrom) {
        const shared = postObj.sharedFrom;
        const isAuthor = shared.user._id.toString() === req.user._id.toString();
        const isFriend = user.friends.some(id => id.toString() === shared.user._id.toString());
        
        let canView = true;
        if (shared.privacy === 'only_me' && !isAuthor) canView = false;
        if (shared.privacy === 'friends' && !isAuthor && !isFriend) canView = false;
        
        if (!canView) {
          postObj.sharedFrom = null; // hide private shared post
        }
      }
      return postObj;
    });

    res.json(filteredPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      const isLiked = post.likes.includes(req.user._id);
      if (isLiked) {
        post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      } else {
        post.likes.push(req.user._id);
      }
      await post.save();
      res.json(post.likes);
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      const { text } = req.body;
      const comment = {
        user: req.user._id,
        text,
      };
      post.comments.push(comment);
      await post.save();
      await post.populate('comments.user', 'name avatar');
      await post.populate('comments.replies.user', 'name avatar');
      res.status(201).json(post.comments);
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Share a post
// @route   POST /api/posts/:id/share
// @access  Private
const sharePost = async (req, res) => {
  try {
    const postToShare = await Post.findById(req.params.id);
    if (postToShare) {
      const currentUser = await User.findById(req.user._id);
      
      const originalPostId = postToShare.sharedFrom || postToShare._id;
      const originalPost = await Post.findById(originalPostId);
      
      if (!originalPost) {
        res.status(404);
        throw new Error('Original post not found');
      }

      const isAuthor = originalPost.user.toString() === currentUser._id.toString();
      const isFriend = currentUser.friends.some(id => id.toString() === originalPost.user.toString());
      
      if (isAuthor) {
        res.status(400);
        throw new Error('You cannot share your own post');
      }
      
      if (originalPost.privacy === 'only_me') {
        res.status(403);
        throw new Error('This post is private and cannot be shared');
      }
      
      if (originalPost.privacy === 'friends' && !isAuthor && !isFriend) {
        res.status(403);
        throw new Error('This post is only available to friends of the author');
      }

      const newPost = new Post({
        user: req.user._id,
        content: req.body?.content || '',
        sharedFrom: originalPostId,
        privacy: req.body?.privacy || 'public',
      });
      const createdPost = await newPost.save();
      
      // Increment share count of original post safely
      await Post.findByIdAndUpdate(originalPostId, { $inc: { shareCount: 1 } });
      
      // Send notification
      if (!isAuthor) {
        const Notification = (await import('../models/Notification.js')).default;
        await Notification.create({
          recipient: originalPost.user,
          sender: req.user._id,
          type: 'share',
          post: originalPostId,
        });
      }

      res.status(201).json(createdPost);
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    console.error("Share Post Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get User Posts
// @route   GET /api/posts/user/:id
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      res.status(404);
      throw new Error('User not found');
    }

    let canView = true;
    if (targetUser.isProfileLocked) {
      if (req.user._id.toString() !== targetUser._id.toString()) {
        canView = false;
      }
    }

    if (!canView) {
      return res.json([]);
    }

    const isSelf = req.user._id.toString() === targetUserId;
    const isFriend = targetUser.friends.includes(req.user._id);

    let query = { user: targetUserId };
    if (!isSelf) {
      if (isFriend) {
        query.privacy = { $in: ['public', 'friends'] };
      } else {
        query.privacy = 'public';
      }
    }

    const posts = await Post.find(query)
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar')
      .populate({
        path: 'sharedFrom',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      })
      .sort({ createdAt: -1 });

    const currentUser = await User.findById(req.user._id);

    const filteredPosts = posts.map(post => {
      let postObj = post.toObject();
      if (postObj.sharedFrom) {
        const shared = postObj.sharedFrom;
        const isAuthor = shared.user._id.toString() === req.user._id.toString();
        const isSharedAuthorFriend = currentUser.friends.some(id => id.toString() === shared.user._id.toString());
        
        let canView = true;
        if (shared.privacy === 'only_me' && !isAuthor) canView = false;
        if (shared.privacy === 'friends' && !isAuthor && !isSharedAuthorFriend) canView = false;
        
        if (!canView) {
          postObj.sharedFrom = null; // hide private shared post
        }
      }
      return postObj;
    });

    res.json(filteredPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Reply to a comment
// @route   POST /api/posts/:id/comment/:commentId/reply
// @access  Private
const replyComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    const reply = {
      user: req.user._id,
      text: req.body.text,
    };

    comment.replies.push(reply);
    await post.save();
    
    // Populate before sending response
    await post.populate('comments.user', 'name avatar');
    await post.populate('comments.replies.user', 'name avatar');

    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createPost, editPost, deletePost, getNewsfeed, likePost, commentPost, sharePost, getUserPosts, replyComment };