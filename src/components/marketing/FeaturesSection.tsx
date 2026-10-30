import React from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { Smartphone, Download, ShoppingBag, Users, RefreshCw, ShieldCheck, Zap } from 'lucide-react';

interface FeaturesSectionProps {
  currentLanguage: Language;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ currentLanguage }) => {
  const t = translations[currentLanguage];

  const supportingFeatures = [
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
    <section id="features" className="py-20 sm:py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
            {t.features.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight text-balance">
            {t.features.title}
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed">
            {t.features.subtitle}
          </p>
        </div>

        {/* Asymmetric 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Featured Primary Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-neutral-900 to-neutral-950 text-white rounded-3xl p-8 sm:p-9 border border-neutral-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Ambient gold glow highlight inside the card */}
            <div
              className="absolute -top-20 -right-20 w-52 h-52 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1 rounded-full mb-6">
                <Zap className="w-3.5 h-3.5" />
                <span>NFC + QR HYBRID</span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-center text-[#FFD700] mb-5 shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
                {t.features.f1Title}
              </h3>

              <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                {t.features.f1Desc}
              </p>
            </div>

            {/* Inset Secondary Highlight (f2 - VCF 1-clic) */}
            <div className="pt-6 border-t border-neutral-800/80 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-[#FFD700] text-black flex items-center justify-center shrink-0 shadow-xs font-bold">
                <Download className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  {t.features.f2Title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {t.features.f2Desc}
                </p>
              </div>
            </div>
          </div>

          {/* Supporting 4 Capabilities Grid (7 cols: 2x2) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {supportingFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-7 rounded-2xl border border-neutral-200/90 bg-[#FBFBFA] hover:bg-white hover:border-black/20 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-white text-neutral-900 flex items-center justify-center mb-4 border border-neutral-200 shadow-2xs shrink-0">
                      <Icon className="w-5 h-5 text-neutral-800" />
                    </div>

                    <h3 className="text-base font-bold text-neutral-950 mb-2 tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {item.desc}
                    </p>
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
