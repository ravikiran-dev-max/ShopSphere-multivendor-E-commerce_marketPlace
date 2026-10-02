import React, { useEffect, useState } from 'react';
import {
  FiLifeBuoy,
  FiPlus,
  FiSend,
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';

const SupportCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);

  // Form state for creating a ticket
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/tickets');
      setTickets(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load support tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) {
      return toast.error('Please enter subject and description');
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/support/tickets', {
        subject: newSubject,
        description: newDescription,
        priority: newPriority,
      });

      toast.success('Support ticket created successfully!');
      setTickets([res.data.data, ...tickets]);
      setIsCreateOpen(false);
      setNewSubject('');
      setNewDescription('');
      setNewPriority('MEDIUM');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setIsSubmittingReply(true);
    try {
      const res = await api.post(`/support/tickets/${activeTicket._id}/reply`, {
        message: replyText,
      });

      const updated = res.data.data;
      setActiveTicket(updated);
      setTickets(tickets.map((t) => (t._id === updated._id ? updated : t)));
      setReplyText('');
      toast.success('Reply submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge variant="success">RESOLVED</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="primary">IN PROGRESS</Badge>;
      case 'WAITING_FOR_CUSTOMER':
        return <Badge variant="warning">ACTION NEEDED</Badge>;
      default:
        return <Badge variant="secondary">OPEN</Badge>;
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading support desk..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <FiLifeBuoy className="text-indigo-600" /> Customer Help & Support
          </h1>
          <p className="text-sm text-slate-500">
            Submit inquiries, track ticket resolutions, and chat directly with ShopSphere support agents.
          </p>
        </div>

        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => setIsCreateOpen(true)}
        >
          Open New Ticket
        </Button>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <FiCheckCircle />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Support Tickets Yet</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Need help with an order, vendor delivery, or platform feature? Click below to start a conversation with our support team.
          </p>
          <Button variant="primary" icon={FiPlus} onClick={() => setIsCreateOpen(true)}>
            Submit Your First Ticket
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {ticket.ticketNumber}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{ticket.subject}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'danger' : 'default'} size="sm">
                    Priority: {ticket.priority}
                  </Badge>
                  {getStatusBadge(ticket.status)}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{ticket.description}</p>

              {/* Latest message preview */}
              {ticket.messages && ticket.messages.length > 1 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    Latest Activity ({ticket.messages.length} messages)
                  </span>
                  <p className="italic">
                    "{ticket.messages[ticket.messages.length - 1]?.message}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <FiClock /> Opened {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={FiMessageSquare}
                  onClick={() => {
                    setActiveTicket(ticket);
                    setReplyText('');
                  }}
                >
                  View Discussion ({ticket.messages?.length || 1})
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Open Support Ticket"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Subject
            </label>
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Inquiring about delivery schedule for Order #ODR-12345"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Priority Level
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium (Standard)</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Describe Your Issue or Request
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Please provide full details so our support team can assist you swiftly..."
              rows={4}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            ></textarea>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            icon={FiSend}
          >
            Submit Support Request
          </Button>
        </form>
      </Modal>

      {/* Ticket Details & Chat Modal */}
      {activeTicket && (
        <Modal
          isOpen={!!activeTicket}
          onClose={() => setActiveTicket(null)}
          title={`Ticket #${activeTicket.ticketNumber} - ${activeTicket.subject}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-700">Status: </span>
                {getStatusBadge(activeTicket.status)}
              </div>
              <div>
                <span className="font-bold text-slate-700">Priority: </span>
                <span className="text-slate-600">{activeTicket.priority}</span>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              {activeTicket.messages?.map((msg, index) => {
                const isCustomerMsg = msg.sender === activeTicket.customer?._id || msg.sender?._id === activeTicket.customer?._id || index === 0;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-xl text-xs space-y-1 max-w-[85%] ${
                      isCustomerMsg
                        ? 'ml-auto bg-indigo-600 text-white'
                        : 'mr-auto bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                      <span className="font-bold">
                        {isCustomerMsg ? 'You' : 'ShopSphere Support'}
                      </span>
                      <span>
                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                );
              })}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-100">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your message or response..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmittingReply}
                icon={FiSend}
              >
                Send Reply
              </Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SupportCenter;
