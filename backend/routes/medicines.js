const router = require('express').Router();
const auth = require('../middleware/auth');
const Medicine = require('../models/Medicine');

// ── GET all active medicines for user ──
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET single medicine ──
router.get('/:id', auth, async (req, res) => {
  try {
    const med = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST add new medicine ──
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, times, startDate, endDate, isPostDischarge, notes } = req.body;

    if (!name || !dosage || !times || !startDate)
      return res.status(400).json({ message: 'Name, dosage, times and startDate are required' });

    if (!Array.isArray(times) || times.length === 0)
      return res.status(400).json({ message: 'At least one reminder time is required' });

    const medicine = await Medicine.create({
      userId: req.user.id,
      name: name.trim(),
      dosage: dosage.trim(),
      times,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isPostDischarge: isPostDischarge || false,
      notes: notes?.trim() || ''
    });

    res.status(201).json(medicine);
  } catch (err) {
    console.error('Add medicine error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT update medicine ──
router.put('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE medicine (soft delete) ──
router.delete('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;