// controllers/authController.js
const Otp = require('../models/otp');
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
  } catch (err) {
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


// Temporary in-memory store for OTPs
const otpStore = {};

// in-memory otp store 
// Helper to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Step 1: Send OTP
exports.generateOTP = async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  // Optional: Validate name if needed
if (!name) return res.status(400).json({ message: 'Name is required' });

// Save to DB
const user = new User({ phone, name });
await user.save();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Save or update OTP in DB
    await Otp.findOneAndUpdate(
      { phone },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // TODO: integrate SMS sending service here
    if (process.env.NODE_ENV !== 'production') {
    console.log(`OTP for ${phone}: ${otp}`);
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

  try {
    const record = await Otp.findOne({ phone });

    if (!record) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (record.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // OTP valid — check or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }

    // Delete OTP after successful verification
    await Otp.deleteOne({ phone });

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
