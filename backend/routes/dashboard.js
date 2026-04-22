const router = require('express').Router();
const auth = require('../middleware/auth');
const DoseLog = require('../models/DoseLog');
const User = require('../models/User');

router.get('/stats', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // All non-pending logs in window
    const logs = await DoseLog.find({
      userId: req.user.id,
      scheduledTime: { $gte: since },
      status: { $ne: 'pending' }
    });

    const total  = logs.length;
    const taken  = logs.filter(l => l.status === 'taken').length;
    const missed = logs.filter(l => l.status === 'missed').length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

    // ── Pattern analysis: misses by hour ──
    const missedByHour = {};
    logs.filter(l => l.status === 'missed').forEach(l => {
      const hr = new Date(l.scheduledTime).getHours();
      missedByHour[hr] = (missedByHour[hr] || 0) + 1;
    });

    // Find most problematic hour
    let worstHour = null;
    let maxMisses = 0;
    Object.entries(missedByHour).forEach(([hr, count]) => {
      if (count > maxMisses) { maxMisses = count; worstHour = parseInt(hr); }
    });

    // ── Risk level ──
    let riskLevel = 'low';
    if (missed >= 5) riskLevel = 'high';
    else if (missed >= 2) riskLevel = 'medium';

    // ── Daily breakdown for chart ──
    const dailyMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { taken: 0, missed: 0, total: 0 };
    }
    logs.forEach(l => {
      const key = new Date(l.scheduledTime).toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].total++;
        if (l.status === 'taken') dailyMap[key].taken++;
        if (l.status === 'missed') dailyMap[key].missed++;
      }
    });
    const dailyStats = Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        adherence: data.total > 0 ? Math.round((data.taken / data.total) * 100) : 0,
        ...data
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── Adherence by time slot ──
    const slots = { morning: { t: 0, m: 0 }, afternoon: { t: 0, m: 0 }, evening: { t: 0, m: 0 }, night: { t: 0, m: 0 } };
    logs.forEach(l => {
      const hr = new Date(l.scheduledTime).getHours();
      const slot = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : hr < 21 ? 'evening' : 'night';
      if (l.status === 'taken') slots[slot].t++;
      if (l.status === 'missed') slots[slot].m++;
    });
    const slotAdherence = Object.entries(slots).reduce((acc, [slot, data]) => {
      const tot = data.t + data.m;
      acc[slot] = tot > 0 ? Math.round((data.t / tot) * 100) : 100;
      return acc;
    }, {});

    // ── Smart patterns ──
    const patterns = [];
    if (worstHour !== null && maxMisses >= 2) {
      const label = worstHour < 12 ? 'Morning' : worstHour < 17 ? 'Afternoon' : worstHour < 21 ? 'Evening' : 'Night';
      patterns.push({ type: 'warning', title: `${label} dose skipping`, body: `You miss ${maxMisses}+ doses at ${worstHour}:00. Consider setting an alarm.` });
    }
    if (slotAdherence.morning >= 95) {
      patterns.push({ type: 'success', title: 'Morning consistency', body: 'Your morning doses are excellent. Keep it up!' });
    }
    if (slotAdherence.night < 70) {
      patterns.push({ type: 'warning', title: 'Night doses at risk', body: `Only ${slotAdherence.night}% adherence at night. Set a bedtime reminder.` });
    }

    // ── User for streak/badges ──
    const user = await User.findById(req.user.id).select('streakCount badges');

    res.json({
      adherence,
      total,
      taken,
      missed,
      riskLevel,
      missedByHour,
      worstHour,
      dailyStats,
      slotAdherence,
      patterns,
      streakCount: user?.streakCount || 0,
      badges: user?.badges || []
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;