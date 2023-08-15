const Joi = require('joi');
const Post = require('../models/postModels');
const User = require('../models/userModels');

module.exports = {
  async AddPost(req, res) {
    const schema = Joi.object({
      post: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details });
    }

    const body = {
      user: req.user._id,
      post: req.body.post,
      created: new Date(),
    };

    try {
      const post = await Post.create(body);
      await User.updateOne(
        { _id: req.user._id },
        {
          $push: {
            posts: {
              postId: post._id,
              post: req.body.post,
              created: new Date(),
            },
          },
        }
      );
      res.status(200).json({ message: 'Post created', post });
    } catch (err) {
      console.error('Error creating post:', err);
      res.status(500).json({ message: 'Error occurred' });
    }
  },

  async GetAllPosts(req, res) {
    try {
      const posts = await Post.find({}).populate('user').sort({ created: -1 });

      const top = await Post.find({ totalLikes: { $gte: 2 } })
        .populate('user')
        .sort({ created: -1 });
      res.status(200).json({ message: 'All Posts', posts, top });
    } catch (err) {
      console.error('Error getting all posts:', err);
      res.status(500).json({ message: 'Error occurred' });
    }
  },

  async AddLike(req, res) {
    const postId = req.body._id;

    try {
      const updatedPost = await Post.findOneAndUpdate(
        {
          _id: postId,
          'likes.username': { $ne: req.user.username },
        },
        {
          $push: {
            likes: {
              username: req.user.username,
            },
          },
          $inc: { totalLikes: 1 },
        },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(400).json({
          message: 'You have already liked the post or the post does not exist',
        });
      }

      res
        .status(200)
        .json({ message: 'You liked the post', post: updatedPost });
    } catch (err) {
      console.error('Error adding like:', err);
      res.status(500).json({ message: 'Error occurred' });
    }
  },

  async AddComment(req, res) {
    const postId = req.body.postId;

    try {
      await Post.updateOne(
        { _id: postId },
        {
          $push: {
            comments: {
              userId: req.user._id,
              username: req.user.username,
              comment: req.body.comment,
              createdAt: new Date(),
            },
          },
        }
      );
      res.status(200).json({ message: 'Comment added to post' });
    } catch (err) {
      console.error('Error adding comment:', err);
      res.status(500).json({ message: 'Error occurred' });
    }
  },

  async GetPost(req, res) {
    try {
      const post = await Post.findOne({ _id: req.params.id })
        .populate('user')
        .populate('comments.userId');

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.status(200).json({ message: 'Post found', post });
    } catch (err) {
      console.error('Error getting post:', err);
      res.status(500).json({ message: 'Error occurred' });
    }
  },
};
