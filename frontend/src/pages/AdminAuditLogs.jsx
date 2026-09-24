import React, { useEffect, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data.data);
    } catch (e) {
      toast.error('Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security Audit Logs</h1>
        <p className="text-sm text-slate-500">Immutable audit log history for sensitive admin operations.</p>
      </div>

      {isLoading ? (
        <Loader size="lg" text="Fetching audit trail..." />
      ) : logs.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border text-center text-slate-500 text-sm">No security audit logs recorded yet.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="p-4 font-bold text-slate-900">{log.actor?.name || 'System'}</td>
                  <td className="p-4"><Badge variant="primary">{log.action}</Badge></td>
                  <td className="p-4 text-xs font-mono text-slate-600">{log.targetModel}</td>
                  <td className="p-4 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
