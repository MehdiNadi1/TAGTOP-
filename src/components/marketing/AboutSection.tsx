import React from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { Shield, MapPin, CheckCircle } from 'lucide-react';

interface AboutSectionProps {
  currentLanguage: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ currentLanguage }) => {
  const t = translations[currentLanguage];

  return (
    <section id="about" className="py-20 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
              {t.about.missionTag}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight text-balance">
              {t.about.missionTitle}
            </h2>
            <p className="text-base text-slate-700 leading-relaxed">
              {t.about.p1}
            </p>
            <p className="text-base text-slate-700 leading-relaxed">
              {t.about.p2}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">{t.about.designedInMorocco}</h4>
                  <p className="text-xs text-slate-500">{t.about.cities}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">{t.about.craftsmanship}</h4>
                  <p className="text-xs text-slate-500">{t.about.proofValidated}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-8 rounded-3xl bg-neutral-900 text-white border border-neutral-800 space-y-6 relative overflow-hidden">
              <div className="space-y-3">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-semibold">
                  {t.about.founderCommitment}
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {t.about.founderQuoteTitle}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {t.about.founderQuote}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-bold text-white">{t.about.founderTeam}</p>
                  <p className="text-xs text-neutral-400">{t.about.founderSub}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.about.dedicatedSupport}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
