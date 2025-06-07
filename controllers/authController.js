// controllers/authController.js

const User = require('../models/User');

exports.loginUser = async (req, res) => {
  const { phone, name } = req.body;

  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  try {
    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone, name });
      await user.save();
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// controllers/authController.js

exports.findUserByPhone = async (req, res) => {
  const { phone } = req.params;

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//new feature concept add contact

exports.addContact = async (req, res) => {
  const { userPhone, contactPhone, contactName } = req.body;

  try {
    const user = await User.findOne({ phone: userPhone });
    const contactUser = await User.findOne({ phone: contactPhone });

    if (!user || !contactUser) {
      return res.status(404).json({ message: 'User or contact not found' });
    }

    const alreadyAdded = user.contacts.some(c => c.phone === contactPhone);
    if (alreadyAdded) {
      return res.status(400).json({ message: 'Contact already added' });
    }

    user.contacts.push({
      phone: contactPhone,
      name: contactName || contactUser.name
    });

    await user.save();

    res.status(200).json({ message: 'Contact added successfully', contacts: user.contacts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
