import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
}) => {
  const t = translations[currentLanguage];
  const [isPlaying, setIsPlaying] = useState(true);
  const [tapStep, setTapStep] = useState<0 | 1 | 2>(0); // 0: approaching, 1: tap pulse, 2: profile revealed

  // Automatic cycle loop with pause toggle
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTapStep((prev) => (prev === 2 ? 0 : ((prev + 1) as 0 | 1 | 2)));
    }, 3000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleManualTap = () => {
    setTapStep(1);
    setTimeout(() => {
      setTapStep(2);
    }, 450);
  };

  const sampleName = currentLanguage === 'ar' ? 'ياسين بناني' : 'Yassine Bennani';
  const sampleInitials = currentLanguage === 'ar' ? 'يب' : 'YB';

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-neutral-100">
      {/* Subtle architectural dot grid background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* LEFT COLUMN: HERO CONTENT (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-7">
            
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold text-neutral-900 bg-amber-100/80 border border-amber-300/60 px-3.5 py-1.5 rounded-full w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{t.hero.reassurance}</span>
              </div>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.85rem] font-extrabold tracking-tight text-neutral-950 leading-[1.1] text-balance"
            >
              {t.hero.headline}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl"
            >
              {t.hero.subheadline}
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <button
                type="button"
                onClick={() => onNavigate('configurator')}
                className="inline-flex items-center justify-center gap-2.5 bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold text-sm sm:text-base px-6 py-4 rounded-xl shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
              >
                <span>{t.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cards')}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-sm sm:text-base px-6 py-4 rounded-xl border border-neutral-300 hover:border-black transition-colors cursor-pointer"
              >
                <span>{t.hero.secondaryCta}</span>
              </button>
            </motion.div>

            {/* 3 Reassurance Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-neutral-100 text-xs text-neutral-600 font-medium"
            >
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
            </motion.div>

          </div>

          {/* RIGHT COLUMN: CARD SHOWCASE & NFC SIMULATION STAGE (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex flex-col items-center"
          >
            {/* Simulation Header with Play/Pause button */}
            <div className="w-full flex items-center justify-between pb-3 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                {t.hero.interactiveDemoTitle}
              </span>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                title={isPlaying ? t.hero.pauseAnimation : t.hero.playAnimation}
                aria-label={isPlaying ? t.hero.pauseAnimation : t.hero.playAnimation}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? t.hero.pause : t.hero.play}</span>
              </button>
            </div>

            {/* Stage Container on light architectural background */}
            <div className="relative w-full bg-gradient-to-b from-[#FAF9F6] to-[#F5F5F3] rounded-3xl p-6 sm:p-7 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] border border-neutral-200/90 overflow-hidden flex flex-col items-center justify-between min-h-[500px]">

              {/* TWO CARDS DISPLAY (Obsidian Black foreground + Ivory White offset background) */}
              <div className="w-full relative flex flex-col items-center pt-2">
                
                {/* Secondary Ivory White Card (Offset background layer for luxury physical comparison) */}
                <div
                  className="absolute -top-1 w-[82%] max-w-[320px] transition-all duration-500 pointer-events-none opacity-60 scale-95"
                  style={{
                    transform: 'translateY(-14px) rotate(-4deg)',
                  }}
                  aria-hidden="true"
                >
                  <NfcCard3D
                    color="white"
                    branding="branded"
                    businessName={sampleName}
                    showFlipButton={false}
                    interactiveTilt={false}
                    currentLanguage={currentLanguage}
                  />
                </div>

                {/* Primary Obsidian Black Card (Interactive / tap driver) */}
                <div
                  onClick={handleManualTap}
                  className="w-full max-w-[360px] cursor-pointer transition-all duration-700 transform relative z-10"
                  style={{
                    transform:
                      tapStep === 1
                        ? 'translateY(22px) scale(0.97) rotate(1deg)'
                        : tapStep === 2
                          ? 'translateY(-6px) scale(0.94) rotate(0deg)'
                          : 'translateY(0px) scale(1) rotate(1deg)',
                  }}
                >
                  <NfcCard3D
                    color="black"
                    branding="branded"
                    businessName={sampleName}
                    showFlipButton={false}
                    interactiveTilt={false}
                    currentLanguage={currentLanguage}
                  />
                </div>
              </div>

              {/* NFC Ripple Wave when Tap Occurs */}
              {tapStep === 1 && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
                  aria-hidden="true"
                >
                  <div className="w-24 h-24 rounded-full bg-[#FFD700]/30 animate-ping" />
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-[#FFD700]/70 flex items-center justify-center">
                    <Wifi className="w-7 h-7 text-black rotate-90" />
                  </div>
                </div>
              )}

              {/* Smartphone Display Mockup with Live Profile Reveal */}
              <div
                className={`w-full max-w-[280px] bg-white rounded-3xl p-4.5 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12)] border-2 border-neutral-300 transition-all duration-500 overflow-hidden relative z-20 mt-4 ${
                  tapStep === 2
                    ? 'opacity-100 scale-100 translate-y-0 ring-2 ring-[#FFD700]'
                    : 'opacity-85 scale-95 translate-y-2'
                }`}
              >
                {/* Phone Speaker & Camera Notch */}
                <div className="w-20 h-1.5 bg-neutral-300 rounded-full mx-auto mb-3" />

                {/* Profile Header in Phone */}
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 bg-gradient-to-tr from-[#FFD700] to-amber-200 rounded-full mx-auto flex items-center justify-center font-black text-neutral-950 text-sm shadow-xs">
                    {sampleInitials}
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-900 leading-tight">
                    {sampleName}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {t.hero.sampleLocation}
                  </p>
                </div>

                {/* Instant Actions */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#FFD700] text-black font-bold text-center py-2 rounded-lg shadow-2xs">
                    {t.common.saveContactCTA}
                  </div>
                  <div className="bg-emerald-600 text-white font-bold text-center py-2 rounded-lg shadow-2xs">
                    {t.common.whatsappCTA}
                  </div>
                </div>

                {/* Service teaser */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[10px] text-neutral-600 flex justify-between items-center">
                  <span>{t.hero.sampleJob}</span>
                  <span className="font-bold text-neutral-900 font-mono">{t.hero.samplePrice}</span>
                </div>

                {/* Micro TAGTOP branding */}
                <div className="mt-2 text-center text-[9px] text-neutral-400 font-mono tracking-wider">
                  {t.profile.digitalFooter}
                </div>
              </div>

              {/* Tap instruction trigger */}
              <div className="pt-3 text-center text-xs text-neutral-500">
                <button
                  type="button"
                  onClick={handleManualTap}
                  className="hover:text-amber-600 transition-colors underline decoration-dotted underline-offset-4 cursor-pointer font-medium"
                >
                  {t.hero.tapPrompt}
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
