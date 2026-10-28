import React, { useState, useEffect } from 'react';
import { Language, MarketingSubPage, AppView } from '../../types';
import { translations } from '../../i18n/translations';
import { NfcCard3D } from '../cards/NfcCard3D';
import { Play, Pause, Wifi, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface HeroInteractiveProps {
  currentLanguage: Language;
  onNavigate: (page: MarketingSubPage) => void;
  onViewChange: (view: AppView) => void;
}

export const HeroInteractive: React.FC<HeroInteractiveProps> = ({
  currentLanguage,
  onNavigate,
  onViewChange,
}) => {
  const t = translations[currentLanguage];
  const [isPlaying, setIsPlaying] = useState(true);
  const [tapStep, setTapStep] = useState<0 | 1 | 2>(0); // 0: approaching, 1: tap pulse, 2: profile revealed

  // Loop sequence with pause control
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTapStep((prev) => (prev === 2 ? 0 : ((prev + 1) as 0 | 1 | 2)));
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleManualTap = () => {
    setTapStep(1);
    setTimeout(() => {
      setTapStep(2);
    }, 450);
  };

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 lg:py-20 border-b border-neutral-100">
      {/* Background architectural grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: HERO HEADLINE & ACTIONS (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            
            {/* Reassurance Kicker - Unboxed Clean Typography */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-800 bg-amber-100/70 border border-amber-300/50 px-3 py-1.5 rounded-md w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{t.hero.reassurance}</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-black leading-[1.12] text-balance">
              {t.hero.headline}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
              {t.hero.subheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  onViewChange('customer-dashboard');
                }}
                className="inline-flex items-center justify-center gap-2 bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold text-base px-6 py-3.5 rounded-xl shadow-sm transition-all transform active:scale-[0.98]"
              >
                <span>{t.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cards')}
                className="inline-flex items-center justify-center gap-2 bg-neutral-50 hover:bg-neutral-100 text-slate-800 font-semibold text-base px-6 py-3.5 rounded-xl border border-slate-200 transition-colors"
              >
                <span>{t.hero.secondaryCta}</span>
              </button>
            </div>

            {/* Reassurances Adjacency (3 Points) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.hero.codBadge}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.hero.preEncodedBadge}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.hero.compatibilityBadge}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE CARD-TO-PHONE SIMULATION (5 cols) */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            
            {/* Simulation Header with Play/Pause button */}
            <div className="w-full flex items-center justify-between pb-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {t.hero.interactiveDemoTitle}
              </span>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
                title={isPlaying ? t.hero.pauseAnimation : t.hero.playAnimation}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? t.hero.pause : t.hero.play}</span>
              </button>
            </div>

            {/* Stage Container */}
            <div className="relative w-full max-w-[380px] bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-800 overflow-hidden flex flex-col items-center min-h-[460px] justify-between">
              
              {/* Approaching Card */}
              <div
                onClick={handleManualTap}
                className="w-full cursor-pointer transition-all duration-700 transform"
                style={{
                  transform:
                    tapStep === 1
                      ? 'translateY(28px) scale(0.96)'
                      : tapStep === 2
                      ? 'translateY(-10px) scale(0.92)'
                      : 'translateY(0px) scale(1)',
                }}
              >
                <NfcCard3D
                  color="black"
                  branding="branded"
                  businessName="YASSINE BENNANI"
                  businessTitle="Atelier Atlas Design"
                  showFlipButton={false}
                  interactiveTilt={false}
                  currentLanguage={currentLanguage}
                />
              </div>

              {/* NFC Ripple Wave when Tap Occurs */}
              {tapStep === 1 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                  <div className="w-24 h-24 rounded-full bg-amber-400/30 animate-ping" />
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-amber-400/60 animate-pulse flex items-center justify-center">
                    <Wifi className="w-8 h-8 text-white rotate-90" />
                  </div>
                </div>
              )}

              {/* Smartphone Display Mockup with Live TAGTOP Profile */}
              <div
                className={`w-full max-w-[270px] bg-white rounded-2xl p-4 shadow-xl border-4 border-neutral-700 transition-all duration-500 overflow-hidden ${
                  tapStep === 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-80 scale-95 translate-y-3'
                }`}
              >
                {/* Phone Speaker Notch */}
                <div className="w-16 h-1 bg-neutral-300 rounded-full mx-auto mb-3" />

                {/* Profile Header in Phone */}
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full mx-auto flex items-center justify-center font-bold text-neutral-900 text-lg shadow-xs">
                    YB
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Yassine Bennani
                  </h3>
                  <p className="text-[11px] text-neutral-600 font-medium">
                    {t.hero.sampleLocation}
                  </p>
                </div>

                {/* Instant Actions */}
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="bg-[#FFD700] text-black font-semibold text-center py-1.5 rounded-lg">
                    {t.common.saveContactCTA}
                  </div>
                  <div className="bg-emerald-500 text-white font-semibold text-center py-1.5 rounded-lg">
                    {t.common.whatsappCTA}
                  </div>
                </div>

                {/* Service teaser */}
                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center">
                  <span>{t.hero.sampleJob}</span>
                  <span className="font-semibold text-black">{t.hero.samplePrice}</span>
                </div>

                {/* Micro TAGTOP branding */}
                <div className="mt-2 text-center text-[8px] text-slate-400 font-mono">
                  {t.profile.digitalFooter}
                </div>
              </div>

              {/* Tap instruction trigger */}
              <div className="pt-2 text-center text-xs text-neutral-400">
                <button
                  type="button"
                  onClick={handleManualTap}
                  className="hover:text-amber-400 transition-colors underline decoration-dotted underline-offset-4"
                >
                  {t.hero.tapPrompt}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
