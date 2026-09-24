import React, { useEffect, useState } from 'react';
import { FiUsers, FiSearch, FiShield, FiSlash, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/users?search=${encodeURIComponent(search)}`);
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load user accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus, reason: 'Admin toggle' });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Account Management</h1>
          <p className="text-sm text-slate-500">View registered users, roles, and suspend/activate accounts.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name/email..."
            className="w-full bg-white text-slate-800 text-sm rounded-lg py-2 pl-9 pr-3 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FiSearch className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
        </div>
      </div>

      {isLoading ? (
        <Loader size="lg" text="Fetching user accounts..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={u.role === 'ADMIN' ? 'primary' : u.role === 'SELLER' ? 'warning' : 'default'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(u._id, u.status)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
