import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      
      if (req.files && req.files.avatar && req.files.avatar.length > 0) {
        user.avatar = `/uploads/${req.files.avatar[0].filename}`;
      }
      
      if (req.files && req.files.cover && req.files.cover.length > 0) {
        user.cover = `/uploads/${req.files.cover[0].filename}`;
      }
      
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle profile lock
// @route   PUT /api/users/profile/lock
// @access  Private
const toggleLockProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isProfileLocked = !user.isProfileLocked;
      await user.save();
      res.json({ message: `Profile is now ${user.isProfileLocked ? 'locked' : 'unlocked'}` });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by name
// @route   GET /api/users/search?name=...
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.name
      ? { name: { $regex: req.query.name, $options: 'i' } }
      : {};
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).select('name avatar bio isProfileLocked friendRequests friends');
    
    const currentUser = await User.findById(req.user._id);
    
    const usersWithRelation = users.map(u => {
      let relationship = 'none';
      if (currentUser.friends.includes(u._id)) {
        relationship = 'friends';
      } else if (u.friendRequests.includes(currentUser._id)) {
        relationship = 'pending_sent';
      } else if (currentUser.friendRequests.includes(u._id)) {
        relationship = 'pending_received';
      }
      return {
        _id: u._id,
        name: u.name,
        avatar: u.avatar,
        bio: u.bio,
        isProfileLocked: u.isProfileLocked,
        relationship
      };
    });

    res.json(usersWithRelation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send Friend Request
// @route   POST /api/users/friends/request/:id
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);
    if (targetUser && !targetUser.friendRequests.includes(req.user._id) && !targetUser.friends.includes(req.user._id)) {
      targetUser.friendRequests.push(req.user._id);
      await targetUser.save();
      res.json({ message: 'Friend request sent' });
    } else {
      res.status(400).json({ message: 'User not found or request already sent/friends already' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept Friend Request
// @route   POST /api/users/friends/accept/:id
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const senderId = req.params.id;
    const user = await User.findById(req.user._id);
    const sender = await User.findById(senderId);

    if (user && sender && user.friendRequests.includes(senderId)) {
      user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
      user.friends.push(senderId);
      sender.friends.push(user._id);
      await user.save();
      await sender.save();
      res.json({ message: 'Friend request accepted' });
    } else {
      res.status(400).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject Friend Request
// @route   POST /api/users/friends/reject/:id
// @access  Private
const rejectFriendRequest = async (req, res) => {
  try {
    const senderId = req.params.id;
    const user = await User.findById(req.user._id);

    if (user && user.friendRequests.includes(senderId)) {
      user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
      await user.save();
      res.json({ message: 'Friend request rejected' });
    } else {
      res.status(400).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Follow User
// @route   POST /api/users/follow/:id
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user._id);

    if (targetUser) {
      const isFollowing = currentUser.following.includes(targetUserId);
      if (isFollowing) {
        currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
      } else {
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUser._id);
      }
      
      await currentUser.save();
      await targetUser.save();
      res.json({ message: isFollowing ? 'User unfollowed successfully' : 'User followed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Friend Requests
// @route   GET /api/users/friends/requests
// @access  Private
const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests', 'name avatar');
    if (user) {
      res.json(user.friendRequests);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get User Profile By ID
// @route   GET /api/users/:id
// @access  Private
const getUserProfileById = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select('-password');
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      res.status(404);
      throw new Error('User not found');
    }

    let relationship = 'none'; // none, pending_sent, pending_received, friends, self
    if (req.user._id.toString() === targetUser._id.toString()) {
      relationship = 'self';
    } else if (targetUser.friends.includes(req.user._id)) {
      relationship = 'friends';
    } else if (targetUser.friendRequests.includes(req.user._id)) {
      relationship = 'pending_sent';
    } else if (currentUser.friendRequests.includes(targetUser._id)) {
      relationship = 'pending_received';
    }

    let isFollowing = false;
    if (currentUser.following.includes(targetUser._id)) {
      isFollowing = true;
    }

    let profileData = {
      _id: targetUser._id,
      name: targetUser.name,
      avatar: targetUser.avatar,
      cover: targetUser.cover,
      bio: targetUser.bio,
      isProfileLocked: targetUser.isProfileLocked,
      relationship,
      isFollowing
    };

    if (targetUser.isProfileLocked && relationship !== 'self') {
      profileData.bio = 'This profile is locked.';
    }

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { updateProfile, toggleLockProfile, searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, followUser, getFriendRequests, getUserProfileById };
