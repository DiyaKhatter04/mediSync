import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', dosage: '', times: ['08:00'], startDate: '', endDate: '',
  isPostDischarge: false, notes: ''
};

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/medicines').then(r => setMedicines(r.data)).finally(() => setLoading(false));
  }, []);

  const addTime = () => setForm({ ...form, times: [...form.times, '12:00'] });
  const updateTime = (i, v) => { const t = [...form.times]; t[i] = v; setForm({ ...form, times: t }); };
  const removeTime = (i) => setForm({ ...form, times: form.times.filter((_, idx) => idx !== i) });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/medicines', form);
      setMedicines([...medicines, res.data]);
      setForm(emptyForm);
      setShowForm(false);
      toast.success('Medicine added!');
    } catch { toast.error('Error adding medicine'); }
  };

  const remove = async (id) => {
    if (!confirm('Remove this medicine?')) return;
    await api.delete(`/medicines/${id}`);
    setMedicines(medicines.filter(m => m._id !== id));
    toast.success('Medicine removed');
  };

  const icons = ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z', 'M22 12h-4l-3 9L9 3l-3 9H2', 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'];

  if (loading) return <div className="flex items-center justify-center h-64 text-[#1D9E75] text-sm">Loading...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">My medicines</h1>
          <p className="text-sm text-gray-400 mt-0.5">{medicines.length} active medicines</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0F6E56] text-[#E1F5EE] text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#085041] transition">
          {showForm ? 'Cancel' : '+ Add medicine'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-sm font-medium text-[#0F6E56] mb-4">Add new medicine</p>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Medicine name</label>
                <input required placeholder="e.g. Metformin" value={form.name}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Dosage</label>
                <input required placeholder="e.g. 500mg" value={form.dosage}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                  onChange={e => setForm({ ...form, dosage: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Start date</label>
                <input required type="date" value={form.startDate}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                  onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">End date <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="date" value={form.endDate}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                  onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Reminder times</label>
              <div className="space-y-2">
                {form.times.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="time" value={t}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1D9E75]"
                      onChange={e => updateTime(i, e.target.value)} />
                    {form.times.length > 1 && (
                      <button type="button" onClick={() => removeTime(i)}
                        className="text-gray-300 hover:text-red-400 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addTime}
                  className="text-xs text-[#0F6E56] hover:underline">
                  + Add another time
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <input placeholder="After meals, with water..." value={form.notes}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" checked={form.isPostDischarge} className="accent-[#0F6E56]"
                onChange={e => setForm({ ...form, isPostDischarge: e.target.checked })} />
              Post-discharge medicine (recovery phase)
            </label>

            <button type="submit"
              className="w-full bg-[#0F6E56] text-[#E1F5EE] py-2.5 rounded-xl text-sm font-medium hover:bg-[#085041] transition">
              Save medicine
            </button>
          </form>
        </div>
      )}

      {/* Medicine grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {medicines.map((med, idx) => (
          <div key={med._id} className="bg-white border border-gray-100 rounded-xl p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="#0F6E56" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d={icons[idx % icons.length]} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{med.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{med.dosage}</p>
                </div>
              </div>
              <button onClick={() => remove(med._id)}
                className="opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </button>
            </div>

            {med.notes && <p className="text-xs text-gray-400 mb-3">{med.notes}</p>}

            <div className="flex flex-wrap gap-1.5 mb-3">
              {med.times.map((t, i) => (
                <span key={i} className="text-xs bg-[#E1F5EE] text-[#085041] px-2.5 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs bg-[#E1F5EE] text-[#085041] px-2 py-0.5 rounded-full font-medium">Active</span>
              {med.isPostDischarge && (
                <span className="text-xs bg-[#E6F1FB] text-[#0C447C] px-2 py-0.5 rounded-full font-medium">Post-discharge</span>
              )}
            </div>
          </div>
        ))}

        {/* Add card */}
        <button onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="bg-white border border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-[#1D9E75] hover:bg-[#E1F5EE]/30 transition group min-h-[140px]">
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#E1F5EE] flex items-center justify-center transition">
            <svg className="w-5 h-5 stroke-gray-400 group-hover:stroke-[#0F6E56]" fill="none" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-xs text-gray-400 group-hover:text-[#0F6E56] transition">Add medicine</span>
        </button>
      </div>
    </div>
  );
}