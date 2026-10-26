import React from 'react';
import { Language } from '../../types';
import { Shield, MapPin, Award, CheckCircle } from 'lucide-react';

interface AboutSectionProps {
  currentLanguage: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ currentLanguage }) => {
  return (
    <section id="about" className="py-20 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Notre Mission au Maroc
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight text-balance">
              Redéfinir le premier contact des entrepreneurs marocains
            </h2>
            <p className="text-base text-slate-700 leading-relaxed">
              TAGTOP est née d’un constat évident : les cartes de visite papier traditionnelles finissent oubliées ou jetées, alors que chaque rencontre physique d’affaires est une opportunité précieuse.
            </p>
            <p className="text-base text-slate-700 leading-relaxed">
              Nous avons conçu une solution matérielle et logicielle haut de gamme, adaptée aux réalités et exigences des professionnels au Maroc : des cartes PVC mates d’une grande élégance tactile, associées à un profil professionnel dynamique, accessible instantanément sans application et respectueux du consentement de vos interlocuteurs.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">Conçu au Maroc</h4>
                  <p className="text-xs text-slate-500">Casablanca & Royaume</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">Artisanat & Contrôle</h4>
                  <p className="text-xs text-slate-500">Chaque BAT validé</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-8 rounded-3xl bg-neutral-900 text-white border border-neutral-800 space-y-6 relative overflow-hidden">
              <div className="space-y-3">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-semibold">
                  Engagement Fondateur
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Une relation directe et humaine avec chaque client
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  « Chez TAGTOP, nous ne déléguons pas votre identité à un algorithme impersonnel. Avant toute impression de carte NFC, je vérifie personnellement la qualité de votre logo, prépare votre bon à tirer et vous le soumets directement sur WhatsApp. Vous ne payez votre carte qu’à la livraison après vérification du colis. »
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">L'Équipe Fondatrice TAGTOP</p>
                  <p className="text-xs text-neutral-400">Maroc · Service Entreprises & Créateurs</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Support Dédié</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
