import React, { useState } from 'react';
import { Language, CardColor, CardBranding, MarketingSubPage } from '../../types';
import { translations } from '../../i18n/translations';
import { NfcCard3D } from '../cards/NfcCard3D';
import { Check, Clock, Sparkles, ArrowRight } from 'lucide-react';

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
    <section id="cards" className="py-20 sm:py-24 bg-[#0A0A0A] text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2">
            {t.cards.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
            {t.cards.title}
          </h2>
          <p className="mt-3 text-base text-neutral-400 leading-relaxed">
            {t.cards.subtitle}
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

          {/* Left: 3D Interactive Card Showcase (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* Stage wrapper */}
            <div className="w-full relative flex flex-col items-center justify-center p-8 sm:p-10 bg-neutral-950/80 rounded-3xl border border-neutral-800/90 shadow-2xl">
              
              <NfcCard3D
                color={selectedColor}
                branding={selectedBranding}
                businessName={currentLanguage === 'ar' ? 'أتيليه أطلس ديزاين' : 'ATELIER ATLAS DESIGN'}
                businessTitle={t.nfcCard.sampleBusinessTitle}
                showFlipButton={true}
                interactiveTilt={true}
                className="w-full"
                currentLanguage={currentLanguage}
              />

              {/* Ambient Glow & Shadow strictly UNDER the card object */}
              <div
                className="w-3/4 h-8 mx-auto -mt-2 bg-gradient-to-r from-transparent via-[#FFD700]/25 to-transparent blur-xl pointer-events-none opacity-80"
                aria-hidden="true"
              />

              {/* Segmented Color & Branding Controllers */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full">
                {/* Color Selector */}
                <div
                  className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800"
                  role="radiogroup"
                  aria-label={t.cards.badge}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedColor('black')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      selectedColor === 'black'
                        ? 'bg-neutral-800 text-white shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    aria-checked={selectedColor === 'black'}
                    role="radio"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-black border border-neutral-500 inline-block" />
                    <span>{t.cards.matteBlack}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedColor('white')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      selectedColor === 'white'
                        ? 'bg-neutral-100 text-neutral-950 shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    aria-checked={selectedColor === 'white'}
                    role="radio"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-300 inline-block" />
                    <span>{t.cards.matteWhite}</span>
                  </button>
                </div>

                {/* Branding Selector */}
                <div
                  className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800"
                  role="radiogroup"
                  aria-label="Finition de la marque"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedBranding('branded')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedBranding === 'branded'
                        ? 'bg-[#FFD700] text-black shadow-xs font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    aria-checked={selectedBranding === 'branded'}
                    role="radio"
                  >
                    {t.cards.brandedOption}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBranding('unbranded')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedBranding === 'unbranded'
                        ? 'bg-[#FFD700] text-black shadow-xs font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    aria-checked={selectedBranding === 'unbranded'}
                    role="radio"
                  >
                    {t.cards.unbrandedOption}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Technical Features & Optional Accessory (6 cols) */}
          <div className="lg:col-span-6 space-y-6">

            {/* Specifications Card */}
            <div className="p-7 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFD700] shrink-0" />
                <span>{t.cards.specsTitle}</span>
              </h3>

              <ul className="space-y-3.5 text-sm text-neutral-300">
                <li className="flex items-start gap-3">
                  <Check className="w-4.5 h-4.5 text-[#FFD700] shrink-0 mt-0.5" />
                  <span>{t.cards.specFormat}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4.5 h-4.5 text-[#FFD700] shrink-0 mt-0.5" />
                  <span>{t.cards.specFinish}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4.5 h-4.5 text-[#FFD700] shrink-0 mt-0.5" />
                  <span>{t.cards.specChip}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4.5 h-4.5 text-[#FFD700] shrink-0 mt-0.5" />
                  <span>{t.cards.specReady}</span>
                </li>
              </ul>
            </div>

            {/* Wooden Stand Note */}
            <div className="p-7 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-base font-bold text-white">
                  {t.cards.woodenStandTitle}
                </h4>
                <span className="text-[11px] font-semibold text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold px-8 py-4 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{t.cards.customizeCta}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
