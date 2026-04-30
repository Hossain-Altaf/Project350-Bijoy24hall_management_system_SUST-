const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/admission/apply
// @desc    Student submits hall admission application
// @access  Private (student)
router.post('/apply', protect, authorize('student'), async (req, res) => {
  try {
    const { studentId, department, session, phone, fatherName, motherName, permanentAddress } = req.body;

    // Check if already applied
    const existing = await Student.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted an admission application' });
    }

    const student = await Student.create({
      userId: req.user._id,
      studentId,
      name: req.user.name,
      email: req.user.email,
      department,
      session,
      phone,
      fatherName,
      motherName,
      permanentAddress
    });

    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admission/my-application
// @desc    Get own admission application status
// @access  Private (student)
router.get('/my-application', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'No application found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admission/all
// @desc    Get all applications (admin/staff only)
// @access  Private (admin, staff)
router.get('/all', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { admissionStatus: status } : {};
    const students = await Student.find(filter).sort({ admissionDate: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admission/:id/status
// @desc    Approve or reject an application (admin only)
// @access  Private (admin)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { admissionStatus: status },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: `Application ${status}`, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;