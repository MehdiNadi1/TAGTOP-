import React from 'react';
import { Language, MarketingSubPage } from '../../types';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface LegalPagesProps {
  page: 'terms' | 'privacy';
  currentLanguage: Language;
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, onBack }) => {
  const isTerms = page === 'terms';

  return (
    <div className="py-16 bg-white min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-black mb-8"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Retour au site principal</span>
        </button>

        {/* Legal Review Disclaimer */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 mb-8 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Document type pour révision juridique :</strong> Cette notice contractuelle constitue un modèle préparatoire destiné à la révision et validation finale par le conseil juridique du titulaire de TAGTOP (conforme aux dispositions de la loi marocaine n° 09-08 relative à la protection des données à caractère personnel).
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-black mb-6">
          {isTerms ? 'Conditions Générales de Vente et d’Utilisation' : 'Politique de Confidentialité & Données Personnelles'}
        </h1>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-5 leading-relaxed">
          {isTerms ? (
            <>
              <section>
                <h2 className="text-base font-bold text-black">1. Objet & Prestations</h2>
                <p>
                  Les présentes Conditions régissent la vente des cartes physiques sans contact NFC commercialisées sous la marque TAGTOP au Maroc, ainsi que l’accès au service d’hébergement du profil professionnel digital associé.
                </p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">2. Modalités de Commande & Bon à Tirer (BAT)</h2>
                <p>
                  Toute commande de carte avec personnalisation d’artwork donne lieu à l’émission d’un bon à tirer électronique soumis au client via WhatsApp ou interface web. La production matérielle ne débute qu'après approbation expresse du BAT par le client.
                </p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">3. Paiement à la Livraison & Renouvellements</h2>
                <p>
                  Les cartes physiques Starter (249 MAD avec logo TAGTOP ou 349 MAD sans logo TAGTOP) sont payables en dirhams marocains (MAD) en espèces lors de la livraison (Cash on Delivery). L'abonnement initial de six (6) mois est inclus. Les renouvellements ultérieurs (99 MAD pour 6 mois, puis 199 MAD par an) s'effectuent par virement bancaire manuel vérifié par le fondateur.
                </p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">4. Période de Grâce & Suspension</h2>
                <p>
                  À l’issue de la période souscrite, une période de grâce de quatorze (14) jours calendaires est accordée durant laquelle le profil demeure actif. Passé ce délai sans régularisation, le profil public est suspendu de manière discrète sans communication des données de facturation.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-base font-bold text-black">1. Collecte des Données Professionnelles</h2>
                <p>
                  TAGTOP collecte uniquement les données nécessaires à la configuration de la carte physique et du profil professionnel digital (nom, fonction, société, coordonnées téléphoniques, liens web).
                </p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">2. Séparation Stricte du Consentement (Leads vs Contact Direct)</h2>
                <p>
                  Un simple tapotement NFC de la carte ne recueille aucune information sur l'interlocuteur. Seul le remplissage volontaire du formulaire de mise en relation par le visiteur transmet ses coordonnées. L'acceptation d'offres promotionnelles fait l'objet d'une case à cocher distincte, non pré-cochée.
                </p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">3. Conformité Loi 09-08</h2>
                <p>
                  Conformément à la législation marocaine, les utilisateurs disposent d’un droit d'accès, de rectification et d'opposition sur leurs données personnelles en écrivant au service support TAGTOP.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
