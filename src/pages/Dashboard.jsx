import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import {
  requestNotificationPermission,
  checkAndNotifyPendingDoses,
  showNotification
} from '../utils/notifications';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function StatCard({ label, value, sub, color, pct }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-medium" style={{ color }}>{value}</p>
      {pct !== undefined && (
        <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      )}
      {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
    </div>
  );
}

function DoseRow({ log, onTaken, onSnooze }) {
  const time = new Date(log.scheduledTime).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  const now = new Date();
  const diffMin = (now - new Date(log.scheduledTime)) / 60000;
  const isOverdue = diffMin > 15 && log.status === 'pending';

  const statusConfig = {
    taken:   { bg: '#E1F5EE', color: '#085041', label: 'Taken' },
    missed:  { bg: '#FCEBEB', color: '#A32D2D', label: 'Missed' },
    snoozed: { bg: '#FAEEDA', color: '#633806', label: 'Snoozed' },
    pending: { bg: '#E6F1FB', color: '#0C447C', label: 'Pending' },
  };

  const iconConfig = {
    taken:   { bg: '#E1F5EE', stroke: '#0F6E56' },
    missed:  { bg: '#FCEBEB', stroke: '#E24B4A' },
    snoozed: { bg: '#FAEEDA', stroke: '#BA7517' },
    pending: { bg: isOverdue ? '#FAEEDA' : '#E6F1FB', stroke: isOverdue ? '#BA7517' : '#185FA5' },
  };

  const ic = iconConfig[log.status] || iconConfig.pending;
  const sc = statusConfig[log.status] || statusConfig.pending;

  return (
    <div className={`flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 ${isOverdue ? 'bg-[#FFFBF5]' : ''}`}>
      <span className="text-xs text-gray-400 w-14 flex-shrink-0">{time}</span>

      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: ic.bg }}>
        <svg className="w-4 h-4 fill-none" strokeWidth="1.8" viewBox="0 0 24 24" stroke={ic.stroke}>
          {log.status === 'taken'
            ? <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            : log.status === 'missed'
            ? <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            : <><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></>
          }
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 truncate">{log.medicineName}</p>
          {isOverdue && log.status === 'pending' && (
            <span className="text-xs bg-[#FAEEDA] text-[#854F0B] px-1.5 py-0.5 rounded-full flex-shrink-0">
              overdue
            </span>
          )}
          {log.reminderCount >= 3 && (
            <span className="text-xs bg-[#FCEBEB] text-[#A32D2D] px-1.5 py-0.5 rounded-full flex-shrink-0">
              escalated
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">{log.dosage || ''}</p>
      </div>

      {log.status === 'pending' ? (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onTaken(log._id)}
            className="bg-[#0F6E56] text-[#E1F5EE] text-xs px-3 py-1.5 rounded-lg hover:bg-[#085041] transition font-medium"
          >
            Mark taken
          </button>
          <button
            onClick={() => onSnooze(log._id)}
            className="border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            Snooze
          </button>
        </div>
      ) : (
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
          style={{ background: sc.bg, color: sc.color }}
        >
          {sc.label}
        </span>
      )}
    </div>
  );
}

function InsightCard({ type, title, body }) {
  const config = {
    warning: { bg: '#FAEEDA', border: '#EF9F27', tc: '#633806', bc: '#854F0B' },
    danger:  { bg: '#FCEBEB', border: '#E24B4A', tc: '#A32D2D', bc: '#791F1F' },
    success: { bg: '#E1F5EE', border: '#1D9E75', tc: '#085041', bc: '#0F6E56' },
    info:    { bg: '#E6F1FB', border: '#378ADD', tc: '#0C447C', bc: '#185FA5' },
  };
  const c = config[type] || config.info;
  return (
    <div className="rounded-lg p-3 border-l-2" style={{ background: c.bg, borderColor: c.border, borderRadius: '0 8px 8px 0' }}>
      <p className="text-xs font-medium mb-1" style={{ color: c.tc }}>{title}</p>
      <p className="text-xs leading-relaxed" style={{ color: c.bc }}>{body}</p>
    </div>
  );
}

