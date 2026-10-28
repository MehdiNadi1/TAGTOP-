import React from 'react';
import { Language, MarketingSubPage, AppView } from '../../types';
import { translations } from '../../i18n/translations';
import { TAGTOP_LOGO_URL } from '../../utils/assets';

interface FooterProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateSubPage: (page: MarketingSubPage) => void;
  onViewChange: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLanguage,
  onNavigateSubPage,
  onViewChange,
}) => {
  const t = translations[currentLanguage];

  return (
    <footer className="bg-white border-t border-neutral-200 py-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Logo & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="w-[150px] h-[40px] flex items-center">
              <img
                src={TAGTOP_LOGO_URL}
                alt="TAGTOP"
                className="max-h-full max-w-full object-contain object-left rtl:object-right"
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.footer.mission}
            </p>
            <div className="text-xs text-slate-400">
              {t.footer.cities}
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-black uppercase tracking-wider">
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
                  href="#demo"
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('marketing');
                    onNavigateSubPage('demo');
                  }}
                  className="hover:text-black transition-colors"
                >
                  {t.nav.demo}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Accès & Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-black uppercase tracking-wider">
              {t.footer.spacesTitle}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onViewChange('customer-dashboard')}
                  className="hover:text-black transition-colors text-left rtl:text-right"
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
                  className="hover:text-black transition-colors text-left rtl:text-right"
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
                  className="hover:text-black transition-colors text-left rtl:text-right"
                >
                  {t.footer.liveDemo}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Payment Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-black uppercase tracking-wider">
              {t.footer.paymentTitle}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.footer.paymentDesc}
            </p>
            <div className="space-y-1 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{t.footer.cashOnDelivery}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{t.footer.cihBank}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{t.footer.ntagCertified}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                onViewChange('marketing');
                onNavigateSubPage('terms');
              }}
              className="hover:text-black transition-colors"
            >
              {t.footer.terms}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                onViewChange('marketing');
                onNavigateSubPage('privacy');
              }}
              className="hover:text-black transition-colors"
            >
              {t.footer.privacy}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
