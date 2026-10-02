import React, { useEffect, useState } from 'react';
import { FiMessageSquare, FiClock, FiCheckCircle, FiSend, FiUser, FiCornerDownRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

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

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      await api.post(`/support/tickets/${activeTicket._id}/reply`, {
        message: replyText.trim(),
      });
      toast.success('Reply submitted to customer!');
      setReplyText('');
      setActiveTicket(null);
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading support agent dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Support Ticket Desk</h1>
          <p className="text-sm text-slate-500">
            Assist customer inquiries, resolve product issues, and update ticket statuses.
          </p>
        </div>
        <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl">
          {tickets.length} Active Tickets
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Inbox Zero: No open customer tickets</h3>
          <p className="text-sm text-slate-500">All customer issues have been resolved or attended to.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {ticket.ticketNumber}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{ticket.subject}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ticket.priority === 'HIGH' ? 'danger' : 'default'} size="sm">
                    Priority: {ticket.priority}
                  </Badge>
                  <Badge variant={ticket.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                    {ticket.status}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{ticket.description}</p>

              {/* Message thread preview */}
              {ticket.messages && ticket.messages.length > 1 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Latest Message ({ticket.messages.length} total):
                  </span>
                  <p className="text-slate-700 italic">
                    "{ticket.messages[ticket.messages.length - 1]?.message}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                <span>
                  Customer: <span className="font-semibold text-slate-700">{ticket.customer?.name}</span> ({ticket.customer?.email})
                </span>

                <Button
                  size="sm"
                  variant="primary"
                  icon={FiMessageSquare}
                  onClick={() => {
                    setActiveTicket(ticket);
                    setReplyText('');
                  }}
                >
                  Reply to Customer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Response Modal */}
      {activeTicket && (
        <Modal
          isOpen={!!activeTicket}
          onClose={() => setActiveTicket(null)}
          title={`Ticket Reply - ${activeTicket.ticketNumber}`}
        >
          <form onSubmit={handleSendReply} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-900">Subject: {activeTicket.subject}</p>
              <p className="text-slate-600">Customer: {activeTicket.customer?.name} ({activeTicket.customer?.email})</p>
            </div>

            {/* Conversation History */}
            <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
              {activeTicket.messages?.map((m, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700">{idx === 0 ? 'Customer Original Message' : 'Response'}</span>
                    <span>{new Date(m.timestamp || Date.now()).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-800">{m.message}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Support Agent Response
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your official support response to the customer..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmittingReply}
              icon={FiSend}
            >
              Send Support Reply
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SupportDashboard;