function NotificationBanner({ onAllow }) {
  if (Notification.permission === 'granted') return null;
  if (Notification.permission === 'denied') return null;

  return (
    <div className="bg-[#E6F1FB] border border-[#85B7EB] rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#B5D4F4] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 fill-none stroke-[#0C447C]" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-[#0C447C]">Enable dose reminders</p>
          <p className="text-xs text-[#185FA5]">Get browser notifications when it's time to take your medicine</p>
        </div>
      </div>
      <button
        onClick={onAllow}
        className="bg-[#185FA5] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#0C447C] transition flex-shrink-0"
      >
        Allow
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]         = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [notifAllowed, setNotifAllowed] = useState(Notification.permission === 'granted');
  const [lastNotified, setLastNotified] = useState({});

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/logs/today')
      ]);
      setStats(statsRes.data);
      setTodayLogs(logsRes.data);
      return logsRes.data;
    } catch (err) {
      console.error('Fetch error:', err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial load ──
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Poll every 60 seconds + fire browser notifications ──
  useEffect(() => {
    const interval = setInterval(async () => {
      const logs = await fetchData();

      if (Notification.permission !== 'granted') return;

      const now = new Date();
      logs.forEach(log => {
        if (log.status !== 'pending') return;

        const scheduled = new Date(log.scheduledTime);
        const diffMin = (now - scheduled) / 60000;
        const key1st  = `${log._id}_1`;
        const key2nd  = `${log._id}_2`;
        const key3rd  = `${log._id}_3`;

        if (diffMin >= 0 && diffMin < 2 && !lastNotified[key1st]) {
          showNotification(
            `💊 Time to take ${log.medicineName}`,
            `Your ${log.medicineName} dose is due right now.`
          );
          setLastNotified(prev => ({ ...prev, [key1st]: true }));
        }

        if (diffMin >= 15 && diffMin < 17 && !lastNotified[key2nd]) {
          showNotification(
            `⚠️ Reminder — ${log.medicineName}`,
            `Still not taken. ${log.medicineName} was due 15 minutes ago.`
          );
          setLastNotified(prev => ({ ...prev, [key2nd]: true }));
        }

        if (diffMin >= 30 && diffMin < 32 && !lastNotified[key3rd]) {
          showNotification(
            `🚨 Overdue — ${log.medicineName}`,
            `${log.medicineName} is 30 min overdue and will be marked missed.`
          );
          setLastNotified(prev => ({ ...prev, [key3rd]: true }));
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchData, lastNotified]);

  const handleAllowNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifAllowed(granted);
    if (granted) {
      toast.success('Notifications enabled!');
      showNotification('MediSync notifications on', 'You will now get dose reminders in your browser.');
    } else {
      toast.error('Notifications blocked. Please allow in browser settings.');
    }
  };

  const markTaken = async (id) => {
    try {
      await api.put(`/logs/${id}/taken`);
      setTodayLogs(l => l.map(x => x._id === id ? { ...x, status: 'taken' } : x));
      toast.success('Dose marked as taken!');
      // refresh stats
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch {
      toast.error('Failed to update. Try again.');
    }
  };

  const snooze = async (id) => {
    try {
      await api.put(`/logs/${id}/snooze`);
      setTodayLogs(l => l.map(x => x._id === id ? { ...x, status: 'snoozed' } : x));
      toast('Snoozed — reminder in 10 minutes');
    } catch {
      toast.error('Failed to snooze.');
    }
  };

  // ── Build weekly chart data from stats ──
  const chartData = stats?.dailyStats?.length > 0
    ? stats.dailyStats.map(d => ({
        day: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }),
        adherence: d.adherence
      }))
    : weekDays.map(day => ({ day, adherence: 0 }));

  // ── Risk config ──
  const riskConfig = {
    low:    { color: '#0F6E56', bg: 'bg-[#E1F5EE] border-[#5DCAA5]', text: 'text-[#085041]', pct: 20 },
    medium: { color: '#BA7517', bg: 'bg-[#FAEEDA] border-[#EF9F27]', text: 'text-[#633806]', pct: 55 },
    high:   { color: '#E24B4A', bg: 'bg-[#FCEBEB] border-[#F09595]', text: 'text-[#A32D2D]', pct: 90 },
  };
  const risk = riskConfig[stats?.riskLevel] || riskConfig.low;

  // ── Build AI patterns from stats or use defaults ──
  const patterns = stats?.patterns?.length > 0
    ? stats.patterns
    : [
        { type: 'info', title: 'No data yet', body: 'Add medicines and mark doses to see AI insights here.' }
      ];

  // ── Slot adherence ──
  const slots = stats?.slotAdherence || { morning: 100, afternoon: 100, evening: 100, night: 100 };
  const slotList = [
    { label: 'Morning (8 AM)',   key: 'morning',   color: '#1D9E75' },
    { label: 'Afternoon (2 PM)', key: 'afternoon',  color: '#1D9E75' },
    { label: 'Evening (6 PM)',   key: 'evening',    color: '#EF9F27' },
    { label: 'Night (9 PM)',     key: 'night',      color: '#E24B4A' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingCount = todayLogs.filter(l => l.status === 'pending').length;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="space-y-5">

      {/* Notification permission banner */}
      <NotificationBanner onAllow={handleAllowNotifications} />

      {/* Top bar */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-medium text-gray-900">
            {greeting}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <span className="text-xs bg-[#FAEEDA] text-[#633806] px-3 py-1.5 rounded-full font-medium">
              {pendingCount} dose{pendingCount > 1 ? 's' : ''} pending
            </span>
          )}
          {(stats?.streakCount ?? 0) > 0 && (
            <span className="text-xs bg-[#E1F5EE] text-[#085041] px-3 py-1.5 rounded-full font-medium">
              {stats.streakCount}-day streak
            </span>
          )}
          {notifAllowed && (
            <span className="text-xs bg-[#E6F1FB] text-[#0C447C] px-3 py-1.5 rounded-full font-medium">
              Notifications on
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center text-xs font-medium text-[#085041]">
            {initials}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Adherence (7d)"
            value={`${stats.adherence}%`}
            color="#0F6E56"
            pct={stats.adherence}
            sub={`${stats.taken} of ${stats.total} doses`}
          />
          <StatCard
            label="Doses taken"
            value={stats.taken}
            color="#185FA5"
            sub="This week"
          />
          <StatCard
            label="Missed doses"
            value={stats.missed}
            color="#E24B4A"
            sub={stats.missed === 0 ? 'Perfect!' : 'Check insights'}
          />
          <StatCard
            label="Risk level"
            value={stats.riskLevel.charAt(0).toUpperCase() + stats.riskLevel.slice(1)}
            color={risk.color}
            pct={risk.pct}
            sub={stats.riskLevel === 'high' ? 'Caregiver alerted' : stats.riskLevel === 'medium' ? 'Be careful' : 'Looking good'}
          />
        </div>
      )}

      {/* High risk banner */}
      {stats?.riskLevel === 'high' && (
        <div className="border rounded-xl p-4 bg-[#FCEBEB] border-[#F09595]">
          <p className="font-medium text-[#A32D2D] text-sm">High risk detected</p>
          <p className="text-xs text-[#791F1F] mt-1">
            You have missed too many doses this week. Please take your medicines regularly.
          </p>
        </div>
      )}

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT — schedule + chart */}
        <div className="lg:col-span-2 space-y-4">

          {/* Today's schedule */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-800">Today's schedule</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{todayLogs.length} doses total</span>
                <button
                  onClick={fetchData}
                  className="text-xs text-[#0F6E56] hover:underline"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="px-5">
              {todayLogs.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-400">No doses scheduled for today</p>
                  <p className="text-xs text-gray-300 mt-1">Add medicines to see your schedule here</p>
                </div>
              ) : (
                todayLogs.map(log => (
                  <DoseRow
                    key={log._id}
                    log={log}
                    onTaken={markTaken}
                    onSnooze={snooze}
                  />
                ))
              )}
            </div>
          </div>

          {/* Weekly chart */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-800">Weekly adherence</h2>
              <span className="text-xs text-gray-400">Last 7 days</span>
            </div>
            <div className="p-5">
              {chartData.every(d => d.adherence === 0) ? (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-sm text-gray-300">No data yet — take your first dose!</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} barSize={28}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      formatter={(v) => [`${v}%`, 'Adherence']}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '0.5px solid #e5e7eb',
                        boxShadow: 'none'
                      }}
                    />
                    <Bar dataKey="adherence" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.adherence >= 85 ? '#1D9E75' :
                            entry.adherence >= 65 ? '#EF9F27' :
                            '#E24B4A'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="flex gap-4 mt-2">
                {[
                  { color: '#1D9E75', label: '85%+ good' },
                  { color: '#EF9F27', label: '65–84% fair' },
                  { color: '#E24B4A', label: 'Below 65%' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                    <span className="text-xs text-gray-400">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — insights, risk, streak */}
        <div className="space-y-4">

          {/* AI Insights */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-50">
              <h2 className="text-sm font-medium text-gray-800">AI insights</h2>
            </div>
            <div className="p-4 space-y-2">
              {patterns.map((p, i) => (
                <InsightCard key={i} type={p.type} title={p.title} body={p.body} />
              ))}
            </div>
          </div>

          {/* Risk by time slot */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-50">
              <h2 className="text-sm font-medium text-gray-800">Risk by time slot</h2>
            </div>
            <div className="p-4 space-y-3">
              {slotList.map(slot => {
                const pct = slots[slot.key] ?? 100;
                const color = pct >= 85 ? '#1D9E75' : pct >= 65 ? '#EF9F27' : '#E24B4A';
                const textColor = pct >= 85 ? '#085041' : pct >= 65 ? '#854F0B' : '#A32D2D';
                return (
                  <div key={slot.key}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600">{slot.label}</span>
                      <span className="font-medium" style={{ color: textColor }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak & badges */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-50">
              <h2 className="text-sm font-medium text-gray-800">Streak & badges</h2>
            </div>
            <div className="p-4">
              <div className="bg-[#FAEEDA] rounded-xl p-3 flex items-center gap-3 mb-3">
                <span className="text-3xl font-medium text-[#633806]">
                  {stats?.streakCount ?? 0}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#412402]">Day streak</p>
                  <p className="text-xs text-[#854F0B]">
                    {(stats?.streakCount ?? 0) === 0
                      ? 'Take a dose to start your streak!'
                      : (stats?.streakCount ?? 0) >= 7
                      ? 'Amazing consistency!'
                      : "Keep it going!"}
                  </p>
                </div>
              </div>

              {stats?.badges?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.badges.map(badge => {
                    const badgeConfig = {
                      'Week warrior': { bg: '#E1F5EE', color: '#085041' },
                      'Consistent':   { bg: '#EEEDFE', color: '#3C3489' },
                      'Morning hero': { bg: '#E6F1FB', color: '#0C447C' },
                      'Month master': { bg: '#FAEEDA', color: '#633806' },
                    };
                    const bc = badgeConfig[badge] || { bg: '#F1EFE8', color: '#444441' };
                    return (
                      <span
                        key={badge}
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: bc.bg, color: bc.color }}
                      >
                        {badge}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  Earn badges by maintaining your streak. First badge at 7 days!
                </p>
              )}
            </div>
          </div>

          {/* Notification status card */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-50">
              <h2 className="text-sm font-medium text-gray-800">Reminder status</h2>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Browser notifications</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  notifAllowed
                    ? 'bg-[#E1F5EE] text-[#085041]'
                    : 'bg-[#FCEBEB] text-[#A32D2D]'
                }`}>
                  {notifAllowed ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Auto-refresh</span>
                <span className="text-xs font-medium bg-[#E1F5EE] text-[#085041] px-2 py-0.5 rounded-full">
                  Every 60s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Escalation</span>
                <span className="text-xs font-medium bg-[#E6F1FB] text-[#0C447C] px-2 py-0.5 rounded-full">
                  3-level
                </span>
              </div>
              {!notifAllowed && (
                <button
                  onClick={handleAllowNotifications}
                  className="w-full mt-2 text-xs bg-[#0F6E56] text-[#E1F5EE] py-2 rounded-lg hover:bg-[#085041] transition font-medium"
                >
                  Enable notifications
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}