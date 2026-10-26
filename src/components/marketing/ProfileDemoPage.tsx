import React, { useState } from 'react';
import { BusinessProfile, Language, MarketingSubPage } from '../../types';
import { PublicProfileView } from '../profile/PublicProfileView';
import { ArrowLeft } from 'lucide-react';

interface ProfileDemoPageProps {
  currentLanguage: Language;
  demoProfiles: BusinessProfile[];
  onNavigate: (page: MarketingSubPage) => void;
  onOrderCard: () => void;
}

export const ProfileDemoPage: React.FC<ProfileDemoPageProps> = ({
  currentLanguage,
  demoProfiles,
  onNavigate,
  onOrderCard,
}) => {
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
  const activeDemoProfile = demoProfiles[selectedProfileIndex] || demoProfiles[0];

  return (
    <div className="py-12 bg-neutral-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-black mb-2"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>Retour à l’accueil</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-amber-400 text-black px-2 py-0.5 rounded font-extrabold">
                Démonstration Interactive Officielle
              </span>
              <span className="text-xs text-slate-500">
                Données fictives de démonstration marocaine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black mt-1">
              Expérience Visiteur Profil NFC
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOrderCard}
              className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs"
            >
              Commander ma carte NFC
            </button>
          </div>
        </div>

        {/* Demo Selector Tabs */}
        <div className="mb-8 flex items-center gap-2 p-1 bg-white rounded-2xl border border-neutral-200 max-w-fit shadow-xs flex-wrap">
          <span className="text-xs text-slate-500 px-3 font-semibold">
            Exemples Métiers :
          </span>
          {demoProfiles.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProfileIndex(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedProfileIndex === idx
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              {p.displayName} ({p.company})
            </button>
          ))}
        </div>

        {/* Interactive Viewport */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <PublicProfileView
              profile={activeDemoProfile}
              currentLanguage={currentLanguage}
              onLeadSubmitted={(lead) => {
                alert(`Démonstration : Prospect reçu pour ${lead.name} (${lead.phone}).`);
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
