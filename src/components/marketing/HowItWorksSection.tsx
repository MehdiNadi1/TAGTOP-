import React from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { Eye, CreditCard, CheckSquare, Truck } from 'lucide-react';

interface HowItWorksSectionProps {
  currentLanguage: Language;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ currentLanguage }) => {
  const t = translations[currentLanguage];

  const steps = [
    {
      num: '01',
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: Eye,
      highlight: t.howItWorks.step1Highlight,
    },
    {
      num: '02',
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: CreditCard,
      highlight: t.howItWorks.step2Highlight,
    },
    {
      num: '03',
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: CheckSquare,
      highlight: t.howItWorks.step3Highlight,
    },
    {
      num: '04',
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc,
      icon: Truck,
      highlight: t.howItWorks.step4Highlight,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-[#FAFAFA] border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
            {t.howItWorks.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight text-balance">
            {t.howItWorks.title}
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* Connected Horizontal Timeline (Desktop) & Connected Steps (Mobile) */}
        <div className="relative">
          {/* Connecting line on desktop */}
          <div
            className="hidden lg:block absolute top-[28px] left-[5%] right-[5%] h-[1px] border-t border-dashed border-neutral-300 pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative flex flex-col justify-between bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:border-black/20 hover:shadow-md transition-all duration-200 group"
                >
                  <div>
                    {/* Top indicator: Large step number & icon badge */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-3xl font-extrabold font-mono text-neutral-300 group-hover:text-neutral-900 transition-colors">
                        {step.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-neutral-50 text-neutral-900 flex items-center justify-center border border-neutral-200 group-hover:bg-[#FFD700] group-hover:border-[#FFD700] transition-colors shrink-0">
                        <Icon className="w-4.5 h-4.5 text-neutral-800" />
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-lg font-bold text-neutral-950 mb-2 tracking-tight">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Highlight Tag */}
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                      {step.highlight}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
