const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const DoseLog = require('../models/DoseLog');
const User = require('../models/User');

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const medicines = await Medicine.find({ isActive: true });

    for (const med of medicines) {
      const user = await User.findById(med.userId);
      if (!user) continue;

      if (med.startDate && new Date(med.startDate) > now) continue;
      if (med.endDate && new Date(med.endDate) < now) continue;

      for (const timeStr of med.times) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduled = new Date();
        scheduled.setHours(hours, minutes, 0, 0);

        const diffMin = (now - scheduled) / 60000;

        const windowStart = new Date(scheduled.getTime() - 60000);
        const windowEnd   = new Date(scheduled.getTime() + 60000);

        // ── 1st reminder: at scheduled time ──
        if (diffMin >= 0 && diffMin < 1) {
          const existing = await DoseLog.findOne({
            medicineId: med._id,
            scheduledTime: { $gte: windowStart, $lte: windowEnd }
          });

          if (!existing) {
            await DoseLog.create({
              userId: med.userId,
              medicineId: med._id,
              medicineName: med.name,
              dosage: med.dosage,
              scheduledTime: scheduled,
              status: 'pending',
              reminderCount: 1
            });
            console.log(`🔔 [1st] Reminder created → ${med.name} for ${user.name}`);
          }
        }

        // ── 2nd reminder: 15 min overdue ──
        if (diffMin >= 15 && diffMin < 16) {
          const log = await DoseLog.findOne({
            medicineId: med._id,
            scheduledTime: { $gte: windowStart, $lte: windowEnd },
            status: 'pending',
            reminderCount: 1
          });

          if (log) {
            await DoseLog.findByIdAndUpdate(log._id, { reminderCount: 2 });
            console.log(`⚠️  [2nd] Strong reminder → ${med.name} for ${user.name}`);
          }
        }

        // ── 3rd reminder: 30 min overdue → mark missed ──
        if (diffMin >= 30 && diffMin < 31) {
          const log = await DoseLog.findOne({
            medicineId: med._id,
            scheduledTime: { $gte: windowStart, $lte: windowEnd },
            status: { $in: ['pending', 'snoozed'] },
            reminderCount: { $lt: 3 }
          });

          if (log) {
            await DoseLog.findByIdAndUpdate(log._id, {
              status: 'missed',
              reminderCount: 3
            });
            console.log(`🚨 [MISSED] ${med.name} marked missed for ${user.name}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Cron error:', err.message);
  }
});

console.log('⏰ Reminder cron started (every minute)');