const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  caregiverEmail: {
    type: String,
    default: '',
    trim: true
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'pa'],
    default: 'en'
  },
  streakCount: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: null
  },
  badges: {
    type: [String],
    default: []
  },
  role: {
    type: String,
    enum: ['Myself', 'A family member', 'A patient'],
    default: 'Myself'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);