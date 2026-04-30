const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/seats
// @desc    Get all seats with availability
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const seats = await Seat.find().populate('occupiedBy', 'name studentId department');
    res.json({ success: true, count: seats.length, data: seats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/seats/available
// @desc    Get available seats only
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    const seats = await Seat.find({ isOccupied: false });
    res.json({ success: true, count: seats.length, data: seats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/seats
// @desc    Add new seat (admin only)
// @access  Private (admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { seatNumber, roomNumber, floor, seatType } = req.body;

    const existing = await Seat.findOne({ seatNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Seat number already exists' });
    }

    const seat = await Seat.create({ seatNumber, roomNumber, floor, seatType });
    res.status(201).json({ success: true, data: seat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/seats/seed
// @desc    Seed initial seats (admin only) — generates seats automatically
// @access  Private (admin)
router.post('/seed', protect, authorize('admin'), async (req, res) => {
  try {
    const { floors = 5, roomsPerFloor = 10, seatsPerRoom = 4 } = req.body;
    const seats = [];

    for (let floor = 1; floor <= floors; floor++) {
      for (let room = 1; room <= roomsPerFloor; room++) {
        const roomNumber = `${floor}0${room < 10 ? '0' + room : room}`;
        for (let seat = 1; seat <= seatsPerRoom; seat++) {
          seats.push({
            seatNumber: `${roomNumber}-S${seat}`,
            roomNumber,
            floor,
            seatType: seatsPerRoom > 1 ? 'shared' : 'single'
          });
        }
      }
    }

    await Seat.insertMany(seats, { ordered: false });
    res.json({ success: true, message: `${seats.length} seats seeded successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/seats/allocate/:studentId
// @desc    Allocate a seat to a student (admin/staff)
// @access  Private (admin, staff)
router.put('/allocate/:studentId', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { seatNumber } = req.body;

    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.admissionStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Student admission must be approved first' });
    }

    const seat = await Seat.findOne({ seatNumber });
    if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });
    if (seat.isOccupied) return res.status(400).json({ success: false, message: 'Seat already occupied' });

    // Free previous seat if student had one
    if (student.seatNumber) {
      await Seat.findOneAndUpdate(
        { seatNumber: student.seatNumber },
        { isOccupied: false, occupiedBy: null, allocatedAt: null }
      );
    }

    // Assign new seat
    seat.isOccupied = true;
    seat.occupiedBy = student._id;
    seat.allocatedAt = new Date();
    await seat.save();

    student.seatNumber = seat.seatNumber;
    student.roomNumber = seat.roomNumber;
    await student.save();

    res.json({ success: true, message: `Seat ${seatNumber} allocated to ${student.name}`, data: seat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/seats/deallocate/:studentId
// @desc    Remove seat from a student (admin only)
// @access  Private (admin)
router.put('/deallocate/:studentId', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student || !student.seatNumber) {
      return res.status(404).json({ success: false, message: 'Student or seat not found' });
    }

    await Seat.findOneAndUpdate(
      { seatNumber: student.seatNumber },
      { isOccupied: false, occupiedBy: null, allocatedAt: null }
    );

    student.seatNumber = null;
    student.roomNumber = null;
    await student.save();

    res.json({ success: true, message: 'Seat deallocated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;