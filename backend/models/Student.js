const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  session: { type: String, required: true },
  phone: { type: String },
  fatherName: { type: String },
  motherName: { type: String },
  permanentAddress: { type: String },
  admissionStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  seatNumber: { type: String, default: null },
  roomNumber: { type: String, default: null },
  admissionDate: { type: Date, default: Date.now },
  profileImage: { type: String }
});

module.exports = mongoose.model('Student', studentSchema);