const Message = require('../models/messageModels');
const Conversation = require('../models/conversationModels');
const User = require('../models/userModels');

module.exports = {
  async GetAllMessages(req, res) {
    const { sender_Id, receiver_Id } = req.params;
    try {
      const conversation = await Conversation.findOne({
        $or: [
          {
            $and: [
              { 'participants.senderId': sender_Id },
              { 'participants.receiverId': receiver_Id },
            ],
          },
          {
            $and: [
              { 'participants.senderId': receiver_Id },
              { 'participants.receiverId': sender_Id },
            ],
          },
        ],
      }).select('_id');

      if (conversation) {
        const messages = await Message.find(
          { conversationId: conversation._id },
          'message' // Specify the fields you want to include
        );
        res.status(200).json({ message: 'Messages returned', messages });
      } else {
        res.status(404).json({ message: 'Conversation not found' });
      }
    } catch (error) {
      console.error('GetAllMessages error:', error);
      res.status(500).json({ message: 'Error occurred' });
    }
  },

  async SendMessage(req, res) {
    const { sender_Id, receiver_Id } = req.params;
    try {
      const result = await Conversation.find({
        $or: [
          {
            participants: {
              $elemMatch: { senderId: sender_Id, receiverId: receiver_Id },
            },
          },
          {
            participants: {
              $elemMatch: { senderId: receiver_Id, receiverId: sender_Id },
            },
          },
        ],
      }).exec();

      if (result.length > 0) {
        // Handle existing conversation logic here
        await Message.updateOne(
          {
            conversationId: result[0]._id,
          },
          {
            $push: {
              message: {
                senderId: req.user._id,
                receiverId: req.params.receiver_Id,
                sendername: req.user.username,
                receivername: req.body.receiverName,
                body: req.body.message,
              },
            },
          }
        )
          .then(() =>
            res.status(200).json({ message: 'Message sent successfully' })
          )
          .catch((err) => res.status(500).json({ message: 'Error occurred' }));
      } else {
        const newConversation = new Conversation();
        newConversation.participants.push({
          senderId: req.user._id,
          receiverId: req.params.receiver_Id,
        });
        const saveConversation = await newConversation.save();

        const newMessage = new Message();
        newMessage.conversationId = saveConversation._id;
        newMessage.sender = req.user.username;
        newMessage.receiver = req.body.receiverName;
        newMessage.message.push({
          senderId: req.user._id,
          receiverId: req.params.receiver_Id,
          sendername: req.user.username,
          receivername: req.body.receiverName,
          body: req.body.message,
        });

        // Update sender's chat list
        await User.updateOne(
          {
            _id: req.user._id,
          },
          {
            $push: {
              chatList: {
                $each: [
                  {
                    receiverId: req.params.receiver_Id,
                    msgId: newMessage._id,
                  },
                ],
                $position: 0,
              },
            },
          }
        );

        // Update receiver's chat list
        await User.updateOne(
          {
            _id: req.params.receiver_Id,
          },
          {
            $push: {
              chatList: {
                $each: [
                  {
                    receiverId: req.user._id,
                    msgId: newMessage._id,
                  },
                ],
                $position: 0,
              },
            },
          }
        );

        // Save the new message
        await newMessage.save();

        res.status(200).json({ message: 'SendMessage logic executed' });
      }
    } catch (error) {
      console.error('SendMessage error:', error);
      res.status(500).json({ message: 'Error occurred' });
    }
  },
};
