export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (title, body) => {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      requireInteraction: false,
    });
  } catch (err) {
    console.log('Notification error:', err.message);
  }
};

export const checkAndNotifyPendingDoses = (logs) => {
  if (Notification.permission !== 'granted') return;
  if (!logs || logs.length === 0) return;

  const now = new Date();

  logs.forEach(log => {
    if (log.status !== 'pending') return;

    const scheduled = new Date(log.scheduledTime);
    const diffMin = (now - scheduled) / 60000;

    // 1st — right on time
    if (diffMin >= 0 && diffMin < 2) {
      showNotification(
        `💊 Time to take ${log.medicineName}`,
        `Your ${log.medicineName} dose is due right now. Open MediSync to mark it taken.`
      );
    }

    // 2nd — 15 min overdue
    if (diffMin >= 15 && diffMin < 17) {
      showNotification(
        `⚠️ Still not taken — ${log.medicineName}`,
        `${log.medicineName} was due 15 minutes ago. Please take it now.`
      );
    }

    // 3rd — 30 min overdue
    if (diffMin >= 30 && diffMin < 32) {
      showNotification(
        `🚨 Overdue — ${log.medicineName}`,
        `${log.medicineName} is 30 minutes overdue. This will be marked as missed soon.`
      );
    }
  });
};