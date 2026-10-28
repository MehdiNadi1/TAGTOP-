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
    <section id="how-it-works" className="py-20 bg-neutral-50/70 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
            {t.howItWorks.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight text-balance">
            {t.howItWorks.title}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-amber-400/80 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-neutral-300">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-neutral-900 flex items-center justify-center border border-amber-200 shrink-0">
                      <Icon className="w-5 h-5 text-neutral-900" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-neutral-100">
                  <span className="text-[11px] font-semibold text-amber-700">
                    {step.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
