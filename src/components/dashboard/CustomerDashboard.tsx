import React, { useState } from 'react';
import {
  Language,
  CustomerTab,
  BusinessProfile,
  NfcCardOrder,
  LeadSubmission,
  BankTransferRenewal,
  SystemSettings,
  AppView,
} from '../../types';
import { translations } from '../../i18n/translations';
import { PublicProfileView } from '../profile/PublicProfileView';
import {
  LayoutDashboard,
  UserCheck,
  CreditCard,
  Users,
  BarChart3,
  Calendar,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Edit3,
  Eye,
  FileCheck,
  MessageSquare,
  Phone,
  Mail,
  Send,
  Download,
  Shield,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

interface CustomerDashboardProps {
  currentLanguage: Language;
  profiles: BusinessProfile[];
  orders: NfcCardOrder[];
  leads: LeadSubmission[];
  transfers: BankTransferRenewal[];
  settings: SystemSettings;
  onUpdateProfile: (updated: BusinessProfile) => void;
  onApproveProof: (orderId: string) => void;
  onRequestProofChange: (orderId: string, reason: string) => void;
  onSubmitRenewalTransfer: (transfer: BankTransferRenewal) => void;
  onViewChange: (view: AppView) => void;
  onOrderNewCard: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentLanguage,
  profiles,
  orders,
  leads,
  transfers,
  settings,
  onUpdateProfile,
  onApproveProof,
  onRequestProofChange,
  onSubmitRenewalTransfer,
  onViewChange,
  onOrderNewCard,
}) => {
  const t = translations[currentLanguage];
  const [activeTab, setActiveTab] = useState<CustomerTab>('overview');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    profiles[0]?.id || ''
  );

  // Profile Editor state
  const currentProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];
  const [editorData, setEditorData] = useState<BusinessProfile>(currentProfile);
  const [mobileEditorTab, setMobileEditorTab] = useState<'edit' | 'preview'>('edit');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Proof revision state
  const [rejectProofReason, setRejectProofReason] = useState('');
  const [activeOrderProofId, setActiveOrderProofId] = useState<string | null>(null);

  // Renewal form state
  const [renewalReceipt, setRenewalReceipt] = useState('');
  const [renewalPeriod, setRenewalPeriod] = useState<'6months' | 'annual'>('6months');
  const [renewalSubmitted, setRenewalSubmitted] = useState(false);

  // Leads search
  const [leadSearchQuery, setLeadSearchQuery] = useState('');

  // Sync editor when profile changes
  React.useEffect(() => {
    if (currentProfile) {
      setEditorData(currentProfile);
    }
  }, [currentProfile?.id]);

  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editorData);
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  const handleClaimTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewalReceipt) return;

    const newTransfer: BankTransferRenewal = {
      id: `trn-${Date.now()}`,
      profileId: currentProfile.id,
      profileName: currentProfile.displayName,
      customerName: currentProfile.ownerName,
      customerPhone: currentProfile.phone,
      amountMAD: renewalPeriod === '6months' ? 99 : 199,
      periodDescription:
        renewalPeriod === '6months'
          ? 'Renouvellement 6 mois supplémentaires (99 MAD)'
          : 'Renouvellement annuel (199 MAD)',
      receiptNumber: renewalReceipt,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      founderNotes: 'En attente de vérification manuelle par le fondateur.',
    };

    onSubmitRenewalTransfer(newTransfer);
    setRenewalSubmitted(true);
    setRenewalReceipt('');
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(leadSearchQuery.toLowerCase())) ||
      l.phone.includes(leadSearchQuery)
  );

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        
        {/* Top Header Bar inside Dashboard */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                Espace Propriétaire
              </span>
              <span className="text-xs text-slate-500">
                Compte : {currentProfile.ownerEmail}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-black mt-1">
              {t.dashboard.customerTitle}
            </h1>
          </div>

          {/* Quick Profile Switcher & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="bg-neutral-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-black focus:ring-2 focus:ring-amber-400"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.accessState})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onOrderNewCard}
              className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Commander une nouvelle carte</span>
            </button>
          </div>
        </div>

        {/* Access Warning / Grace Period Banner */}
        {currentProfile.accessState === 'grace_period' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500 text-black border border-amber-600 shadow-xs flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-extrabold text-sm">
                  Période de grâce de 14 jours active pour « {currentProfile.displayName} »
                </p>
                <p className="text-xs text-black/80">
                  Votre profil reste public et accessible par NFC. Date limite de renouvellement : {currentProfile.graceDeadlineDate}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('subscription')}
              className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Régulariser par virement (99 MAD)
            </button>
          </div>
        )}

        {currentProfile.accessState === 'private_preview' && (
          <div className="mb-6 p-4 rounded-2xl bg-neutral-900 text-white border border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-white">
                  Ce profil est actuellement en APERÇU PRIVÉ GRATUIT
                </p>
                <p className="text-xs text-neutral-400">
                  Visible uniquement par vous. Pour publier ce profil en ligne et l'associer à une puce NFC, une commande de carte physique est requise.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOrderNewCard}
              className="px-4 py-2 bg-[#FFD700] text-black font-bold text-xs rounded-xl"
            >
              Commander la carte pour publier
            </button>
          </div>
        )}

        {/* Dashboard Main Grid: Left Navigation / Right Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* NAVIGATION SIDEBAR (3 cols) */}
          <aside className="lg:col-span-3 bg-white rounded-3xl p-4 border border-neutral-200 shadow-xs">
            <nav className="space-y-1.5">
              {[
                { id: 'overview', label: t.dashboard.overview, icon: LayoutDashboard },
                { id: 'profiles', label: t.dashboard.profiles, icon: UserCheck },
                { id: 'cards-orders', label: t.dashboard.cardsOrders, icon: CreditCard },
                { id: 'leads', label: t.dashboard.leads, icon: Users, badge: leads.length },
                { id: 'analytics', label: t.dashboard.analytics, icon: BarChart3 },
                { id: 'subscription', label: t.dashboard.subscription, icon: Calendar },
                { id: 'settings', label: t.dashboard.settings, icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as CustomerTab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#FFD700] text-black font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span className="font-mono text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* MAIN CONTENT AREA (9 cols) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200">
                    <p className="text-xs text-slate-500 font-medium">Statut du profil</p>
                    <p className="text-lg font-extrabold text-black mt-1 capitalize flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>{currentProfile.accessState.replace('_', ' ')}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Échéance : {currentProfile.expiryDate}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-200">
                    <p className="text-xs text-slate-500 font-medium">Consultations anonymes</p>
                    <p className="text-2xl font-extrabold text-black mt-1 tabular-nums">
                      148
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Taps NFC & scans QR au Maroc
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-200">
                    <p className="text-xs text-slate-500 font-medium">Prospects collectés (Leads)</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">
                      {leads.length}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Formulaires soumis avec consentement
                    </p>
                  </div>
                </div>

                {/* 3-Stage Timeline Card */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-4">
                  <h3 className="text-base font-bold text-black">
                    Calendrier de votre abonnement standard
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                      <div className="font-bold">1. 6 premiers mois</div>
                      <div className="text-sm font-extrabold mt-1">Inclus avec la carte</div>
                      <div className="text-[11px] text-emerald-700 mt-1">Statut : Actif jusqu'au {currentProfile.expiryDate}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900">
                      <div className="font-bold">2. 6 mois suivants</div>
                      <div className="text-sm font-extrabold mt-1">99 MAD</div>
                      <div className="text-[11px] text-neutral-500 mt-1">Virement bancaire manuel</div>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900">
                      <div className="font-bold">3. Périodes annuelles</div>
                      <div className="text-sm font-extrabold mt-1">199 MAD / an</div>
                      <div className="text-[11px] text-neutral-500 mt-1">Continuité et mises à jour illimitées</div>
                    </div>
                  </div>
                </div>

                {/* Recent Leads Preview */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-black">
                      Derniers contacts reçus via le formulaire
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('leads')}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800"
                    >
                      Voir tous les prospects ({leads.length})
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {leads.slice(0, 3).map((lead) => (
                      <div key={lead.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <p className="font-bold text-black">{lead.name}</p>
                          <p className="text-slate-500">{lead.company || 'Particulier'} · {lead.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200"
                            title="Ouvrir WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
                            title="Appeler"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PROFILES & LIVE SIDE-BY-SIDE EDITOR */}
            {activeTab === 'profiles' && (
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-6">
                
                {/* Header & Mobile Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-black">
                      Éditeur de Profil Digital : {editorData.displayName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Modifications instantanées synchronisées avec votre carte NFC.
                    </p>
                  </div>

                  {/* Mobile Edit / Preview switch */}
                  <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setMobileEditorTab('edit')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg ${
                        mobileEditorTab === 'edit' ? 'bg-white shadow-xs text-black' : 'text-slate-600'
                      }`}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileEditorTab('preview')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg ${
                        mobileEditorTab === 'preview' ? 'bg-white shadow-xs text-black' : 'text-slate-600'
                      }`}
                    >
                      Aperçu Live
                    </button>
                  </div>
                </div>

                {profileSavedToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Modifications enregistrées avec succès !</span>
                  </div>
                )}

                {/* Side-by-side Desktop layout: Form Left (7 cols), Phone Preview Right (5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Form */}
                  <form
                    onSubmit={handleSaveProfileChanges}
                    className={`lg:col-span-7 space-y-5 text-xs ${
                      mobileEditorTab === 'preview' ? 'hidden lg:block' : 'block'
                    }`}
                  >
                    {/* Template Chooser */}
                    <div className="space-y-2">
                      <label className="font-bold text-slate-900 block">Modèle graphique</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['executive', 'creative', 'artisan'] as const).map((tId) => (
                          <button
                            key={tId}
                            type="button"
                            onClick={() => setEditorData({ ...editorData, templateId: tId })}
                            className={`p-2.5 rounded-xl border text-center font-bold capitalize ${
                              editorData.templateId === tId
                                ? 'border-amber-400 bg-amber-50 text-black'
                                : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            {tId}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Nom affiché</label>
                        <input
                          type="text"
                          value={editorData.displayName}
                          onChange={(e) => setEditorData({ ...editorData, displayName: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Titre / Poste</label>
                        <input
                          type="text"
                          value={editorData.jobTitle}
                          onChange={(e) => setEditorData({ ...editorData, jobTitle: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Entreprise</label>
                        <input
                          type="text"
                          value={editorData.company}
                          onChange={(e) => setEditorData({ ...editorData, company: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Ville au Maroc</label>
                        <input
                          type="text"
                          value={editorData.city}
                          onChange={(e) => setEditorData({ ...editorData, city: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Bio / Présentation</label>
                      <textarea
                        rows={3}
                        value={editorData.bio}
                        onChange={(e) => setEditorData({ ...editorData, bio: e.target.value })}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                      />
                    </div>

                    {/* Contacts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Téléphone cellulaire</label>
                        <input
                          type="text"
                          value={editorData.phone}
                          onChange={(e) => setEditorData({ ...editorData, phone: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs dir-ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">WhatsApp</label>
                        <input
                          type="text"
                          value={editorData.whatsapp}
                          onChange={(e) => setEditorData({ ...editorData, whatsapp: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs dir-ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Email professionnel</label>
                        <input
                          type="email"
                          value={editorData.email}
                          onChange={(e) => setEditorData({ ...editorData, email: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Site Web</label>
                        <input
                          type="url"
                          value={editorData.website}
                          onChange={(e) => setEditorData({ ...editorData, website: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs dir-ltr"
                        />
                      </div>
                    </div>

                    {/* Digital Branding Notice */}
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
                      <strong>Marquage digital TAGTOP :</strong> La suppression de la mention TAGTOP dans le pied de page du profil digital est une option d'abonnement avancée distincte de la suppression physique sur la carte. Actuellement non configurée au lancement.
                    </div>

                    <button
                      type="submit"
                      className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold px-6 py-3 rounded-xl shadow-xs transition-all"
                    >
                      {t.common.save}
                    </button>
                  </form>

                  {/* Right Live Phone Simulator */}
                  <div
                    className={`lg:col-span-5 bg-neutral-900 p-4 rounded-[36px] shadow-2xl border-4 border-neutral-800 ${
                      mobileEditorTab === 'edit' ? 'hidden lg:block' : 'block'
                    }`}
                  >
                    <div className="w-16 h-1 bg-neutral-700 rounded-full mx-auto mb-3" />
                    <div className="overflow-y-auto max-h-[580px] rounded-[24px]">
                      <PublicProfileView
                        profile={editorData}
                        currentLanguage={currentLanguage}
                        onLeadSubmitted={() => {}}
                      />
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: CARDS & ORDERS & PROOF REVIEW */}
            {activeTab === 'cards-orders' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-black">Mes Cartes & Commandes</h3>
                      <p className="text-xs text-slate-500">
                        Suivi de production, validation des maquettes (BAT) et encodage.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onOrderNewCard}
                      className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold text-xs px-3.5 py-2 rounded-xl"
                    >
                      Nouvelle commande
                    </button>
                  </div>

                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-4"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="font-mono font-bold text-black text-sm">{ord.id}</span>
                            <span className="text-xs text-slate-500 ml-2">
                              · Carte PVC {ord.cardColor === 'black' ? 'Noire' : 'Blanche'} ({ord.cardBranding === 'branded' ? 'Avec logo TAGTOP' : 'Sans logo TAGTOP'})
                            </span>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 uppercase">
                            {ord.orderStatus.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Progress Status Bar */}
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-slate-500">
                          <div className={`p-2 rounded-lg ${ord.orderStatus !== 'received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                            1. Reçue
                          </div>
                          <div className={`p-2 rounded-lg ${['customer_approved', 'production', 'linked', 'shipped', 'delivered'].includes(ord.orderStatus) ? 'bg-emerald-100 text-emerald-800' : ord.orderStatus === 'artwork_review' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100'}`}>
                            2. Validation BAT
                          </div>
                          <div className={`p-2 rounded-lg ${['production', 'linked', 'shipped', 'delivered'].includes(ord.orderStatus) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>
                            3. Encodage & Fab
                          </div>
                          <div className={`p-2 rounded-lg ${ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>
                            4. Livrée (COD)
                          </div>
                        </div>

                        {/* Proof Approval Card (BAT) */}
                        {ord.orderStatus === 'artwork_review' && (
                          <div className="p-4 bg-white rounded-xl border border-amber-300 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                              <FileCheck className="w-4 h-4 text-amber-600" />
                              <span>Bon à Tirer (BAT) prêt pour validation</span>
                            </div>
                            <p className="text-xs text-slate-600">
                              Le visuel d'impression a été préparé par le fondateur. Veuillez valider la maquette ou formuler vos remarques.
                            </p>
                            
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => onApproveProof(ord.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs"
                              >
                                Approuver le bon à tirer (BAT)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = prompt('Indiquez vos remarques ou modifications souhaitées pour le fondateur :');
                                  if (reason) onRequestProofChange(ord.id, reason);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-lg"
                              >
                                Demander une modification
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-neutral-200">
                          <span>Profil lié : <strong>{ord.profileName}</strong></span>
                          <span>Règlement : <strong>{ord.priceMAD} MAD ({ord.paymentStatus === 'cod_collected' ? 'Payé à la livraison' : 'Dû à la livraison'})</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LEADS CRM (VOLUNTARY INQUIRIES) */}
            {activeTab === 'leads' && (
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-black">Prospects Volontaires Reçus</h3>
                    <p className="text-xs text-slate-500">
                      Coordonnées transmises par vos contacts via votre profil NFC.
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un contact..."
                    value={leadSearchQuery}
                    onChange={(e) => setLeadSearchQuery(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs w-full sm:w-64"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Nom & Entreprise</th>
                        <th className="py-2.5 px-3">Téléphone</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Opt-in Promo</th>
                        <th className="py-2.5 px-3 text-right rtl:text-left">Contacter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-neutral-50">
                          <td className="py-3 px-3">
                            <div className="font-bold text-black">{lead.name}</div>
                            <div className="text-[11px] text-slate-500">{lead.company || 'Particulier'}</div>
                            {lead.notes && (
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">
                                "{lead.notes}"
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono dir-ltr text-slate-800">{lead.phone}</td>
                          <td className="py-3 px-3 text-slate-600">{lead.email || '—'}</td>
                          <td className="py-3 px-3 text-slate-500">
                            {new Date(lead.submittedAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-3">
                            {lead.promotionalConsent ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                Oui (Consenti)
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Non</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right rtl:text-left">
                            <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                              <a
                                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg"
                                title="WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`tel:${lead.phone}`}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
                                title="Appeler"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-6">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Statistiques de consultation :</strong> Données de démonstration marocaines représentatives. Un événement « Enregistrer le contact » correspond au clic ou téléchargement du vCard, sans garantie d'enregistrement dans le carnet d'adresses de l'utilisateur.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">Taps & Visites Profil</p>
                    <p className="text-2xl font-black text-black tabular-nums mt-1">148</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">Clics WhatsApp</p>
                    <p className="text-2xl font-black text-emerald-600 tabular-nums mt-1">62</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">Téléchargements vCard</p>
                    <p className="text-2xl font-black text-black tabular-nums mt-1">45</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">Formulaires Soumis</p>
                    <p className="text-2xl font-black text-amber-600 tabular-nums mt-1">{leads.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SUBSCRIPTION & RENEWAL VIA WHATSAPP / BANK TRANSFER */}
            {activeTab === 'subscription' && (
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-black">Abonnement & Renouvellement Manuel</h3>
                  <p className="text-xs text-slate-500">
                    Au Maroc, les renouvellements TAGTOP se règlent par virement bancaire vérifié manuellement par le fondateur.
                  </p>
                </div>

                {renewalSubmitted && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Votre avis de virement a été transmis au fondateur pour vérification. Votre accès sera prolongé dès validation.
                    </span>
                  </div>
                )}

                {/* Bank Account Details */}
                <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-3">
                  <p className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                    Coordonnées Bancaires Officielles TAGTOP
                  </p>
                  <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {settings.bankAccountDetails}
                  </pre>
                </div>

                {/* Claim Transfer Form */}
                <form onSubmit={handleClaimTransfer} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4 text-xs">
                  <h4 className="font-bold text-black text-sm">
                    Déclarer un virement bancaire effectué
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Période à renouveler
                      </label>
                      <select
                        value={renewalPeriod}
                        onChange={(e) => setRenewalPeriod(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                      >
                        <option value="6months">Étape 2 : 6 mois supplémentaires (99 MAD)</option>
                        <option value="annual">Étape 3 : 1 an renouvellement (199 MAD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Référence de virement ou numéro de reçu CIH / AWB
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: CIH-VIR-20261026-9042"
                        value={renewalReceipt}
                        onChange={(e) => setRenewalReceipt(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-black font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-xs"
                    >
                      Transmettre pour vérification
                    </button>
                    <a
                      href={`https://wa.me/${settings.supportWhatsAppNumber.replace(/\D/g, '')}?text=Bonjour%20TAGTOP,%20je%20viens%20d'effectuer%20un%20virement%20de%20renouvellement.`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Confirmer sur WhatsApp</span>
                    </a>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 7: SETTINGS & PWA GUIDE */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-black">Paramètres & Application Web (PWA)</h3>
                  <p className="text-xs text-slate-500">
                    Configuration de votre compte et instructions d'installation de l'application web.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-black">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    <span>Installer TAGTOP sur votre écran d'accueil (PWA)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    L'application TAGTOP fonctionne comme une Progressive Web App (PWA) sans téléchargement sur l'App Store ou Google Play.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li><strong>Sur iPhone (Safari) :</strong> Appuyez sur l'icône de partage puis « Sur l'écran d'accueil ».</li>
                    <li><strong>Sur Android (Chrome) :</strong> Appuyez sur le menu (trois points) puis « Installer l'application ».</li>
                  </ul>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
