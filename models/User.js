// models/User.js
//Add Contact List Feature
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: String,
  contacts: [
    {
      phone: String,
      name: String,
      addedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('User', userSchema);
