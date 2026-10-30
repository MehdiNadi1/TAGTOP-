/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Language, MarketingSubPage, AppView } from '../../types';
import { translations } from '../../i18n/translations';
import { NfcCard3D } from '../cards/NfcCard3D';
import { Wifi, CheckCircle2, ArrowRight, Sparkles, Smartphone, Download, MessageSquare } from 'lucide-react';

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
  const [tapStep, setTapStep] = useState<0 | 1 | 2>(0); // 0: floating ready, 1: tap contact, 2: digital profile open
  const [activeCardColor, setActiveCardColor] = useState<'black' | 'white'>('black');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect accessibility preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Automatic demo cycle (disabled when user requests reduced motion)
  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setTapStep((prev) => (prev === 2 ? 0 : ((prev + 1) as 0 | 1 | 2)));
    }, 3600);
    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  const handleManualTap = () => {
    setTapStep(1);
    setTimeout(() => {
      setTapStep(2);
    }, 400);
  };

  const sampleName = currentLanguage === 'ar' ? 'ياسين بناني' : 'Yassine Bennani';
  const sampleInitials = currentLanguage === 'ar' ? 'يب' : 'YB';

  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-neutral-100">
      
      {/* Background architectural ambiance */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,215,0,0.06),transparent_65%)] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#f8f8f8_1px,transparent_1px),linear-gradient(to_bottom,#f8f8f8_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_65%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* EDITORIAL HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          
          {/* Eyebrow Label */}
          <motion.div
            initial={!prefersReducedMotion ? { opacity: 0, y: 12 } : undefined}
            animate={!prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-900 bg-amber-50 border border-amber-200/80 px-4 py-1.5 rounded-full mb-6 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="tracking-wide uppercase font-mono text-[11px]">{t.hero.reassurance}</span>
          </motion.div>

          {/* Majestic Display Headline */}
          <motion.h1
            initial={!prefersReducedMotion ? { opacity: 0, y: 16 } : undefined}
            animate={!prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-neutral-950 leading-[1.08] text-balance mb-6"
          >
            {t.hero.headline}
          </motion.h1>

          {/* Subtitle Statement */}
          <motion.p
            initial={!prefersReducedMotion ? { opacity: 0, y: 16 } : undefined}
            animate={!prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-base sm:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-8 font-normal"
          >
            {t.hero.subheadline}
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={!prefersReducedMotion ? { opacity: 0, y: 16 } : undefined}
            animate={!prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-8"
          >
            <button
              type="button"
              onClick={() => onNavigate('configurator')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FFD700] hover:bg-[#FACC15] text-neutral-950 font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('cards')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-sm sm:text-base px-8 py-4 rounded-xl border border-neutral-300 hover:border-neutral-900 transition-colors cursor-pointer"
            >
              <span>{t.hero.secondaryCta}</span>
            </button>
          </motion.div>

          {/* 3 Authentic Reassurance Badges */}
          <motion.div
            initial={!prefersReducedMotion ? { opacity: 0 } : undefined}
            animate={!prefersReducedMotion ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-neutral-600 font-medium pt-2"
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

        {/* CINEMATIC PRODUCT COMPOSITION: DUAL NFC CARDS & LIVE SMARTPHONE STAGE */}
        <div className="relative max-w-5xl mx-auto mt-6">
          
          {/* Hardware & Interaction Stage Container */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#FAF9F6] via-neutral-100/60 to-white border border-neutral-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] p-6 sm:p-10 lg:p-12 overflow-hidden">
            
            {/* Top Bar inside Stage: Color Variant Selector & Interaction Indicator */}
            <div className="flex items-center justify-between pb-8 border-b border-neutral-200/70 mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Wifi className="w-4 h-4 text-amber-600 shrink-0" />
                  {t.hero.interactiveDemoTitle}
                </span>
                <span className="text-[11px] text-neutral-400 hidden sm:inline">
                  — {t.hero.tapPrompt}
                </span>
              </div>

              {/* Card Color Switcher Pills */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveCardColor('black')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCardColor === 'black'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-neutral-600 inline-block" />
                  <span>{t.cards.matteBlack}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCardColor('white')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCardColor === 'white'
                      ? 'bg-neutral-100 text-neutral-950 shadow-xs'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-300 inline-block" />
                  <span>{t.cards.matteWhite}</span>
                </button>
              </div>
            </div>

            {/* Asymmetric 2-Column Product Interaction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Overlapping Luxury NFC Cards (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[380px] sm:min-h-[420px]">
                
                {/* Secondary Background Card (Ivory White or Black offset) */}
                <div
                  className="absolute top-2 sm:top-6 w-[85%] max-w-[360px] opacity-45 pointer-events-none transition-all duration-500"
                  style={{
                    transform: 'translateY(-16px) rotate(-5deg) scale(0.94)',
                  }}
                  aria-hidden="true"
                >
                  <NfcCard3D
                    color={activeCardColor === 'black' ? 'white' : 'black'}
                    branding="branded"
                    businessName={sampleName}
                    showFlipButton={false}
                    interactiveTilt={false}
                    flipOnClick={false}
                    currentLanguage={currentLanguage}
                  />
                </div>

                {/* Primary Foreground Interactive Card */}
                <div
                  className="relative z-10 w-full max-w-[390px] cursor-pointer transition-all duration-700"
                  style={{
                    transform: !prefersReducedMotion
                      ? tapStep === 1
                        ? 'translateY(24px) scale(0.98) rotate(1deg)'
                        : tapStep === 2
                          ? 'translateY(-8px) scale(0.96) rotate(0deg)'
                          : 'translateY(0px) scale(1) rotate(1deg)'
                      : undefined,
                  }}
                  onClick={handleManualTap}
                >
                  <NfcCard3D
                    color={activeCardColor}
                    branding="branded"
                    businessName={sampleName}
                    showFlipButton={false}
                    interactiveTilt={!prefersReducedMotion}
                    flipOnClick={false}
                    onCardClick={handleManualTap}
                    currentLanguage={currentLanguage}
                  />

                  {/* Gentle Tap Helper Indicator */}
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManualTap();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black bg-white/90 border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
                    >
                      <Wifi className="w-3.5 h-3.5 text-amber-600 rotate-90" />
                      <span>{t.hero.tapPrompt}</span>
                    </button>
                  </div>
                </div>

                {/* Contactless Radio Ripple on Tap */}
                {tapStep === 1 && (
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
                    aria-hidden="true"
                  >
                    <div className="w-28 h-28 rounded-full bg-[#FFD700]/30 animate-ping" />
                    <div className="absolute inset-0 w-28 h-28 rounded-full bg-[#FFD700]/60 flex items-center justify-center">
                      <Wifi className="w-8 h-8 text-black rotate-90" />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Premium Smartphone Holographic Display (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                
                {/* Smartphone Device Frame */}
                <div
                  className={`w-full max-w-[290px] bg-white rounded-[32px] p-4.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.14)] border-[3px] border-neutral-300 transition-all duration-500 overflow-hidden relative ${
                    tapStep === 2
                      ? 'ring-4 ring-[#FFD700]/60 scale-100 opacity-100'
                      : 'opacity-90 scale-95'
                  }`}
                >
                  {/* Dynamic Island / Speaker Notch */}
                  <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                  </div>

                  {/* Profile Header on Phone Screen */}
                  <div className="text-center space-y-2 pb-3 border-b border-neutral-100">
                    <div className="w-14 h-14 bg-gradient-to-tr from-[#FFD700] via-amber-300 to-amber-100 rounded-full mx-auto flex items-center justify-center font-black text-neutral-950 text-base shadow-sm ring-2 ring-white">
                      {sampleInitials}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-neutral-950 leading-tight">
                        {sampleName}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium">
                        {t.hero.sampleLocation}
                      </p>
                    </div>
                  </div>

                  {/* Instant 1-Click Action Buttons */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#FFD700] text-black font-extrabold text-center py-2.5 rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.common.saveContactCTA}</span>
                    </div>
                    <div className="bg-emerald-600 text-white font-extrabold text-center py-2.5 rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.common.whatsappCTA}</span>
                    </div>
                  </div>

                  {/* Service & Portfolio Teaser */}
                  <div className="mt-4 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-600 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{t.hero.sampleJob}</span>
                    </div>
                    <span className="font-extrabold text-neutral-950 font-mono">{t.hero.samplePrice}</span>
                  </div>

                  {/* Micro Branding Footer */}
                  <div className="mt-3 text-center text-[9px] text-neutral-400 font-mono tracking-widest uppercase">
                    {t.profile.digitalFooter}
                  </div>
                </div>

                {/* Status Subtitle below Phone */}
                <div className="mt-3 text-center text-xs text-neutral-500">
                  <span className="font-medium">
                    {tapStep === 2
                      ? (currentLanguage === 'ar'
                          ? '✓ تم تفعيل الملف الرقمي الفوري'
                          : currentLanguage === 'en'
                            ? '✓ Instant digital profile activated'
                            : '✓ Profil digital instantané activé')
                      : t.hero.tapPrompt}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
