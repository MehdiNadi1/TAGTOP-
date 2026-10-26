import React, { useState } from 'react';
import { Language } from '../../types';
import { ChevronDown } from 'lucide-react';

interface FaqSectionProps {
  currentLanguage: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ currentLanguage }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Est-ce que tous les smartphones sont compatibles avec la carte TAGTOP ?',
      a: 'Tous les iPhones récents (iPhone XR, XS, 11, 12, 13, 14, 15, 16 et suivants) lisent les cartes NFC nativement sans aucune configuration. La quasi-totalité des smartphones Android modernes sont également équipés de NFC. Aucun téléchargement d’application n’est requis pour votre interlocuteur.',
    },
    {
      q: 'Qu’est-ce que l’aperçu privé gratuit ?',
      a: 'Avant de commander votre carte physique, vous pouvez créer un compte et configurer votre profil complet (bio, services, catalogue, liens, formulaire). Cet aperçu reste strictement confidentiel et accessible uniquement par vous. Il ne sera publié et lié à une carte NFC qu’après validation de votre commande.',
    },
    {
      q: 'Comment fonctionne le paiement à la livraison (COD) ?',
      a: 'Pour votre commande de carte physique Starter, vous réglez le montant exact (249 MAD avec logo TAGTOP ou 349 MAD sans logo TAGTOP) directement en espèces au livreur lors de la remise de votre colis en main propre.',
    },
    {
      q: 'Comment s’effectuent les renouvellements après les 6 premiers mois inclus ?',
      a: 'Les renouvellements (99 MAD pour 6 mois, puis 199 MAD par an) s’effectuent par virement bancaire manuel vers notre compte bancaire marocain (CIH Bank). Vous transmettez votre avis de virement via WhatsApp à notre fondateur qui valide manuellement votre période.',
    },
    {
      q: 'Que se passe-t-il si j’oublie de renouveler à temps (Période de grâce) ?',
      a: 'TAGTOP applique une période de grâce de 14 jours. Durant ces 14 jours, votre carte et votre profil public restent parfaitement actifs et fonctionnels, avec une simple alerte dans votre espace client. Si aucun virement n’est confirmé après 14 jours, le profil public affiche un message discret d’indisponibilité, tout en conservant intacts tous vos contenus privés.',
    },
    {
      q: 'Puis-je modifier mes informations après réception de ma carte ?',
      a: 'Oui, à tout moment et de manière illimitée depuis votre Espace Client TAGTOP. Le lien encodé dans votre carte NFC renvoie directement vers votre profil dynamique en ligne, sans jamais avoir besoin de réimprimer une carte.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-neutral-50/50 border-b border-neutral-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
            Questions Fréquentes
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
            Tout ce que vous devez savoir sur TAGTOP
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Des réponses claires pour aborder votre transition vers la carte de visite sans contact.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left rtl:text-right px-6 py-5 flex items-center justify-between gap-4 font-bold text-base text-slate-900 hover:text-black focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-neutral-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
