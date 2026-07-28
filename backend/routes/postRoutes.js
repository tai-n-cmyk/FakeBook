import express from 'express';
const router = express.Router();
import {
  createPost,
  editPost,
  deletePost,
  getNewsfeed,
  likePost,
  commentPost,
  sharePost,
  getUserPosts,
  replyComment
} from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

router.route('/').post(protect, upload.array('images', 5), createPost);
router.route('/newsfeed').get(protect, getNewsfeed);
router.route('/user/:id').get(protect, getUserPosts);
router.route('/:id').put(protect, upload.array('images', 5), editPost).delete(protect, deletePost);
router.route('/:id/like').post(protect, likePost);
router.route('/:id/comment').post(protect, commentPost);
router.route('/:id/comment/:commentId/reply').post(protect, replyComment);
router.route('/:id/share').post(protect, sharePost);

export default router;
