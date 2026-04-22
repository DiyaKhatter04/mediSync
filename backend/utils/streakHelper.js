const User = require('../models/User');

const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streakCount;

    if (!last || last.getTime() === yesterday.getTime()) {
      newStreak = (user.streakCount || 0) + 1;
    } else if (last.getTime() < yesterday.getTime()) {
      newStreak = 1;
    }

    const badges = [...(user.badges || [])];
    if (newStreak >= 7 && !badges.includes('Week warrior')) badges.push('Week warrior');
    if (newStreak >= 14 && !badges.includes('Consistent')) badges.push('Consistent');
    if (newStreak >= 30 && !badges.includes('Month master')) badges.push('Month master');

    await User.findByIdAndUpdate(userId, {
      streakCount: newStreak,
      lastActiveDate: new Date(),
      badges
    });
  } catch (err) {
    console.error('Streak update error:', err.message);
  }
};

module.exports = { updateStreak };