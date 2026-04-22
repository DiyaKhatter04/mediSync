const mongoose = require('mongoose');

const doseLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    default: ''
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  takenAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'taken', 'missed', 'snoozed'],
    default: 'pending'
  },
  reminderCount: {
    type: Number,
    default: 0
  },
  caregiverAlerted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('DoseLog', doseLogSchema);