const router = require('express').Router();
const auth = require('../middleware/auth');
const DoseLog = require('../models/DoseLog');
const { updateStreak } = require('../utils/streakHelper');

// ── GET today's logs ──
router.get('/today', auth, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const logs = await DoseLog.find({
      userId: req.user.id,
      scheduledTime: { $gte: start, $lte: end }
    }).sort({ scheduledTime: 1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET logs for last N days ──
router.get('/', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await DoseLog.find({
      userId: req.user.id,
      scheduledTime: { $gte: since }
    }).sort({ scheduledTime: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT mark as taken ──
router.put('/:id/taken', auth, async (req, res) => {
  try {
    const log = await DoseLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'taken', takenAt: new Date() },
      { new: true }
    );
    if (!log) return res.status(404).json({ message: 'Log not found' });

    await updateStreak(req.user.id);

    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT snooze ──
router.put('/:id/snooze', auth, async (req, res) => {
  try {
    const log = await DoseLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'snoozed' },
      { new: true }
    );
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET logs by medicine ──
router.get('/medicine/:medicineId', auth, async (req, res) => {
  try {
    const logs = await DoseLog.find({
      userId: req.user.id,
      medicineId: req.params.medicineId
    }).sort({ scheduledTime: -1 }).limit(30);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;