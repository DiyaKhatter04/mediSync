import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Reminders() {
  const [medicines, setMedicines] = useState([]);
  const [settings, setSettings] = useState({
    emailReminders: true,
    caregiverAlerts: true,
    riskDetection: true,
    quietHours: false,
    snoozeDuration: '10',
  });

  useEffect(() => {
    api.get('/medicines').then(r => setMedicines(r.data));
  }, []);

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-6 rounded-full relative transition-colors duration-200 flex items-center px-0.5 ${value ? 'bg-[#1D9E75]' : 'bg-gray-200'}`}>
      <span className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 block ${value ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );

  const escalationSteps = [
    { num: 1, label: 'On schedule', desc: 'Email reminder sent to patient', bg: 'bg-[#E1F5EE]', numBg: 'bg-[#E1F5EE]', numColor: 'text-[#085041]' },
    { num: 2, label: '+15 minutes', desc: 'Stronger push notification sent', bg: 'bg-[#FAEEDA]', numBg: 'bg-[#FAEEDA]', numColor: 'text-[#633806]' },
    { num: 3, label: '+30 minutes', desc: 'Caregiver alert email triggered', bg: 'bg-[#FCEBEB]', numBg: 'bg-[#FCEBEB]', numColor: 'text-[#A32D2D]' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-gray-900">Reminder settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Configure escalation, notifications, and alert behaviour</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left — per medicine */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500">Per-medicine reminders</h2>

          {medicines.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
              <p className="text-sm text-gray-400">No medicines added yet.</p>
              <p className="text-xs text-gray-300 mt-1">Add medicines first to configure reminders.</p>
            </div>
          ) : medicines.map(med => (
            <div key={med._id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{med.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Times: {med.times.join(', ')}</p>
                </div>
                <span className="text-xs bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full font-medium">Active</span>
              </div>

              {/* Escalation steps */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '1st alert', sub: 'On time · Email', bg: 'bg-[#E1F5EE]', tc: 'text-[#085041]', sc: 'text-[#0F6E56]' },
                  { label: '2nd alert', sub: '+15 min · Push', bg: 'bg-[#FAEEDA]', tc: 'text-[#633806]', sc: 'text-[#854F0B]' },
                  { label: 'Caregiver', sub: '+30 min · Email', bg: 'bg-[#FCEBEB]', tc: 'text-[#A32D2D]', sc: 'text-[#791F1F]' },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} rounded-lg p-2.5 text-center`}>
                    <p className={`text-xs font-medium ${s.tc}`}>{s.label}</p>
                    <p className={`text-xs mt-0.5 ${s.sc}`}>{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right — global settings */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500">Global settings</h2>

          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {[
              { key: 'emailReminders', label: 'Email reminders', desc: 'Send email on each dose time' },
              { key: 'caregiverAlerts', label: 'Caregiver alerts', desc: 'Notify on 3+ missed doses' },
              { key: 'riskDetection', label: 'Risk detection', desc: 'Flag high-risk skipping patterns' },
              { key: 'quietHours', label: 'Quiet hours', desc: 'No alerts between 11 PM – 6 AM' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle
                  value={settings[key]}
                  onChange={v => setSettings({ ...settings, [key]: v })}
                />
              </div>
            ))}

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-800">Snooze duration</p>
                <p className="text-xs text-gray-400 mt-0.5">How long to snooze a reminder</p>
              </div>
              <select
                value={settings.snoozeDuration}
                onChange={e => setSettings({ ...settings, snoozeDuration: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1D9E75] bg-white">
                <option value="5">5 min</option>
                <option value="10">10 min</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
              </select>
            </div>
          </div>

          {/* Escalation logic */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">Escalation logic</h2>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                When a dose is not marked as taken, reminders escalate automatically:
              </p>
              <div className="space-y-3">
                {escalationSteps.map((s) => (
                  <div key={s.num} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full ${s.numBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <span className={`text-xs font-medium ${s.numColor}`}>{s.num}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={() => toast.success('Settings saved!')}
            className="w-full bg-[#0F6E56] text-[#E1F5EE] py-2.5 rounded-xl text-sm font-medium hover:bg-[#085041] transition">
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}