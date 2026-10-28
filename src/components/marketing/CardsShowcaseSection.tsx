import React, { useState } from 'react';
import { Language, CardColor, CardBranding, MarketingSubPage } from '../../types';
import { translations } from '../../i18n/translations';
import { NfcCard3D } from '../cards/NfcCard3D';
import { Check, Clock, Sparkles } from 'lucide-react';

interface CardsShowcaseSectionProps {
  currentLanguage: Language;
  onNavigate: (page: MarketingSubPage) => void;
}

export const CardsShowcaseSection: React.FC<CardsShowcaseSectionProps> = ({
  currentLanguage,
  onNavigate,
}) => {
  const t = translations[currentLanguage];
  const [selectedColor, setSelectedColor] = useState<CardColor>('black');
  const [selectedBranding, setSelectedBranding] = useState<CardBranding>('branded');

  return (
    <section id="cards" className="py-20 bg-neutral-900 text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
            {t.cards.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
            {t.cards.title}
          </h2>
          <p className="mt-3 text-base text-neutral-400">
            {t.cards.subtitle}
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: 3D Interactive Card Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 bg-neutral-950/60 rounded-3xl border border-neutral-800/80">
            <NfcCard3D
              color={selectedColor}
              branding={selectedBranding}
              businessName="ATELIER ATLAS DESIGN"
              businessTitle={t.nfcCard.sampleBusinessTitle}
              showFlipButton={true}
              interactiveTilt={true}
              className="w-full"
              currentLanguage={currentLanguage}
            />

            {/* Color & Branding Selectors */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-800 rounded-xl border border-neutral-700">
                <button
                  type="button"
                  onClick={() => setSelectedColor('black')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${selectedColor === 'black'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-neutral-600 inline-block" />
                  <span>{t.cards.matteBlack}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColor('white')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${selectedColor === 'white'
                    ? 'bg-neutral-100 text-neutral-900 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-300 inline-block" />
                  <span>{t.cards.matteWhite}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-neutral-800 rounded-xl border border-neutral-700">
                <button
                  type="button"
                  onClick={() => setSelectedBranding('branded')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedBranding === 'branded'
                    ? 'bg-amber-400 text-black shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  {t.cards.brandedOption}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBranding('unbranded')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedBranding === 'unbranded'
                    ? 'bg-amber-400 text-black shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  {t.cards.unbrandedOption}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Technical Features & Optional Accessory */}
          <div className="lg:col-span-6 space-y-6">

            <div className="p-6 rounded-2xl bg-neutral-950/40 border border-neutral-800 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{t.cards.specsTitle}</span>
              </h3>

              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t.cards.specFormat}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t.cards.specFinish}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t.cards.specChip}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t.cards.specReady}</span>
                </li>
              </ul>
            </div>

            {/* Wooden Stand Note */}
            <div className="p-6 rounded-2xl bg-neutral-950/40 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-base font-bold text-white">
                  {t.cards.woodenStandTitle}
                </h4>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{t.cards.woodenStandStatus}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {t.cards.woodenStandDesc}
              </p>
              <p className="text-[11px] text-neutral-500 italic pt-1">
                {t.cards.woodenStandDisclaimer}
              </p>
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('configurator')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <span>{t.cards.customizeCta}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
