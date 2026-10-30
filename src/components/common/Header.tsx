/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, AppView, MarketingSubPage } from '../../types';
import { translations } from '../../i18n/translations';
import { TAGTOP_LOGO_URL } from '../../utils/assets';
import { AuthUserProfile } from '../../services/backend/authService';
import { Globe, Menu, X, Shield, User, ArrowRight } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  currentSubPage: MarketingSubPage;
  onNavigateSubPage: (page: MarketingSubPage) => void;
  currentUser?: AuthUserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  currentView,
  onViewChange,
  currentSubPage,
  onNavigateSubPage,
  currentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const t = translations[currentLanguage];

  // Optional developer / admin toolbar (only with ?dev=true or localStorage flag)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isDev = params.has('dev') || localStorage.getItem('tagtop_dev') === 'true';
      setIsDevMode(isDev);
    }
  }, []);

  // Track window scroll for elevation shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { id: MarketingSubPage; label: string }[] = [
    { id: 'how-it-works', label: t.nav.howItWorks },
    { id: 'cards', label: t.nav.cards },
    { id: 'pricing', label: t.nav.pricing },
    { id: 'demo', label: t.nav.demo },
    { id: 'about', label: t.nav.about },
    { id: 'faq', label: t.nav.faq },
  ];

  return (
    <>
      {/* Optional Dev / Inspection Bar */}
      {isDevMode && (
        <aside
          className="bg-neutral-950 text-neutral-300 text-xs py-1.5 px-4 sm:px-8 border-b border-neutral-800"
          aria-label="Development toolbar"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-wide uppercase text-[10px] bg-neutral-800 px-2 py-0.5 rounded font-mono">
                TAGTOP Dev
              </span>
              <span className="hidden sm:inline text-neutral-400">
                {t.common.demoNote}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => onViewChange('marketing')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  currentView === 'marketing'
                    ? 'bg-[#FFD700] text-black font-semibold'
                    : 'hover:text-white hover:bg-neutral-800'
                }`}
              >
                {t.common.publicSite}
              </button>
              <button
                type="button"
                onClick={() => onViewChange('customer-dashboard')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentView === 'customer-dashboard'
                    ? 'bg-[#FFD700] text-black font-semibold'
                    : 'hover:text-white hover:bg-neutral-800'
                }`}
              >
                <User className="w-3 h-3 shrink-0" />
                <span>{t.common.clientArea}</span>
              </button>
              <button
                type="button"
                onClick={() => onViewChange('founder-dashboard')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentView === 'founder-dashboard'
                    ? 'bg-[#FFD700] text-black font-semibold'
                    : 'hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Shield className="w-3 h-3 shrink-0" />
                <span>{t.common.founderAdmin}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Primary Sticky Header */}
      <header
        className={`sticky top-0 z-50 bg-white/98 backdrop-blur-md transition-all duration-200 border-b ${
          isScrolled ? 'border-neutral-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]' : 'border-neutral-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] sm:h-[80px] flex items-center justify-between gap-4">
          
          {/* ZONE 1: LOGO */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onViewChange('marketing');
              onNavigateSubPage('home');
            }}
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] rounded-lg py-1"
            aria-label={`${t.common.brandName} - ${t.common.ariaHome}`}
          >
            <div className="h-8 sm:h-9 w-auto flex items-center">
              <img
                src={TAGTOP_LOGO_URL}
                alt="TAGTOP"
                className="h-full w-auto object-contain object-left rtl:object-right"
              />
            </div>
          </a>

          {/* ZONE 2: PRIMARY NAVIGATION LINKS (Visible from md/tablet and up) */}
          <nav
            className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-8 text-sm"
            aria-label="Navigation principale"
          >
            {navLinks.map((link) => {
              const isActive = currentView === 'marketing' && currentSubPage === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('marketing');
                    onNavigateSubPage(link.id);
                  }}
                  className={`relative py-1.5 text-xs lg:text-sm font-semibold tracking-tight transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'text-neutral-950 font-bold'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFD700] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* ZONE 3: ACTIONS & CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Espace Client (Client Area Access) */}
            <button
              type="button"
              onClick={() => onViewChange('customer-dashboard')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentView === 'customer-dashboard'
                  ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                  : 'text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {currentUser ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
              )}
              <span>{currentUser?.fullName?.split(' ')[0] || t.common.clientArea}</span>
            </button>

            {/* Language Selector: Compact Segmented Toggle (FR | AR | EN) */}
            <div
              className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/90"
              dir="ltr"
              role="group"
              aria-label={t.common.ariaSwitchLang}
            >
              <Globe className="w-3.5 h-3.5 text-neutral-400 mx-1 hidden sm:inline shrink-0" />
              {(['fr', 'ar', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-md transition-all cursor-pointer ${
                    currentLanguage === lang
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-950'
                  }`}
                  aria-pressed={currentLanguage === lang}
                  aria-label={`${t.common.ariaSwitchLang} ${lang.toUpperCase()}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Primary Order CTA (TAGTOP Gold) */}
            <button
              type="button"
              onClick={() => {
                onViewChange('marketing');
                onNavigateSubPage('configurator');
              }}
              className="inline-flex items-center justify-center whitespace-nowrap bg-[#FFD700] hover:bg-[#FACC15] text-neutral-950 font-extrabold text-xs sm:text-sm px-3.5 sm:px-4.5 py-2.5 rounded-lg transition-transform active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <span>{t.common.orderCardCTA}</span>
            </button>

            {/* Mobile Hamburger Toggle (Visible on screens < md) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label={t.common.ariaMainMenu}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white px-5 py-6 shadow-xl animate-fadeIn">
            <nav className="flex flex-col gap-2" aria-label="Menu mobile">
              {navLinks.map((link) => {
                const isActive = currentSubPage === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onViewChange('marketing');
                      onNavigateSubPage(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-base font-bold px-3.5 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-neutral-100 text-neutral-950 border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#FFD700]'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}

              {/* Mobile Language Switcher */}
              <div className="pt-4 pb-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {t.common.language}
                </span>
                <div
                  className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200"
                  dir="ltr"
                >
                  {(['fr', 'ar', 'en'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        onLanguageChange(lang);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        currentLanguage === lang
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onViewChange('marketing');
                    onNavigateSubPage('configurator');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold py-3.5 rounded-xl text-center text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.common.orderCardCTA}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onViewChange('customer-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-white hover:bg-neutral-50 text-neutral-900 font-bold py-3 rounded-xl text-center text-sm border border-neutral-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-neutral-700" />
                  <span>{t.common.clientArea}</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
