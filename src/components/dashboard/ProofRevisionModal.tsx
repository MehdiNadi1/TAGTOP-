/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Proof Revision Modal
 * Accessible in-app dialog for structured design feedback on artwork proofs.
 */

import React, { useState } from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { AlertCircle, X, Send, Layout, Type, Sparkles, Palette, MessageSquare } from 'lucide-react';

export type RevisionCategory = 'Layout' | 'Typography' | 'Logo' | 'Color' | 'Other';

interface ProofRevisionModalProps {
  isOpen: boolean;
  orderId: string;
  currentLanguage: Language;
  onClose: () => void;
  onSubmit: (orderId: string, structuredReason: string) => Promise<void> | void;
}

export const ProofRevisionModal: React.FC<ProofRevisionModalProps> = ({
  isOpen,
  orderId,
  currentLanguage,
  onClose,
  onSubmit,
}) => {
  const t = translations[currentLanguage];

  const [category, setCategory] = useState<RevisionCategory>('Layout');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: { id: RevisionCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'Layout', label: t.customerDashboard.revisionCategoryLayout, icon: Layout },
    { id: 'Typography', label: t.customerDashboard.revisionCategoryTypography, icon: Type },
    { id: 'Logo', label: t.customerDashboard.revisionCategoryLogo, icon: Sparkles },
    { id: 'Color', label: t.customerDashboard.revisionCategoryColor, icon: Palette },
    { id: 'Other', label: t.customerDashboard.revisionCategoryOther, icon: MessageSquare },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedNotes = notes.trim();
    if (!trimmedNotes || trimmedNotes.length < 5) {
      setErrorMessage(t.customerDashboard.revisionNotesRequired);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const structuredReason = `[${category}] ${trimmedNotes}`;

    try {
      await onSubmit(orderId, structuredReason);
      setNotes('');
      onClose();
    } catch (err: any) {
      console.error('[TAGTOP ProofRevisionModal] Submission error:', err);
      setErrorMessage(err?.message || 'Error submitting proof revision request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="revision-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <div>
            <h3 id="revision-modal-title" className="font-bold text-slate-900 text-sm">
              {t.customerDashboard.revisionModalTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t.customerDashboard.revisionModalSubtitle}
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label={t.customerDashboard.cancelBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category Chooser */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              {t.customerDashboard.revisionCategoryLabel} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 font-medium transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {t.customerDashboard.revisionNotesLabel} *
            </label>
            <textarea
              rows={4}
              required
              disabled={isSubmitting}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.customerDashboard.revisionNotesPlaceholder}
              className="w-full border border-slate-300 rounded-xl p-3 text-xs text-black focus:ring-2 focus:ring-amber-400 outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {t.customerDashboard.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-neutral-900 hover:bg-black disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.common.loading}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.customerDashboard.submitRevisionBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
