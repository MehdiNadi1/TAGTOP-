import React, { useState, useRef } from 'react';
import { CardColor, CardBranding, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { TAGTOP_LOGO_URL } from '../../utils/assets';
import { Wifi, RotateCw } from 'lucide-react';

interface NfcCard3DProps {
  color: CardColor;
  branding: CardBranding;
  businessName?: string;
  businessTitle?: string;
  logoPreviewUrl?: string;
  cardUid?: string;
  interactiveTilt?: boolean;
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
  className = '',
  showFlipButton = true,
  currentLanguage = 'fr',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const t = translations[currentLanguage];

  const resolvedBusinessTitle = businessTitle || t.nfcCard.sampleBusinessTitle;
  const isBlack = color === 'black';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxAngle = 10;
    const rotX = -((y - centerY) / centerY) * maxAngle;
    const rotY = ((x - centerX) / centerX) * maxAngle;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    if (!interactiveTilt) return;
    setRotateX(0);
    setRotateY(0);
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
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
        onClick={() => setIsFlipped(!isFlipped)}
        role="button"
        tabIndex={0}
        aria-label={`${t.nfcCard.cardLabel} ${isBlack ? t.nfcCard.matteBlack : t.nfcCard.matteWhite}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped(!isFlipped);
          }
        }}
      >
        <div
          className="relative w-full h-full duration-500 transform-style-3d transition-transform"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : undefined }}
        >
          {/* FRONT FACE */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between backface-hidden transition-colors ${
              isBlack
                ? 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-[#0A0A0A] text-white border border-neutral-800/80'
                : 'bg-gradient-to-br from-white via-[#FBFBFA] to-[#F3F4F6] text-neutral-900 border border-neutral-200/90'
            }`}
            style={{
              boxShadow: isBlack
                ? '0 24px 48px -12px rgba(0,0,0,0.7), 0 8px 16px -6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px rgba(255,255,255,0.04)'
                : '0 24px 48px -12px rgba(0,0,0,0.12), 0 8px 16px -6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,0,0,0.05)',
            }}
          >
            {/* Top row: Metallic Smart Chip & Contactless indicator */}
            <div className="flex items-center justify-between">
              {/* Realistic Metallic Contact Chip */}
              <div
                className="w-12 h-9 rounded-md border flex flex-col justify-between p-1 relative overflow-hidden bg-gradient-to-br from-[#E6C25B] via-[#DFB140] to-[#C99E32] border-amber-300/60"
                style={{
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)',
                }}
              >
                <div className="h-[0.5px] w-full bg-amber-900/30" />
                <div className="flex justify-between w-full h-full py-0.5 items-center">
                  <div className="w-1.5 h-full rounded-xs bg-amber-900/20" />
                  <div className="w-3.5 h-full rounded-full border border-amber-900/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-900/20" />
                  </div>
                  <div className="w-1.5 h-full rounded-xs bg-amber-900/20" />
                </div>
                <div className="h-[0.5px] w-full bg-amber-900/30" />
              </div>

              {/* NFC Contactless Wave Indicator */}
              <div className="flex items-center gap-1.5 opacity-85" dir="ltr">
                <Wifi
                  className={`w-5 h-5 rotate-90 ${
                    isBlack ? 'text-[#FFD700]' : 'text-neutral-800'
                  }`}
                />
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold">
                  {t.nfcCard.nfcTap}
                </span>
              </div>
            </div>

            {/* Center Area: Brand Hallmark or Custom Business Artwork */}
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
                  <div className="text-xl font-extrabold tracking-tight uppercase font-sans">
                    {businessName}
                  </div>
                  <div className={`text-xs ${isBlack ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {resolvedBusinessTitle}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Holder Name & Security Chip Specification */}
            <div className="flex items-end justify-between pt-3 border-t border-current/10">
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase tracking-widest font-mono opacity-60">
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

          {/* BACK FACE */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between backface-hidden transition-colors ${
              isBlack
                ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white border border-neutral-800'
                : 'bg-gradient-to-br from-[#F5F5F4] via-white to-[#E7E5E4] text-neutral-900 border border-neutral-300'
            }`}
            style={{
              transform: 'rotateY(180deg)',
              boxShadow: isBlack
                ? '0 24px 48px -12px rgba(0,0,0,0.7), 0 8px 16px -6px rgba(0,0,0,0.4)'
                : '0 24px 48px -12px rgba(0,0,0,0.12), 0 8px 16px -6px rgba(0,0,0,0.06)',
            }}
          >
            {/* Magnetic stripe simulation */}
            <div
              className={`-mx-6 sm:-mx-7 -mt-2 h-10 ${
                isBlack
                  ? 'bg-neutral-900/90 border-y border-neutral-800'
                  : 'bg-neutral-800/95 border-y border-neutral-700'
              }`}
            />

            <div className="my-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-mono opacity-75" dir="ltr">
                <span>{t.nfcCard.nfcIdLabel}: {cardUid}</span>
                <span>{t.nfcCard.isoStandard}</span>
              </div>
              <p
                className={`text-xs ${
                  isBlack ? 'text-neutral-400' : 'text-neutral-600'
                } leading-relaxed text-left rtl:text-right`}
              >
                {t.nfcCard.backInstructions}
              </p>
            </div>

            {/* Back footer: TAGTOP hallmark (only if branded) */}
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
            onClick={() => setIsFlipped(!isFlipped)}
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
