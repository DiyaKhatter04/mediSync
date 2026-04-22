const sendEmail = async ({ to, subject }) => {
  console.log(`🔔 Notification → To: ${to} | ${subject}`);
  return true;
};

const reminderEmail = (medicineName, dosage, time) =>
  `Time to take ${medicineName} ${dosage} at ${time}`;

const missedEmail = (medicineName, userName, missedCount) =>
  `${userName} missed ${medicineName}. Total misses this week: ${missedCount}`;

module.exports = { sendEmail, reminderEmail, missedEmail };