import React, { useState } from 'react';
import { Language, AppView, MarketingSubPage } from '../../types';
import { translations } from '../../i18n/translations';
import { TAGTOP_LOGO_URL } from '../../utils/assets';
import { Globe, Menu, X, Shield, User, ExternalLink, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  currentSubPage: MarketingSubPage;
  onNavigateSubPage: (page: MarketingSubPage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  currentView,
  onViewChange,
  currentSubPage,
  onNavigateSubPage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[currentLanguage];
  const isArabic = currentLanguage === 'ar';

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
      {/* Top Prototype & Role Bar (Provides quick switching between Website, Customer Portal, Admin & Live Profile) */}
      <div className="bg-neutral-900 text-neutral-300 text-xs py-1.5 px-4 sm:px-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide uppercase text-[10px] bg-neutral-800 px-2 py-0.5 rounded">
              TAGTOP Prototype
            </span>
            <span className="hidden sm:inline text-neutral-400">
              {t.common.demoNote}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onViewChange('marketing')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                currentView === 'marketing'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'hover:text-white hover:bg-neutral-800'
              }`}
            >
              Site Public
            </button>
            <button
              onClick={() => onViewChange('customer-dashboard')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                currentView === 'customer-dashboard'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'hover:text-white hover:bg-neutral-800'
              }`}
            >
              <User className="w-3 h-3" />
              <span>{t.common.clientArea}</span>
            </button>
            <button
              onClick={() => onViewChange('founder-dashboard')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                currentView === 'founder-dashboard'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>{t.common.founderAdmin}</span>
            </button>
            <button
              onClick={() => onViewChange('public-profile')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                currentView === 'public-profile'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'hover:text-white hover:bg-neutral-800'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
              <span>Profil Public Live</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[68px] sm:h-[80px] flex items-center justify-between gap-4 lg:gap-8">
          
          {/* ZONE 1: LOGO (Desktop 150-180px wide, max-h 48px; Mobile 120-145px, max-h 40px) */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onViewChange('marketing');
              onNavigateSubPage('home');
            }}
            className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
            aria-label="TAGTOP Accueil"
          >
            <div className="w-[125px] sm:w-[165px] h-[36px] sm:h-[44px] flex items-center justify-start">
              <img
                src={TAGTOP_LOGO_URL}
                alt="TAGTOP"
                className="w-full h-full object-contain object-left rtl:object-right"
              />
            </div>
          </a>

          {/* ZONE 2: 4-5 SINGLE-LINE NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onViewChange('marketing');
                  onNavigateSubPage(link.id);
                }}
                className={`whitespace-nowrap transition-colors hover:text-black py-1 ${
                  currentView === 'marketing' && currentSubPage === link.id
                    ? 'text-black font-semibold border-b-2 border-[#FFD700]'
                    : 'text-slate-600'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ZONE 3: ACTIONS & LANGUAGE SWITCHER */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-500 mx-1.5 hidden sm:inline" />
              {(['fr', 'ar', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    currentLanguage === lang
                      ? 'bg-white text-black shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                  aria-label={`Changer la langue en ${lang.toUpperCase()}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => {
                onViewChange('marketing');
                onNavigateSubPage('configurator');
              }}
              className="hidden sm:inline-flex items-center justify-center whitespace-nowrap bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-transform active:scale-[0.98] shadow-xs"
            >
              {t.common.orderCardCTA}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Menu principal"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 shadow-lg">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('marketing');
                    onNavigateSubPage(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-base font-medium px-3 py-2 rounded-md ${
                    currentSubPage === link.id
                      ? 'bg-amber-50 text-black font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onViewChange('marketing');
                    onNavigateSubPage('configurator');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold py-3 rounded-lg text-center text-sm"
                >
                  {t.common.orderCardCTA}
                </button>
                <button
                  onClick={() => {
                    onViewChange('customer-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2.5 rounded-lg text-center text-sm"
                >
                  {t.common.clientArea}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
