const User = require('../models/userModels');

module.exports = {
  FollowUser(req, res) {
    const followUser = async () => {
      await User.updateOne(
        {
          _id: req.user._id,
          'following.userFollowed': { $ne: req.body.userFollowed },
        },
        {
          $push: {
            following: {
              userFollowed: req.body.userFollowed,
            },
          },
        }
      );

      await User.updateOne(
        {
          _id: req.body.userFollowed,
          'following.follower': { $ne: req.user._id },
        },
        {
          $push: {
            followers: {
              follower: req.user._id,
            },
            notifications: {
              senderId: req.user._id,
              message: `${req.user.username} is now following you.`,
              created: new Date(),
              viewProfile: false,
            },
          },
        }
      );
    };

    followUser()
      .then(() => {
        res.status(200).json({ message: 'Following user now' });
      })
      .catch((err) => {
        console.error('FollowUser error:', err);
        res.status(500).json({ message: 'Error occurred' });
      });
  },
  UnFollowUser(req, res) {
    const UnFollowUser = async () => {
      try {
        const user = await User.findOneAndUpdate(
          {
            _id: req.user._id,
            'following.userFollowed': req.body.userFollowed,
          },
          {
            $pull: {
              following: {
                userFollowed: req.body.userFollowed,
              },
            },
          }
        );

        if (user) {
          await User.findOneAndUpdate(
            {
              _id: req.body.userFollowed,
            },
            {
              $pull: {
                followers: {
                  follower: req.user._id,
                },
              },
            }
          );
        } else {
          throw new Error('User is not being followed');
        }
      } catch (err) {
        throw err;
      }
    };

    UnFollowUser()
      .then(() => {
        res.status(200).json({ message: 'Unfollowing user now' });
      })
      .catch((err) => {
        console.error('UnFollowUser error:', err);
        res.status(500).json({ message: 'Error occurred' });
      });
  },
  async MarkNotification(req, res) {
    if (!req.body.deleteValue) {
      await User.updateOne(
        {
          _id: req.user._id,
          'notifications._id': req.params.id,
        },
        {
          $set: { 'notifications.$.read': true },
        }
      )
        .then(() => {
          res.status(200).json({ message: 'Marked as read' });
        })
        .catch((err) => {
          res.status(500).json({ message: 'Error occurred' });
        });
    } else {
      await User.updateOne(
        {
          _id: req.user._id,
          'notifications._id': req.params.id,
        },
        {
          $pull: {
            notifications: { _id: req.params.id },
          },
        }
      )
        .then(() => {
          res.status(200).json({ message: 'Deleted successfully' });
        })
        .catch((err) => {
          res.status(500).json({ message: 'Error occurred' });
        });
    }
  },
  async MarkAllNotifications(req, res) {
    try {
      await User.updateMany(
        { _id: req.user._id, 'notifications.read': false },
        { $set: { 'notifications.$.read': true } }
      );

      res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
      console.error('MarkAllNotifications error:', error);
      res.status(500).json({ message: 'Error occurred' });
    }
  },
};
