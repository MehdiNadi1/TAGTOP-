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
    <section id="faq" className="py-20 sm:py-24 bg-[#FAFAFA] border-b border-neutral-200/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
            {t.faq.tag}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight text-balance">
            {t.faq.title}
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Clean Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden transition-all shadow-[0_2px_6px_-2px_rgba(0,0,0,0.03)] hover:border-neutral-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left rtl:text-right px-6 sm:px-7 py-5 flex items-center justify-between gap-4 font-bold text-base text-neutral-900 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="tracking-tight">{faq.q}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen ? 'bg-[#FFD700] text-black rotate-180' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 sm:px-7 pb-6 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4 text-left rtl:text-right animate-fadeIn">
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
