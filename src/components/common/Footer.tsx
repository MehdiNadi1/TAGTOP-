import React from 'react';
import { Language, MarketingSubPage, AppView } from '../../types';
import { translations } from '../../i18n/translations';
import { TAGTOP_LOGO_URL } from '../../utils/assets';
import { Globe } from 'lucide-react';

interface FooterProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateSubPage: (page: MarketingSubPage) => void;
  onViewChange: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLanguage,
  onLanguageChange,
  onNavigateSubPage,
  onViewChange,
}) => {
  const t = translations[currentLanguage];

  return (
    <footer className="bg-white border-t border-neutral-200/80 pt-16 pb-12 text-neutral-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* 4-Column Architectural Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-neutral-100">
          
          {/* Col 1: Brand & Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onViewChange('marketing');
                onNavigateSubPage('home');
              }}
              className="inline-block"
              aria-label={t.common.brandName}
            >
              <div className="w-[140px] sm:w-[155px] h-[38px] flex items-center">
                <img
                  src={TAGTOP_LOGO_URL}
                  alt="TAGTOP"
                  className="max-h-full max-w-full object-contain object-left rtl:object-right"
                />
              </div>
            </a>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
              {t.footer.mission}
            </p>
            <p className="text-xs font-medium text-neutral-400">
              {t.common.brandTagline}
            </p>
          </div>

          {/* Col 2: Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              {t.footer.navTitle}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('marketing');
                    onNavigateSubPage('how-it-works');
                  }}
                  className="hover:text-black transition-colors"
                >
                  {t.nav.howItWorks}
                </a>
              </li>
              <li>
                <a
                  href="#cards"
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('marketing');
                    onNavigateSubPage('cards');
                  }}
                  className="hover:text-black transition-colors"
                >
                  {t.nav.cards}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('marketing');
                    onNavigateSubPage('pricing');
                  }}
                  className="hover:text-black transition-colors"
                >
                  {t.nav.pricing}
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('marketing');
                    onNavigateSubPage('about');
                  }}
                  className="hover:text-black transition-colors"
                >
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('marketing');
                    onNavigateSubPage('faq');
                  }}
                  className="hover:text-black transition-colors"
                >
                  {t.nav.faq}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Services & Solutions (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              {t.footer.spacesTitle}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onViewChange('customer-dashboard')}
                  className="hover:text-black transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.common.clientArea}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onViewChange('marketing');
                    onNavigateSubPage('configurator');
                  }}
                  className="hover:text-black transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.footer.cardConfigurator}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onViewChange('marketing');
                    onNavigateSubPage('demo');
                  }}
                  className="hover:text-black transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.footer.liveDemo}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Language & Locale (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
              <span>{t.common.language}</span>
            </h4>
            <p className="text-xs text-neutral-500">
              {t.common.ariaSwitchLang}
            </p>
            <div
              className="inline-flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200"
              dir="ltr"
              role="group"
              aria-label={t.common.ariaSwitchLang}
            >
              {(['fr', 'ar', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    currentLanguage === lang
                      ? 'bg-white text-black shadow-xs'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                  aria-pressed={currentLanguage === lang}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="pt-2 text-xs text-neutral-400">
              <span>{t.hero.codBadge}</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                onViewChange('marketing');
                onNavigateSubPage('terms');
              }}
              className="hover:text-black transition-colors cursor-pointer"
            >
              {t.footer.terms}
            </button>
            <span className="text-neutral-300">•</span>
            <button
              type="button"
              onClick={() => {
                onViewChange('marketing');
                onNavigateSubPage('privacy');
              }}
              className="hover:text-black transition-colors cursor-pointer"
            >
              {t.footer.privacy}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
