import express from 'express';
const router = express.Router();
import {
  updateProfile,
  toggleLockProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  followUser,
  getFriendRequests,
  getUserProfileById
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

import upload from '../middlewares/uploadMiddleware.js';

router.route('/profile').put(protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), updateProfile);
router.route('/profile/lock').put(protect, toggleLockProfile);
router.route('/search').get(protect, searchUsers);
router.route('/friends/requests').get(protect, getFriendRequests);
router.route('/friends/request/:id').post(protect, sendFriendRequest);
router.route('/friends/accept/:id').post(protect, acceptFriendRequest);
router.route('/friends/reject/:id').post(protect, rejectFriendRequest);
router.route('/follow/:id').post(protect, followUser);
router.route('/:id').get(protect, getUserProfileById);

export default router;
