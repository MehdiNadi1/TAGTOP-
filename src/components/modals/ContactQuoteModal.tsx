import React, { useState } from 'react';
import { Language, PackageTier } from '../../types';
import { translations } from '../../i18n/translations';
import { X, CheckCircle2 } from 'lucide-react';

interface ContactQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: PackageTier | null;
  currentLanguage: Language;
}

export const ContactQuoteModal: React.FC<ContactQuoteModalProps> = ({
  isOpen,
  onClose,
  tier,
  currentLanguage,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [cardsCount, setCardsCount] = useState(tier === 'pro' ? '5' : '10');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const t = translations[currentLanguage];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-neutral-200 shadow-2xl relative text-slate-800">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-slate-400 hover:text-black p-1 rounded-lg"
          aria-label={t.common.close}
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-black">
              {t.quoteModal.submittedTitle}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              {t.quoteModal.submittedDesc} ({phone})
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 bg-[#FFD700] text-black font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
            >
              {t.quoteModal.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                {tier === 'enterprise' ? t.quoteModal.tierBadgeEnterprise : t.quoteModal.tierBadgePro}
              </span>
              <h3 className="text-lg font-bold text-black mt-2">
                {t.quoteModal.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t.quoteModal.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.quoteModal.nameLabel}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.quoteModal.phoneLabel}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black dir-ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.quoteModal.emailLabel}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.quoteModal.companyLabel}</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.quoteModal.quantityLabel}
              </label>
              <input
                type="number"
                min="1"
                value={cardsCount}
                onChange={(e) => setCardsCount(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.quoteModal.notesLabel}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.quoteModal.notesPlaceholder}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold text-sm py-3.5 rounded-xl shadow-xs transition-all"
            >
              {t.quoteModal.submitBtn}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
