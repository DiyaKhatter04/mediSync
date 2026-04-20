import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roles = ['Myself', 'A family member', 'A patient'];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', caregiverEmail: '', role: 'Myself'
  });
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({ pct: 0, color: '#E24B4A', label: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const checkStrength = (v) => {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    const map = [
      { pct: 5, color: '#E24B4A', label: 'Weak' },
      { pct: 25, color: '#E24B4A', label: 'Weak' },
      { pct: 50, color: '#EF9F27', label: 'Fair' },
      { pct: 75, color: '#EF9F27', label: 'Good' },
      { pct: 100, color: '#1D9E75', label: 'Strong' },
    ];
    setStrength(map[s] || map[0]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [firstName, ...rest] = form.name.split(' ');
      await register(form.name, form.email, form.password, form.caregiverEmail);
      toast.success('Welcome to MediSync!');
      navigate('/');
    } catch {
      toast.error('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const step = form.name && form.email ? (form.password ? 3 : 2) : 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden border border-gray-200 shadow-sm">

        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-[#0F6E56] p-10">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-9 h-9 rounded-xl bg-[#1D9E75] flex items-center justify-center">
                <svg className="w-5 h-5 stroke-[#E1F5EE] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M12 2C8 2 4 6 4 10c0 6 8 12 8 12s8-6 8-12c0-4-4-8-8-8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <p className="text-[#E1F5EE] font-medium text-base">MediSync</p>
                <p className="text-[#9FE1CB] text-xs">Smart adherence tracker</p>
              </div>
            </div>
            {[
              { icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11', title: 'Setup in 2 minutes', desc: 'Add medicines, timings, and caregiver email' },
              { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Private & secure', desc: 'Your health data is encrypted end-to-end' },
              { icon: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3', title: 'Built for chronic care', desc: 'Designed for diabetes, BP & post-discharge' },
            ].map(f => (
              <div key={f.title} className="flex gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#1D9E75]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 stroke-[#9FE1CB] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d={f.icon}/>
                  </svg>
                </div>
                <div>
                  <p className="text-[#E1F5EE] text-sm font-medium">{f.title}</p>
                  <p className="text-[#9FE1CB] text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {['Free forever', 'No credit card', 'HIPAA aware'].map(t => (
              <span key={t} className="bg-[#1D9E75]/20 text-[#9FE1CB] text-xs px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 bg-white p-10 flex flex-col justify-center">
          {/* Step bar */}
          <div className="flex gap-1.5 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s < step ? 'bg-[#1D9E75]' : s === step ? 'bg-[#5DCAA5]' : 'bg-gray-100'
              }`} />
            ))}
          </div>

          <h2 className="text-xl font-medium text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">Step {step} of 3 — {step === 1 ? 'Basic details' : step === 2 ? 'Set password' : 'Preferences'}</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full name</label>
                <input type="text" required placeholder="Diya Kumar"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
                <input type="email" required placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <input type="password" required placeholder="Min 8 characters"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                onChange={e => { setForm({ ...form, password: e.target.value }); checkStrength(e.target.value); }} />
              {form.password && (
                <div className="mt-1.5">
                  <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.pct + '%', background: strength.color }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label} password</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Caregiver email <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input type="email" placeholder="parent@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                onChange={e => setForm({ ...form, caregiverEmail: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">I am managing health for</label>
              <div className="flex flex-wrap gap-2">
                {roles.map(r => (
                  <button type="button" key={r}
                    onClick={() => setForm({ ...form, role: r })}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      form.role === r
                        ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#085041] font-medium'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>{r}</button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-gray-500">
              <input type="checkbox" required className="accent-[#0F6E56] mt-0.5" />
              I agree to the{' '}
              <a href="#" className="text-[#0F6E56] hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-[#0F6E56] hover:underline">Privacy Policy</a>
            </label>

            <button type="submit" disabled={loading}
              className="w-full bg-[#0F6E56] hover:bg-[#085041] text-[#E1F5EE] py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0F6E56] font-medium hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}