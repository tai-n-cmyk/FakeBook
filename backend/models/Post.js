import mongoose from 'mongoose';

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      default: '',
    },
    images: [{
      type: String,
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      replies: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }]
    }],
    sharedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'only_me'],
      default: 'public',
    },
    shareCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
