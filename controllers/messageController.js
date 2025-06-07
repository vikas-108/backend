//controllers/messageController.js
const Message = require('../models/Message');


exports.sendMessage = async(req, res) => {
    const { from, to, content } = req.body;

  if (!from || !to || !content) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const message = new Message({ from, to, content });
    await message.save();
    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    }).sort({ sentAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
