import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Generate dummy verification code 123456
    const verificationCode = '123456';

    const user = await User.create({
      name,
      email,
      password,
      verificationCode,
    });

    if (user) {
      // Simulate sending email (Nodemailer dummy)
      console.log(`Simulated Email Sent to ${email} with code: ${verificationCode}`);

      res.status(201).json({
        message: 'User registered. Please verify your email with the code 123456.',
        email: user.email
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify user email
// @route   POST /api/auth/verify
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({ email });

    if (user && user.verificationCode === code) {
      user.isEmailVerified = true;
      user.verificationCode = undefined; // clear code
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid email or verification code');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isEmailVerified) {
        res.status(401);
        throw new Error('Please verify your email first (use code 123456).');
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      // Dummy code for password reset
      user.verificationCode = '123456';
      await user.save();
      console.log(`Simulated Reset Email Sent to ${email} with code: 123456`);
      res.json({ message: 'Reset code sent to email (123456)' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (user && user.verificationCode === code) {
      user.password = newPassword;
      user.verificationCode = undefined;
      await user.save();
      res.json({ message: 'Password reset successful' });
    } else {
      res.status(400);
      throw new Error('Invalid email or reset code');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { registerUser, verifyEmail, authUser, forgotPassword, resetPassword };
