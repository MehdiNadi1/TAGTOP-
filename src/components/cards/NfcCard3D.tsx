/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { CardColor, CardBranding, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { TAGTOP_LOGO_URL } from '../../utils/assets';
import { Wifi, RotateCw, Sparkles } from 'lucide-react';

interface NfcCard3DProps {
  color: CardColor;
  branding: CardBranding;
  businessName?: string;
  businessTitle?: string;
  logoPreviewUrl?: string;
  cardUid?: string;
  interactiveTilt?: boolean;
  flipOnClick?: boolean;
  onCardClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  showFlipButton?: boolean;
  currentLanguage?: Language;
}

export const NfcCard3D: React.FC<NfcCard3DProps> = ({
  color = 'black',
  branding = 'branded',
  businessName = 'ATELIER ATLAS DESIGN',
  businessTitle,
  logoPreviewUrl,
  cardUid = '04:A2:8F:9C:3E:11:80',
  interactiveTilt = true,
  flipOnClick = true,
  onCardClick,
  className = '',
  showFlipButton = true,
  currentLanguage = 'fr',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const t = translations[currentLanguage];

  const resolvedBusinessTitle = businessTitle || t.nfcCard.sampleBusinessTitle;
  const isBlack = color === 'black';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt || prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxAngle = 9;
    const rotX = -((y - centerY) / centerY) * maxAngle;
    const rotY = ((x - centerX) / centerX) * maxAngle;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    if (!interactiveTilt || prefersReducedMotion) return;
    setRotateX(0);
    setRotateY(0);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onCardClick) {
      onCardClick(e);
    }
    if (flipOnClick) {
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* 3D Perspective Canvas */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="perspective-1000 w-full max-w-[420px] aspect-[1.586] cursor-pointer select-none transition-transform duration-200"
        style={{
          transform: !prefersReducedMotion ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : undefined,
        }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`${t.nfcCard.cardLabel} ${isBlack ? t.nfcCard.matteBlack : t.nfcCard.matteWhite}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (flipOnClick) {
              setIsFlipped(!isFlipped);
            }
          }
        }}
      >
        <div
          className="relative w-full h-full duration-500 transform-style-3d transition-transform"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : undefined }}
        >
          {/* FRONT FACE: Sleek Executive Contactless NFC Business Card */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between backface-hidden transition-colors ${
              isBlack
                ? 'bg-gradient-to-br from-[#121212] via-[#0A0A0A] to-[#050505] text-white border border-neutral-800/80'
                : 'bg-gradient-to-br from-white via-[#FCFCFB] to-[#F4F4F2] text-neutral-900 border border-neutral-200/90'
            }`}
            style={{
              boxShadow: isBlack
                ? '0 24px 48px -12px rgba(0,0,0,0.7), 0 8px 16px -6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.03)'
                : '0 24px 48px -12px rgba(0,0,0,0.12), 0 8px 16px -6px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(0,0,0,0.04)',
            }}
          >
            {/* Top row: Subtle Technology Hallmark & Contactless Wave Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 opacity-80" dir="ltr">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-neutral-400">
                  NFC SMART CARD
                </span>
              </div>

              {/* NFC Contactless Wave Indicator */}
              <div className="flex items-center gap-1.5 opacity-90" dir="ltr">
                <Wifi
                  className={`w-5 h-5 rotate-90 ${
                    isBlack ? 'text-[#FFD700]' : 'text-neutral-900'
                  }`}
                />
                <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold">
                  {t.nfcCard.nfcTap}
                </span>
              </div>
            </div>

            {/* Center Area: Brand Logo or Custom Business Artwork */}
            <div className="my-auto py-2">
              {logoPreviewUrl ? (
                <div className="max-h-12 flex items-center">
                  <img
                    src={logoPreviewUrl}
                    alt={businessName}
                    className="max-h-12 max-w-[200px] object-contain"
                  />
                </div>
              ) : branding === 'branded' ? (
                <div className="flex items-center gap-2">
                  <img
                    src={TAGTOP_LOGO_URL}
                    alt="TAGTOP"
                    className={`h-8 w-auto object-contain ${
                      isBlack ? 'brightness-0 invert' : ''
                    }`}
                  />
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-extrabold tracking-tight uppercase font-sans">
                    {businessName}
                  </div>
                  <div className={`text-xs ${isBlack ? 'text-neutral-400' : 'text-neutral-600'} font-medium`}>
                    {resolvedBusinessTitle}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Holder Name & NFC Specification */}
            <div className="flex items-end justify-between pt-3 border-t border-current/10">
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase tracking-widest font-mono opacity-50">
                  {t.nfcCard.holderLabel}
                </p>
                <p className="text-sm font-bold tracking-tight uppercase truncate max-w-[220px]">
                  {businessName}
                </p>
              </div>
              <div className="text-right rtl:text-left">
                <p className="text-[9px] font-mono opacity-50 tracking-widest uppercase">
                  {t.nfcCard.secureChip}
                </p>
              </div>
            </div>
          </div>

          {/* BACK FACE: Clean Executive Matte Back (No payment magstripe) */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between backface-hidden transition-colors ${
              isBlack
                ? 'bg-gradient-to-br from-[#121212] via-[#0A0A0A] to-[#050505] text-white border border-neutral-800'
                : 'bg-gradient-to-br from-white via-[#FCFCFB] to-[#F4F4F2] text-neutral-900 border border-neutral-200'
            }`}
            style={{
              transform: 'rotateY(180deg)',
              boxShadow: isBlack
                ? '0 24px 48px -12px rgba(0,0,0,0.7), 0 8px 16px -6px rgba(0,0,0,0.4)'
                : '0 24px 48px -12px rgba(0,0,0,0.12), 0 8px 16px -6px rgba(0,0,0,0.05)',
            }}
          >
            {/* Top Row: Serial UID & Specification */}
            <div className="flex items-center justify-between text-xs font-mono opacity-70 border-b border-current/10 pb-3" dir="ltr">
              <span className="text-[10px] tracking-wider">{t.nfcCard.nfcIdLabel}: {cardUid}</span>
              <span className="text-[10px] tracking-wider">{t.nfcCard.isoStandard}</span>
            </div>

            {/* Center Area: Contactless Antenna Target Zone & Instructions */}
            <div className="my-auto py-2 text-center space-y-2">
              <div
                className={`w-12 h-12 mx-auto rounded-full border flex items-center justify-center ${
                  isBlack ? 'border-neutral-700 bg-neutral-900/60' : 'border-neutral-300 bg-neutral-100/60'
                }`}
              >
                <Wifi className={`w-5 h-5 rotate-90 ${isBlack ? 'text-[#FFD700]' : 'text-neutral-800'}`} />
              </div>
              <p
                className={`text-xs ${
                  isBlack ? 'text-neutral-400' : 'text-neutral-600'
                } leading-relaxed max-w-[280px] mx-auto text-center font-medium`}
              >
                {t.nfcCard.backInstructions}
              </p>
            </div>

            {/* Back footer: TAGTOP hallmark (only if branded) or bespoke marker */}
            <div className="flex items-center justify-between pt-3 border-t border-current/10 text-xs">
              {branding === 'branded' ? (
                <div className="flex items-center gap-1.5 opacity-85">
                  <span className="text-[10px] font-mono tracking-wider">{t.nfcCard.poweredBy}</span>
                  <img
                    src={TAGTOP_LOGO_URL}
                    alt="TAGTOP"
                    className={`h-4 w-auto object-contain ${isBlack ? 'brightness-0 invert' : ''}`}
                  />
                </div>
              ) : (
                <span className="text-[10px] font-mono opacity-60">{t.nfcCard.bespokeCard}</span>
              )}
              <span className="text-[10px] font-mono opacity-60">{t.nfcCard.madeForMorocco}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Helper / Flip Button */}
      {showFlipButton && (
        <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors cursor-pointer font-medium"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? t.nfcCard.flipFront : t.nfcCard.flipBack}</span>
          </button>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-400">{t.nfcCard.tiltHint}</span>
        </div>
      )}
    </div>
  );
};
