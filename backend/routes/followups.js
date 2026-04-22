const router = require('express').Router();
const auth = require('../middleware/auth');
const FollowUp = require('../models/FollowUp');

// ── GET all follow-ups ──
router.get('/', auth, async (req, res) => {
  try {
    const followups = await FollowUp.find({ userId: req.user.id })
      .sort({ scheduledDate: 1 });
    res.json(followups);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST create follow-up ──
router.post('/', auth, async (req, res) => {
  try {
    const { type, title, scheduledDate, notes } = req.body;
    if (!type || !title || !scheduledDate)
      return res.status(400).json({ message: 'Type, title and date are required' });

    const followup = await FollowUp.create({
      userId: req.user.id,
      type,
      title: title.trim(),
      scheduledDate: new Date(scheduledDate),
      notes: notes?.trim() || ''
    });
    res.status(201).json(followup);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT mark completed ──
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const fu = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed: true },
      { new: true }
    );
    if (!fu) return res.status(404).json({ message: 'Follow-up not found' });
    res.json(fu);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE follow-up ──
router.delete('/:id', auth, async (req, res) => {
  try {
    await FollowUp.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Follow-up deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;