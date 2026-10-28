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
  Eye,
  FileCheck,
  MessageSquare,
  Phone,
  Plus,
  Smartphone,
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
  settings,
  onUpdateProfile,
  onApproveProof,
  onRequestProofChange,
  onSubmitRenewalTransfer,
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
                {t.customerDashboard.ownerSpace}
              </span>
              <span className="text-xs text-slate-500">
                {t.customerDashboard.accountLabel} {currentProfile.ownerEmail}
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
                  {p.displayName} ({p.accessState === 'private_preview' ? t.common.privatePreview : p.accessState === 'grace_period' ? t.common.gracePeriod : p.accessState === 'expired_suspended' ? t.common.suspended : t.common.active})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onOrderNewCard}
              className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{t.customerDashboard.orderNewCard}</span>
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
                  {t.customerDashboard.graceBannerTitle} « {currentProfile.displayName} »
                </p>
                <p className="text-xs text-black/80">
                  {t.customerDashboard.graceBannerDesc} {currentProfile.graceDeadlineDate || '2026-11-04'}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('subscription')}
              className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl shadow-xs"
            >
              {t.customerDashboard.graceBannerAction}
            </button>
          </div>
        )}

        {currentProfile.accessState === 'private_preview' && (
          <div className="mb-6 p-4 rounded-2xl bg-neutral-900 text-white border border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-white">
                  {t.customerDashboard.previewBannerTitle}
                </p>
                <p className="text-xs text-neutral-400">
                  {t.customerDashboard.previewBannerDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOrderNewCard}
              className="px-4 py-2 bg-[#FFD700] text-black font-bold text-xs rounded-xl"
            >
              {t.customerDashboard.previewBannerAction}
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
                      <Icon className="w-4 h-4 shrink-0" />
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
                    <p className="text-xs text-slate-500 font-medium">{t.customerDashboard.profileStatus}</p>
                    <p className="text-lg font-extrabold text-black mt-1 capitalize flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>{currentProfile.accessState === 'active' ? t.common.active : currentProfile.accessState === 'private_preview' ? t.common.privatePreview : currentProfile.accessState === 'grace_period' ? t.common.gracePeriod : t.common.suspended}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t.customerDashboard.expiryLabel} {currentProfile.expiryDate}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-200">
                    <p className="text-xs text-slate-500 font-medium">{t.customerDashboard.anonymousViews}</p>
                    <p className="text-2xl font-extrabold text-black mt-1 tabular-nums">
                      148
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t.customerDashboard.tapsAndScans}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-200">
                    <p className="text-xs text-slate-500 font-medium">{t.customerDashboard.collectedLeads}</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">
                      {leads.length}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t.customerDashboard.formsSubmittedWithConsent}
                    </p>
                  </div>
                </div>

                {/* 3-Stage Timeline Card */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-4">
                  <h3 className="text-base font-bold text-black">
                    {t.customerDashboard.timelineTitle}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                      <div className="font-bold">{t.customerDashboard.stage1Title}</div>
                      <div className="text-sm font-extrabold mt-1">{t.customerDashboard.stage1Value}</div>
                      <div className="text-[11px] text-emerald-700 mt-1">{t.customerDashboard.stage1ActiveUntil} {currentProfile.expiryDate}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900">
                      <div className="font-bold">{t.customerDashboard.stage2Title}</div>
                      <div className="text-sm font-extrabold mt-1">{t.customerDashboard.stage2Value}</div>
                      <div className="text-[11px] text-neutral-500 mt-1">{t.customerDashboard.stage2Manual}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900">
                      <div className="font-bold">{t.customerDashboard.stage3Title}</div>
                      <div className="text-sm font-extrabold mt-1">{t.customerDashboard.stage3Value}</div>
                      <div className="text-[11px] text-neutral-500 mt-1">{t.customerDashboard.stage3Continuity}</div>
                    </div>
                  </div>
                </div>

                {/* Recent Leads Preview */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-black">
                      {t.customerDashboard.recentLeadsTitle}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('leads')}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800"
                    >
                      {t.customerDashboard.viewAllLeads} ({leads.length})
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {leads.slice(0, 3).map((lead) => (
                      <div key={lead.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <p className="font-bold text-black">{lead.name}</p>
                          <p className="text-slate-500">{lead.company || t.customerDashboard.individual} · {lead.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200"
                            title={t.customerDashboard.openWhatsApp}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
                            title={t.customerDashboard.call}
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
                      {t.customerDashboard.editorTitle} {editorData.displayName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t.customerDashboard.editorSubtitle}
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
                      {t.customerDashboard.editBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileEditorTab('preview')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg ${
                        mobileEditorTab === 'preview' ? 'bg-white shadow-xs text-black' : 'text-slate-600'
                      }`}
                    >
                      {t.customerDashboard.previewBtn}
                    </button>
                  </div>
                </div>

                {profileSavedToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.customerDashboard.savedToast}</span>
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
                      <label className="font-bold text-slate-900 block">{t.customerDashboard.templateLabel}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['executive', 'creative', 'artisan'] as const).map((tId) => (
                          <button
                            key={tId}
                            type="button"
                            onClick={() => setEditorData({ ...editorData, templateId: tId })}
                            className={`p-2.5 rounded-xl border text-center font-bold ${
                              editorData.templateId === tId
                                ? 'border-amber-400 bg-amber-50 text-black'
                                : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            {tId === 'executive'
                              ? t.common.templateExecutive
                              : tId === 'creative'
                              ? t.common.templateCreative
                              : t.common.templateArtisan}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">{t.customerDashboard.displayNameLabel}</label>
                        <input
                          type="text"
                          value={editorData.displayName}
                          onChange={(e) => setEditorData({ ...editorData, displayName: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">{t.customerDashboard.jobTitleLabel}</label>
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
                        <label className="block text-slate-700 font-semibold mb-1">{t.customerDashboard.companyLabel}</label>
                        <input
                          type="text"
                          value={editorData.company}
                          onChange={(e) => setEditorData({ ...editorData, company: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">{t.customerDashboard.cityLabel}</label>
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
                      <label className="block text-slate-700 font-semibold mb-1">{t.customerDashboard.bioLabel}</label>
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
                        <label className="block text-slate-700 font-semibold mb-1">{t.customerDashboard.phoneLabel}</label>
                        <input
                          type="text"
                          value={editorData.phone}
                          onChange={(e) => setEditorData({ ...editorData, phone: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs dir-ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">{t.customerDashboard.whatsappLabel}</label>
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
                        <label className="block text-slate-700 font-semibold mb-1">{t.customerDashboard.emailLabel}</label>
                        <input
                          type="email"
                          value={editorData.email}
                          onChange={(e) => setEditorData({ ...editorData, email: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">{t.customerDashboard.websiteLabel}</label>
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
                      <strong>{t.customerDashboard.brandingNoticeTitle}</strong> {t.customerDashboard.brandingNoticeDesc}
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
                      <h3 className="text-base font-bold text-black">{t.customerDashboard.myCardsOrdersTitle}</h3>
                      <p className="text-xs text-slate-500">
                        {t.customerDashboard.myCardsOrdersSubtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onOrderNewCard}
                      className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold text-xs px-3.5 py-2 rounded-xl"
                    >
                      {t.customerDashboard.newOrderBtn}
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
                            <span className="text-xs text-slate-500 ml-2 rtl:ml-0 rtl:mr-2">
                              · {t.configurator.summaryCardPVC} {ord.cardColor === 'black' ? t.configurator.matteBlack : t.configurator.matteWhite} ({ord.cardBranding === 'branded' ? t.configurator.brandedOption : t.configurator.unbrandedOption})
                            </span>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 uppercase">
                            {ord.orderStatus.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Progress Status Bar */}
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-slate-500">
                          <div className={`p-2 rounded-lg ${ord.orderStatus !== 'received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                            {t.customerDashboard.stepReceived}
                          </div>
                          <div className={`p-2 rounded-lg ${['customer_approved', 'production', 'linked', 'shipped', 'delivered'].includes(ord.orderStatus) ? 'bg-emerald-100 text-emerald-800' : ord.orderStatus === 'artwork_review' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100'}`}>
                            {t.customerDashboard.stepProofReview}
                          </div>
                          <div className={`p-2 rounded-lg ${['production', 'linked', 'shipped', 'delivered'].includes(ord.orderStatus) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>
                            {t.customerDashboard.stepEncodingFab}
                          </div>
                          <div className={`p-2 rounded-lg ${ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>
                            {t.customerDashboard.stepDelivered}
                          </div>
                        </div>

                        {/* Proof Approval Card (BAT) */}
                        {ord.orderStatus === 'artwork_review' && (
                          <div className="p-4 bg-white rounded-xl border border-amber-300 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                              <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{t.customerDashboard.proofReadyTitle}</span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {t.customerDashboard.proofReadyDesc}
                            </p>
                            
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => onApproveProof(ord.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs"
                              >
                                {t.customerDashboard.approveProofBtn}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = prompt(t.customerDashboard.proofRemarksPrompt);
                                  if (reason) onRequestProofChange(ord.id, reason);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-lg"
                              >
                                {t.customerDashboard.requestProofChangeBtn}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-neutral-200">
                          <span>{t.customerDashboard.linkedProfile} <strong>{ord.profileName}</strong></span>
                          <span>{t.customerDashboard.paymentLabel} <strong>{ord.priceMAD} {t.common.currency} ({ord.paymentStatus === 'cod_collected' ? t.customerDashboard.paidOnDelivery : t.customerDashboard.dueOnDelivery})</strong></span>
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
                    <h3 className="text-base font-bold text-black">{t.customerDashboard.leadsTitle}</h3>
                    <p className="text-xs text-slate-500">
                      {t.customerDashboard.leadsSubtitle}
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder={t.customerDashboard.searchPlaceholder}
                    value={leadSearchQuery}
                    onChange={(e) => setLeadSearchQuery(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs w-full sm:w-64"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">{t.customerDashboard.colName}</th>
                        <th className="py-2.5 px-3">{t.customerDashboard.colPhone}</th>
                        <th className="py-2.5 px-3">{t.customerDashboard.colEmail}</th>
                        <th className="py-2.5 px-3">{t.customerDashboard.colDate}</th>
                        <th className="py-2.5 px-3">{t.customerDashboard.colPromo}</th>
                        <th className="py-2.5 px-3 text-right rtl:text-left">{t.customerDashboard.colContact}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-neutral-50">
                          <td className="py-3 px-3">
                            <div className="font-bold text-black">{lead.name}</div>
                            <div className="text-[11px] text-slate-500">{lead.company || t.customerDashboard.individual}</div>
                            {lead.notes && (
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">
                                "{lead.notes}"
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono dir-ltr text-slate-800">{lead.phone}</td>
                          <td className="py-3 px-3 text-slate-600">{lead.email || '—'}</td>
                          <td className="py-3 px-3 text-slate-500">
                            {new Date(lead.submittedAt).toLocaleDateString(currentLanguage === 'ar' ? 'ar-MA' : currentLanguage === 'en' ? 'en-US' : 'fr-FR')}
                          </td>
                          <td className="py-3 px-3">
                            {lead.promotionalConsent ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                {t.customerDashboard.optInYes}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">{t.customerDashboard.optInNo}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right rtl:text-left">
                            <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                              <a
                                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg"
                                title={t.customerDashboard.openWhatsApp}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`tel:${lead.phone}`}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
                                title={t.customerDashboard.call}
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
                    <strong>{t.customerDashboard.analyticsNoteTitle} </strong>
                    <span>{t.customerDashboard.analyticsNoteDesc}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">{t.customerDashboard.metricTaps}</p>
                    <p className="text-2xl font-black text-black tabular-nums mt-1">148</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">{t.customerDashboard.metricWhatsApp}</p>
                    <p className="text-2xl font-black text-emerald-600 tabular-nums mt-1">62</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">{t.customerDashboard.metricVCard}</p>
                    <p className="text-2xl font-black text-black tabular-nums mt-1">45</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">{t.customerDashboard.metricForms}</p>
                    <p className="text-2xl font-black text-amber-600 tabular-nums mt-1">{leads.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SUBSCRIPTION & RENEWAL VIA WHATSAPP / BANK TRANSFER */}
            {activeTab === 'subscription' && (
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-black">{t.customerDashboard.subscriptionTitle}</h3>
                  <p className="text-xs text-slate-500">
                    {t.customerDashboard.subscriptionSubtitle}
                  </p>
                </div>

                {renewalSubmitted && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      {t.customerDashboard.renewalSubmittedToast}
                    </span>
                  </div>
                )}

                {/* Bank Account Details */}
                <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-3">
                  <p className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                    {t.customerDashboard.bankDetailsTitle}
                  </p>
                  <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {settings.bankAccountDetails}
                  </pre>
                </div>

                {/* Claim Transfer Form */}
                <form onSubmit={handleClaimTransfer} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4 text-xs">
                  <h4 className="font-bold text-black text-sm">
                    {t.customerDashboard.claimTransferTitle}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        {t.customerDashboard.renewalPeriodLabel}
                      </label>
                      <select
                        value={renewalPeriod}
                        onChange={(e) => setRenewalPeriod(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-black"
                      >
                        <option value="6months">{t.customerDashboard.option6Months}</option>
                        <option value="annual">{t.customerDashboard.optionAnnual}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        {t.customerDashboard.receiptRefLabel}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t.customerDashboard.receiptPlaceholder}
                        value={renewalReceipt}
                        onChange={(e) => setRenewalReceipt(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-black font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <button
                      type="submit"
                      className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-xs"
                    >
                      {t.customerDashboard.submitVerificationBtn}
                    </button>
                    <a
                      href={`https://wa.me/${settings.supportWhatsAppNumber.replace(/\D/g, '')}?text=Bonjour%20TAGTOP,%20je%20viens%20d'effectuer%20un%20virement%20de%20renouvellement.`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.customerDashboard.confirmWhatsAppBtn}</span>
                    </a>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 7: SETTINGS & PWA GUIDE */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-black">{t.customerDashboard.settingsTitle}</h3>
                  <p className="text-xs text-slate-500">
                    {t.customerDashboard.settingsSubtitle}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-black">
                    <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{t.customerDashboard.pwaTitle}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {t.customerDashboard.pwaDesc}
                  </p>
                  <ul className="list-disc pl-5 rtl:pl-0 rtl:pr-5 space-y-1 text-slate-600">
                    <li><strong>{t.customerDashboard.pwaIphone}</strong></li>
                    <li><strong>{t.customerDashboard.pwaAndroid}</strong></li>
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
