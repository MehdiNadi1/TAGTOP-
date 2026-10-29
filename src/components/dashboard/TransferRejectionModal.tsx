/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Transfer Rejection Modal
 * Accessible founder dialog to reject bank transfer renewals with structured reason and explicit confirmation.
 */

import React, { useState } from 'react';
import { BankTransferRenewal, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { AlertCircle, X, Ban, AlertTriangle } from 'lucide-react';

interface TransferRejectionModalProps {
  isOpen: boolean;
  transfer: BankTransferRenewal | null;
  currentLanguage: Language;
  onClose: () => void;
  onConfirmReject: (transferId: string, reason: string) => Promise<void> | void;
}

export const TransferRejectionModal: React.FC<TransferRejectionModalProps> = ({
  isOpen,
  transfer,
  currentLanguage,
  onClose,
  onConfirmReject,
}) => {
  const t = translations[currentLanguage];

  const [reason, setReason] = useState('');
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !transfer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedReason = reason.trim();
    if (!trimmedReason || trimmedReason.length < 3) {
      setErrorMessage(t.founderDashboard.rejectTransferReasonRequired);
      return;
    }

    if (!hasConfirmed) {
      setErrorMessage(t.founderDashboard.rejectTransferConfirmCheck);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onConfirmReject(transfer.id, trimmedReason);
      setReason('');
      setHasConfirmed(false);
      onClose();
    } catch (err: any) {
      console.error('[TAGTOP TransferRejectionModal] Rejection error:', err);
      setErrorMessage(err?.message || 'Error rejecting bank transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setReason('');
    setHasConfirmed(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-transfer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="bg-neutral-900 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-800 relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <Ban className="w-4 h-4 shrink-0" />
            <h3 id="reject-transfer-title" className="font-bold text-white text-sm">
              {t.founderDashboard.rejectTransferModalTitle}
            </h3>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label={t.founderDashboard.rejectTransferCancelBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 mb-4">
          {t.founderDashboard.rejectTransferModalSubtitle}
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Transfer Identity Summary */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-2 mb-4">
          <div className="flex justify-between items-center py-0.5 border-b border-neutral-900">
            <span className="text-neutral-400">{t.founderDashboard.rejectTransferIdentity}</span>
            <span className="font-mono font-bold text-amber-300">{transfer.receiptNumber || transfer.id}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-neutral-900">
            <span className="text-neutral-400">{t.founderDashboard.rejectTransferCustomer}</span>
            <span className="font-semibold text-white">{transfer.customerName} ({transfer.customerPhone})</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-neutral-900">
            <span className="text-neutral-400">{t.founderDashboard.rejectTransferProfile}</span>
            <span className="font-semibold text-white">{transfer.profileName}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400">{t.founderDashboard.rejectTransferAmount}</span>
            <span className="font-extrabold text-red-400 tabular-nums">
              {transfer.amountMAD} {t.common.currency} ({transfer.periodDescription})
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              {t.founderDashboard.rejectTransferReasonLabel} *
            </label>
            <textarea
              rows={3}
              required
              disabled={isSubmitting}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.founderDashboard.rejectTransferReasonPlaceholder}
              className="w-full border border-neutral-700 bg-neutral-950 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-red-500 outline-hidden resize-none"
            />
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/30 border border-red-900/60 cursor-pointer">
            <input
              type="checkbox"
              disabled={isSubmitting}
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-red-500 focus:ring-red-400"
            />
            <span className="text-[11px] text-red-200 select-none">
              {t.founderDashboard.rejectTransferConfirmCheck}
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {t.founderDashboard.rejectTransferCancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasConfirmed || !reason.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.common.loading}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{t.founderDashboard.rejectTransferConfirmBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
