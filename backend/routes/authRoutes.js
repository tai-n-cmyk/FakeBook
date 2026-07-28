import express from 'express';
const router = express.Router();
import {
  registerUser,
  verifyEmail,
  authUser,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

router.post('/register', registerUser);
router.post('/verify', verifyEmail);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
