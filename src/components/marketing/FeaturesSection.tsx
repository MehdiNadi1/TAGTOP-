import React from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { Smartphone, Download, ShoppingBag, Users, RefreshCw, ShieldCheck } from 'lucide-react';

interface FeaturesSectionProps {
  currentLanguage: Language;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ currentLanguage }) => {
  const t = translations[currentLanguage];

  const features = [
    {
      title: t.features.f1Title,
      desc: t.features.f1Desc,
      icon: Smartphone,
    },
    {
      title: t.features.f2Title,
      desc: t.features.f2Desc,
      icon: Download,
    },
    {
      title: t.features.f3Title,
      desc: t.features.f3Desc,
      icon: ShoppingBag,
    },
    {
      title: t.features.f4Title,
      desc: t.features.f4Desc,
      icon: Users,
    },
    {
      title: t.features.f5Title,
      desc: t.features.f5Desc,
      icon: RefreshCw,
    },
    {
      title: t.features.f6Title,
      desc: t.features.f6Desc,
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="features" className="py-20 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
            {t.features.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight text-balance">
            {t.features.title}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {t.features.subtitle}
          </p>
        </div>

        {/* Bento grid / cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-neutral-200/90 bg-neutral-50/40 hover:bg-white hover:border-amber-400/80 transition-all shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFD700]/25 text-black flex items-center justify-center mb-4 border border-[#FFD700]/40 shrink-0">
                  <Icon className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
