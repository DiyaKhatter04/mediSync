import { useEffect, useState } from 'react';
import api from '../api';

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => { api.get('/logs').then(r => setLogs(r.data)); }, []);

  const statusStyle = {
    taken: 'bg-green-100 text-green-700',
    missed: 'bg-red-100 text-red-700',
    pending: 'bg-gray-100 text-gray-600',
    snoozed: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dose Logs (Last 7 Days)</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Medicine', 'Scheduled', 'Taken At', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map(log => (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{log.medicineName}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(log.scheduledTime).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{log.takenAt ? new Date(log.takenAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[log.status]}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-center text-gray-400 py-8">No logs yet</p>}
      </div>
    </div>
  );
}