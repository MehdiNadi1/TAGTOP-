import React from 'react';
import { Language, MarketingSubPage } from '../../types';
import { translations } from '../../i18n/translations';
import { Check, ShieldCheck, ArrowRight, HelpCircle, Mail } from 'lucide-react';

interface PricingSectionProps {
  currentLanguage: Language;
  onNavigate: (page: MarketingSubPage) => void;
  onOpenQuoteModal: (tier: 'pro' | 'enterprise') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  currentLanguage,
  onNavigate,
  onOpenQuoteModal,
}) => {
  const t = translations[currentLanguage];

  return (
    <section id="pricing" className="py-20 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
            Transparence Absolue
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight text-balance">
            {t.pricing.title}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* 3 Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          
          {/* 1. STARTER (CONFIRMED LAUNCH PACKAGE) */}
          <div className="rounded-3xl p-8 border-2 border-amber-400 bg-amber-50/20 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-8 bg-[#FFD700] text-black font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Formule Recommandée
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-black">{t.pricing.starterTitle}</h3>
                <span className="text-xs font-mono bg-neutral-100 text-slate-700 px-2.5 py-1 rounded-md">
                  1 Carte NFC
                </span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-black tabular-nums">249</span>
                  <span className="text-base font-bold text-slate-700">MAD</span>
                  <span className="text-xs text-slate-500">(Avec logo TAGTOP)</span>
                </div>
                <div className="flex items-baseline gap-2 text-slate-600 text-sm">
                  <span className="font-semibold text-black">ou 349 MAD</span>
                  <span className="text-xs">(Sans logo TAGTOP sur la carte)</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-amber-200/60 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>1 carte PVC noire ou blanche finition mate</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold text-black">6 premiers mois d'accès digital inclus</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Profil professionnel complet sans application</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Validation du BAT sur WhatsApp avant impression</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Paiement à la livraison au Maroc</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('configurator')}
                className="w-full bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold py-3.5 px-4 rounded-xl text-center text-sm shadow-sm transition-all active:scale-[0.98]"
              >
                Configurer ma carte Starter
              </button>
            </div>
          </div>

          {/* 2. PRO (5-CARD BUNDLE - SUR DEVIS) */}
          <div className="rounded-3xl p-8 border border-neutral-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-black">{t.pricing.proTitle}</h3>
                <span className="text-xs font-mono bg-neutral-100 text-slate-700 px-2.5 py-1 rounded-md">
                  Pack 5 Cartes
                </span>
              </div>

              <div className="space-y-1 mb-6">
                <span className="text-3xl font-extrabold text-black">
                  {t.pricing.proQuote}
                </span>
                <p className="text-xs text-slate-500">
                  Tarif sur mesure adapté à vos besoins d’équipe
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-100 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>5 cartes NFC avec attribution flexible</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Plusieurs cartes vers un ou plusieurs profils</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Gestion centralisée par un seul compte propriétaire</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Option avec ou sans marquage TAGTOP</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() => onOpenQuoteModal('pro')}
                className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 px-4 rounded-xl text-center text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Demander un devis Pro</span>
              </button>
            </div>
          </div>

          {/* 3. ENTERPRISE (VOLUME ORDERS - SUR DEVIS) */}
          <div className="rounded-3xl p-8 border border-neutral-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-black">{t.pricing.enterpriseTitle}</h3>
                <span className="text-xs font-mono bg-neutral-100 text-slate-700 px-2.5 py-1 rounded-md">
                  Volume & Réseaux
                </span>
              </div>

              <div className="space-y-1 mb-6">
                <span className="text-3xl font-extrabold text-black">
                  {t.pricing.enterpriseQuote}
                </span>
                <p className="text-xs text-slate-500">
                  Commandes groupées pour entreprises et institutions
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-100 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Volume dès 10+ cartes NFC personnalisées</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Charte graphique d'entreprise sur mesure</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Accompagnement dédié du fondateur TAGTOP</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Facturation marocaine entreprise (SARL)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() => onOpenQuoteModal('enterprise')}
                className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 px-4 rounded-xl text-center text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Demander un devis Entreprise</span>
              </button>
            </div>
          </div>

        </div>

        {/* 3-STAGE SUBSCRIPTION TIMELINE (CONFIRMED STANDARD SCHEDULE) */}
        <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 text-white border border-neutral-800">
          <div className="max-w-2xl mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              {t.pricing.timelineTitle}
            </h3>
            <p className="text-sm text-neutral-400">
              {t.pricing.renewalNotice}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Stage 1 */}
            <div className="p-6 rounded-2xl bg-neutral-950/70 border border-neutral-800 relative">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
                Étape 1
              </span>
              <h4 className="text-lg font-bold text-white mt-1 mb-2">
                {t.pricing.stage1Title}
              </h4>
              <div className="text-3xl font-extrabold text-amber-400 tabular-nums mb-2">
                0 MAD <span className="text-xs text-neutral-400 font-normal">inclus</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t.pricing.stage1Desc}
              </p>
            </div>

            {/* Stage 2 */}
            <div className="p-6 rounded-2xl bg-neutral-950/70 border border-neutral-800 relative">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
                Étape 2
              </span>
              <h4 className="text-lg font-bold text-white mt-1 mb-2">
                {t.pricing.stage2Title}
              </h4>
              <div className="text-3xl font-extrabold text-white tabular-nums mb-2">
                99 MAD <span className="text-xs text-neutral-400 font-normal">/ 6 mois</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t.pricing.stage2Desc}
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-6 rounded-2xl bg-neutral-950/70 border border-neutral-800 relative">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
                Étape 3
              </span>
              <h4 className="text-lg font-bold text-white mt-1 mb-2">
                {t.pricing.stage3Title}
              </h4>
              <div className="text-3xl font-extrabold text-white tabular-nums mb-2">
                199 MAD <span className="text-xs text-neutral-400 font-normal">/ an</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t.pricing.stage3Desc}
              </p>
            </div>

          </div>

          {/* Grace Period Reassurance */}
          <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center gap-3 text-xs text-neutral-400">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Période de grâce de 14 jours garantie :</strong> En cas d’échéance, votre profil reste actif pendant 14 jours avec un rappel discret dans votre espace client. Après ce délai, le profil public est suspendu discrètement sans aucune divulgation de vos données privées.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
