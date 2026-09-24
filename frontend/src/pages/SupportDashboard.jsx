import React, { useEffect, useState } from 'react';
import { FiMessageSquare, FiClock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/support/tickets');
      setTickets(res.data.data);
    } catch (e) {
      toast.error('Failed to load support tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading support agent dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Support Ticket Desk</h1>
        <p className="text-sm text-slate-500">Assist customer inquiries, resolve product issues, and update ticket statuses.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border text-center text-slate-500 text-sm">
          No open customer tickets at this moment.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="font-mono text-xs text-slate-400 font-bold">{ticket.ticketNumber}</span>
                  <h3 className="text-base font-bold text-slate-900">{ticket.subject}</h3>
                </div>
                <Badge variant={ticket.status === 'OPEN' ? 'warning' : 'success'}>
                  {ticket.status}
                </Badge>
              </div>

              <p className="text-sm text-slate-600">{ticket.description}</p>
              <div className="text-xs text-slate-400">Customer: {ticket.customer?.name} ({ticket.customer?.email})</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;
