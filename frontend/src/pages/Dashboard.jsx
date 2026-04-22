import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/logs/today')
    ]).then(([s, l]) => {
      setStats(s.data);
      setTodayLogs(l.data);
    }).finally(() => setLoading(false));
  }, []);

  const markTaken = async (logId) => {
    await api.put(`/logs/${logId}/taken`);
    setTodayLogs(logs => logs.map(l => l._id === logId ? { ...l, status: 'taken', takenAt: new Date() } : l));
    toast.success('Dose marked as taken!');
  };

  const snooze = async (logId) => {
    await api.put(`/logs/${logId}/snooze`);
    setTodayLogs(logs => logs.map(l => l._id === logId ? { ...l, status: 'snoozed' } : l));
    toast('Snoozed for 10 minutes', { icon: '⏰' });
  };

  const weekData = [
    { day: 'Mon', pct: 95 }, { day: 'Tue', pct: 88 }, { day: 'Wed', pct: 100 },
    { day: 'Thu', pct: 72 }, { day: 'Fri', pct: 90 }, { day: 'Sat', pct: 68 },
    { day: 'Sun', pct: stats?.adherence ?? 0 },
  ];

  const barColor = (v) => v >= 80 ? '#1D9E75' : v >= 65 ? '#EF9F27' : '#E24B4A';

  const statusStyle = {
    taken:   'bg-[#E1F5EE] text-[#085041]',
    missed:  'bg-[#FCEBEB] text-[#A32D2D]',
    snoozed: 'bg-[#FAEEDA] text-[#633806]',
    pending: 'bg-[#FAEEDA] text-[#633806]',
  };

  const riskColor = {
    low: 'text-[#0F6E56]', medium: 'text-[#EF9F27]', high: 'text-[#E24B4A]'
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#1D9E75] text-sm">
      Loading your dashboard...
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-medium text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Adherence (7d)', value: `${stats.adherence}%`, color: '#0F6E56', bar: stats.adherence, barColor: '#1D9E75' },
            { label: 'Doses taken', value: stats.taken, sub: `of ${stats.total} this week` },
            { label: 'Missed doses', value: stats.missed, color: '#E24B4A', sub: 'Night slot mostly' },
            { label: 'Risk level', value: stats.riskLevel, color: stats.riskLevel === 'high' ? '#E24B4A' : stats.riskLevel === 'medium' ? '#EF9F27' : '#1D9E75', bar: stats.riskLevel === 'high' ? 80 : stats.riskLevel === 'medium' ? 50 : 20, barColor: stats.riskLevel === 'high' ? '#E24B4A' : stats.riskLevel === 'medium' ? '#EF9F27' : '#1D9E75' },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">{c.label}</p>
              <p className="text-2xl font-medium capitalize" style={{ color: c.color || 'var(--color-text-primary)' }}>{c.value}</p>
              {c.sub && <p className="text-xs text-gray-400 mt-1">{c.sub}</p>}
              {c.bar !== undefined && (
                <div className="h-1 rounded-full bg-gray-100 mt-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.bar}%`, background: c.barColor }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Today's schedule */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium">Today's schedule</h3>
              <span className="text-xs text-gray-400">{todayLogs.length} doses</span>
            </div>
            <div className="divide-y divide-gray-50">
              {todayLogs.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">No doses scheduled today</p>
              ) : todayLogs.map(log => (
                <div key={log._id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs text-gray-400 w-12 flex-shrink-0">
                    {new Date(log.scheduledTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    log.status === 'taken' ? 'bg-[#E1F5EE]' : log.status === 'missed' ? 'bg-[#FCEBEB]' : 'bg-[#FAEEDA]'
                  }`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                      stroke={log.status === 'taken' ? '#0F6E56' : log.status === 'missed' ? '#A32D2D' : '#854F0B'}
                      strokeWidth="2">
                      {log.status === 'taken'
                        ? <path d="M20 6L9 17l-5-5" />
                        : log.status === 'missed'
                        ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                        : <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>
                      }
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{log.medicineName}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusStyle[log.status] || ''}`}>
                      {log.status}
                    </span>
                    {log.status === 'pending' && (
                      <>
                        <button onClick={() => markTaken(log._id)}
                          className="bg-[#0F6E56] text-[#E1F5EE] text-xs px-3 py-1 rounded-lg hover:bg-[#085041] transition">
                          Mark taken
                        </button>
                        <button onClick={() => snooze(log._id)}
                          className="border border-gray-200 text-gray-500 text-xs px-3 py-1 rounded-lg hover:bg-gray-50 transition">
                          Snooze
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-medium mb-4">Weekly adherence</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weekData} barSize={28}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Adherence']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }}
                />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                  {weekData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.pct)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* AI Insights */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium">AI insights</h3>
            </div>
            <div className="p-3 space-y-2">
              {stats?.riskLevel === 'high' && (
                <div className="bg-[#FCEBEB] border-l-2 border-[#E24B4A] rounded-lg p-3">
                  <p className="text-xs font-medium text-[#A32D2D]">High risk detected</p>
                  <p className="text-xs text-[#791F1F] mt-0.5">You've missed {stats.missed} doses. Caregiver has been alerted.</p>
                </div>
              )}
              <div className="bg-[#FCEBEB] border-l-2 border-[#E24B4A] rounded-lg p-3">
                <p className="text-xs font-medium text-[#A32D2D]">Night dose skipping</p>
                <p className="text-xs text-[#791F1F] mt-0.5">Missing 9 PM doses 3×/week. Set a bedtime alarm.</p>
              </div>
              <div className="bg-[#E1F5EE] border-l-2 border-[#1D9E75] rounded-lg p-3">
                <p className="text-xs font-medium text-[#085041]">Morning streak</p>
                <p className="text-xs text-[#0F6E56] mt-0.5">8 AM doses: 100% for 14 days. Great work!</p>
              </div>
              <div className="bg-[#FAEEDA] border-l-2 border-[#EF9F27] rounded-lg p-3">
                <p className="text-xs font-medium text-[#633806]">Weekend dip</p>
                <p className="text-xs text-[#854F0B] mt-0.5">Adherence drops to 70% on weekends.</p>
              </div>
            </div>
          </div>

          {/* Risk by slot */}
          {stats && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-3">Risk by time slot</h3>
              {[
                { label: 'Morning 8AM', pct: 98 },
                { label: 'Afternoon 2PM', pct: 82 },
                { label: 'Evening 6PM', pct: 74 },
                { label: 'Night 9PM', pct: 51 },
              ].map(({ label, pct }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium" style={{ color: barColor(pct) }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor(pct) }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Streak */}
          {stats && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-3">Streak & badges</h3>
              <div className="bg-[#FAEEDA] rounded-xl p-3 flex items-center gap-3 mb-3">
                <span className="text-3xl font-medium text-[#633806]">{stats.streakCount}</span>
                <div>
                  <p className="text-sm font-medium text-[#633806]">Day streak</p>
                  <p className="text-xs text-[#854F0B] mt-0.5">Don't break it tonight!</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(stats.badges?.length ? stats.badges : ['Week warrior', 'Morning hero', 'Consistent']).map(b => (
                  <span key={b} className="text-xs bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full font-medium">{b}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}