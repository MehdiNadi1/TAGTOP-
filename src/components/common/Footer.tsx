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
    <footer className="bg-white border-t border-neutral-200 py-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Logo & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="w-[150px] h-[40px] flex items-center">
              <img
                src={TAGTOP_LOGO_URL}
                alt="TAGTOP"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cartes de visite NFC d'exception et profils professionnels digitaux pour les entrepreneurs et entreprises au Maroc.
            </p>
            <div className="text-xs text-slate-400">
              Casablanca · Rabat · Marrakech · Tanger · Fès · Agadir
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-black uppercase tracking-wider">
              Navigation
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
              Espaces & Solutions
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
                  onClick={() => onViewChange('founder-dashboard')}
                  className="hover:text-black transition-colors text-left rtl:text-right"
                >
                  {t.common.founderAdmin}
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
                  Configurateur de Carte
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onViewChange('public-profile')}
                  className="hover:text-black transition-colors text-left rtl:text-right"
                >
                  Démonstration Profil Public Live
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Paiement & Sécurité */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-black uppercase tracking-wider">
              Paiement & Confiance
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cartes physiques livrées en paiement à la livraison (Cash on Delivery). Renouvellements d'accès validés par virement bancaire sécurisé.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[10px] font-mono bg-neutral-100 text-slate-700 px-2 py-1 rounded">
                Cash On Delivery
              </span>
              <span className="text-[10px] font-mono bg-neutral-100 text-slate-700 px-2 py-1 rounded">
                CIH Bank
              </span>
              <span className="text-[10px] font-mono bg-neutral-100 text-slate-700 px-2 py-1 rounded">
                NTAG Certified
              </span>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} TAGTOP SARL. Tous droits réservés. Fabriqué pour le Maroc.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                onViewChange('marketing');
                onNavigateSubPage('privacy');
              }}
              className="hover:text-black transition-colors"
            >
              Politique de Confidentialité
            </button>
            <button
              onClick={() => {
                onViewChange('marketing');
                onNavigateSubPage('terms');
              }}
              className="hover:text-black transition-colors"
            >
              Conditions d'Utilisation
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
