import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
              { icon: 'M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Smart reminders', desc: 'Escalating alerts so you never miss a dose' },
              { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', title: 'AI pattern detection', desc: 'Spots skipping trends before they become a risk' },
              { icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', title: 'Caregiver alerts', desc: 'Family notified automatically on missed doses' },
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
          <p className="text-[#5DCAA5] text-xs border-l-2 border-[#1D9E75] pl-3 leading-relaxed">
            "Helping chronic patients stay on track — one dose at a time."
          </p>
        </div>

        {/* Right form */}
        <div className="flex-1 bg-white p-10 flex flex-col justify-center">
          <h2 className="text-xl font-medium text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-7">Sign in to your MediSync account</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
              <input type="email" required placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-gray-600">Password</label>
                <a href="#" className="text-xs text-[#0F6E56] hover:underline">Forgot password?</a>
              </div>
              <input type="password" required placeholder="Your password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-500">
              <input type="checkbox" defaultChecked className="accent-[#0F6E56]" />
              Keep me signed in for 7 days
            </label>
            <button type="submit" disabled={loading}
              className="w-full bg-[#0F6E56] hover:bg-[#085041] text-[#E1F5EE] py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100"/>
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['Google', 'GitHub'].map(s => (
              <button key={s} className="border border-gray-200 rounded-lg py-2 text-xs text-gray-500 hover:bg-gray-50 transition">
                {s}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0F6E56] font-medium hover:underline">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}