'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SupportTicketRecord } from '@/lib/types';
import { getSupportTicketById, updateSupportTicket } from '@/lib/data-service';
import { triggerNavigationProgress } from '@/lib/nav-progress';
import { formatShortDate } from '@/lib/formatters';
import { FormSelect, FormTextarea } from '@/components/ui/FormInput';
import { NotchedBadge, RuledBadge } from '@/components/ui/ArchitecturalBadge';
import { ArrowLeft, Save, AlertCircle, User, Package, MessageSquare } from 'lucide-react';

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<SupportTicketRecord | null>(null);
  const [status, setStatus] = useState<'Open' | 'In Review' | 'Resolved'>('Open');
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSupportTicketById(id)
      .then((t) => {
        setTicket(t);
        setStatus(t.status);
        setAdminReply(t.adminReply || '');
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Ticket not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setSaving(true);
    setError(null);
    try {
      await updateSupportTicket(
        ticket.id,
        { status, adminReply: adminReply.trim() },
        ticket.customerId
      );
      triggerNavigationProgress('/support');
      router.push('/support');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-ifaqa-plum/15 border-t-ifaqa-plum animate-spin mx-auto" />
        <p className="text-sm text-[#5A6962]">Loading support case</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-900 space-y-4 max-w-xl mx-auto my-8">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-700" strokeWidth={1.6} />
          <h2 className="font-serif text-lg">Ticket not found</h2>
        </div>
        <p className="text-sm">{error}</p>
        <Link
          href="/support"
          className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
          <span>Back to support tickets</span>
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  const badgeTone = status === 'Resolved' ? 'emerald' : status === 'In Review' ? 'sand' : 'amber';

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/support"
            className="w-9 h-9 rounded-lg border border-ifaqa-plum/15 bg-white flex items-center justify-center text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors shrink-0"
            title="Back to support tickets"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.6} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-serif font-normal text-2xl text-ifaqa-plum">{ticket.subject}</h2>
              <RuledBadge accentColor={badgeTone}>{status}</RuledBadge>
            </div>
            <p className="text-xs font-mono text-[#5A6962] mt-0.5">
              {ticket.id} • Opened {formatShortDate(ticket.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" strokeWidth={1.6} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Customer & Order Reference */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <h3 className="font-serif font-normal text-lg text-ifaqa-plum flex items-center gap-2 border-b border-ifaqa-plum/10 pb-3">
              <User className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
              <span>Customer context</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-[#5A6962] block">Customer</span>
                <span className="font-medium text-ifaqa-plum">
                  {ticket.customerName || 'Registered customer'}
                </span>
              </div>
              {ticket.customerPhone && (
                <div>
                  <span className="text-xs text-[#5A6962] block">Mobile</span>
                  <span className="font-mono text-xs tabular-nums text-ifaqa-plum">
                    {ticket.customerPhone}
                  </span>
                </div>
              )}
              <div>
                <span className="text-xs text-[#5A6962] block">Topic</span>
                <span className="text-xs text-[#3E524A]">{ticket.category}</span>
              </div>
              {ticket.customerId && (
                <Link
                  href={`/customers/${encodeURIComponent(ticket.customerId)}`}
                  className="inline-block text-xs font-medium text-ifaqa-plum hover:underline pt-1"
                >
                  Open customer profile →
                </Link>
              )}
            </div>
          </div>

          {ticket.orderNumber && (
            <div className="p-5 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-ifaqa-plum">
                <Package className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
                <span>Referenced order</span>
              </div>
              <NotchedBadge variant="sand">{ticket.orderNumber}</NotchedBadge>
              <div>
                <Link
                  href={`/orders`}
                  className="text-xs text-ifaqa-plum font-medium hover:underline"
                >
                  Find in orders pipeline →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right: Customer Message & Resolution Composer */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-8 p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-5"
        >
          <div className="flex items-center gap-2 border-b border-ifaqa-plum/10 pb-3">
            <MessageSquare className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
            <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
              Inquiry & dispensary response
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-ifaqa-linen border border-ifaqa-plum/10 space-y-2">
            <div className="text-xs font-medium text-[#5A6962]">Customer message</div>
            <p className="text-sm text-ifaqa-plum leading-relaxed whitespace-pre-wrap">
              {ticket.message}
            </p>
          </div>

          <FormSelect
            label="Update ticket status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Open' | 'In Review' | 'Resolved')}
          >
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </FormSelect>

          <FormTextarea
            label="Official response / resolution note"
            rows={5}
            placeholder="Write a clear response regarding courier timing, pickup details, or formulation advice"
            value={adminReply}
            onChange={(e) => setAdminReply(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ifaqa-plum/10">
            <Link
              href="/support"
              className="h-10 px-4 rounded-lg border border-ifaqa-plum/15 bg-white text-sm font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere inline-flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-6 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-sm font-medium hover:bg-[#165A45] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" strokeWidth={1.6} />
              <span>{saving ? 'Saving...' : 'Save resolution'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
