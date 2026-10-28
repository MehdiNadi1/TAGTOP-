import React, { useState } from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { ChevronDown } from 'lucide-react';

interface FaqSectionProps {
  currentLanguage: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ currentLanguage }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const t = translations[currentLanguage];

  const faqs = [
    {
      q: t.faq.q1,
      a: t.faq.a1,
    },
    {
      q: t.faq.q2,
      a: t.faq.a2,
    },
    {
      q: t.faq.q3,
      a: t.faq.a3,
    },
    {
      q: t.faq.q4,
      a: t.faq.a4,
    },
    {
      q: t.faq.q5,
      a: t.faq.a5,
    },
    {
      q: t.faq.q6,
      a: t.faq.a6,
    },
  ];

  return (
    <section id="faq" className="py-20 bg-neutral-50/50 border-b border-neutral-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
            {t.faq.tag}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
            {t.faq.title}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left rtl:text-right px-6 py-5 flex items-center justify-between gap-4 font-bold text-base text-slate-900 hover:text-black focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-neutral-100 pt-3 text-left rtl:text-right">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
