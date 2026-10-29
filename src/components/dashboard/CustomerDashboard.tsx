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
  LogOut,
  AlertCircle,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Image as ImageIcon,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { AuthUserProfile } from '../../services/backend/authService';
import { CreateProfileModal } from '../modals/CreateProfileModal';
import { dataAdapter } from '../../services/dataAdapter';
import { ProfileAnalyticsSummary } from '../../services/backend/profileService';
import { isValidExternalUrl, sanitizeExternalUrl } from '../../utils/pricingAndAccess';
import { ProductsServicesEditor } from './ProductsServicesEditor';
import { ArtworkProofViewer } from './ArtworkProofViewer';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.67 6.34 6.34 0 0 0 9.33 22a6.34 6.34 0 0 0 6.34-6.33V9.17a8.16 8.16 0 0 0 4.8-1.54l-.88-.94Z" />
  </svg>
);

interface CustomerDashboardProps {
  currentLanguage: Language;
  profiles: BusinessProfile[];
  orders: NfcCardOrder[];
  leads: LeadSubmission[];
  transfers: BankTransferRenewal[];
  settings: SystemSettings;
  currentUser?: AuthUserProfile | null;
  onUpdateProfile: (updated: BusinessProfile) => Promise<void> | void;
  onProfileCreated?: (created: BusinessProfile) => void;
  onApproveProof: (orderId: string) => void;
  onRequestProofChange: (orderId: string, reason: string) => void;
  onSubmitRenewalTransfer: (transfer: BankTransferRenewal) => Promise<BankTransferRenewal>;
  onViewChange: (view: AppView) => void;
  onOrderNewCard: () => void;
  onSignOut?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentLanguage,
  profiles,
  orders,
  leads,
  transfers = [],
  settings,
  currentUser,
  onUpdateProfile,
  onProfileCreated,
  onApproveProof,
  onRequestProofChange,
  onSubmitRenewalTransfer,
  onOrderNewCard,
  onSignOut,
}) => {
  const t = translations[currentLanguage];

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'received': return t.customerDashboard.orderStatusReceived;
      case 'artwork_review': return t.customerDashboard.orderStatusArtworkReview;
      case 'customer_approved': return t.customerDashboard.orderStatusCustomerApproved;
      case 'production': return t.customerDashboard.orderStatusProduction;
      case 'linked': return t.customerDashboard.orderStatusLinked;
      case 'shipped': return t.customerDashboard.orderStatusShipped;
      case 'delivered': return t.customerDashboard.orderStatusDelivered;
      default: return status.replace('_', ' ');
    }
  };
  const [activeTab, setActiveTab] = useState<CustomerTab>('overview');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    profiles[0]?.id || ''
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Sync selectedProfileId if profiles change
  React.useEffect(() => {
    if (profiles.length > 0) {
      if (!selectedProfileId || !profiles.some((p) => p.id === selectedProfileId)) {
        setSelectedProfileId(profiles[0].id);
      }
    }
  }, [profiles, selectedProfileId]);

  // Profile Editor state
  const currentProfile: BusinessProfile | undefined =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];
  const [editorData, setEditorData] = useState<BusinessProfile | null>(currentProfile || null);
  const [mobileEditorTab, setMobileEditorTab] = useState<'edit' | 'preview'>('edit');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Renewal form state
  const [renewalReceipt, setRenewalReceipt] = useState('');
  const [renewalPeriod, setRenewalPeriod] = useState<'6months' | 'annual'>('6months');
  const [renewalSubmitted, setRenewalSubmitted] = useState(false);
  const [isSubmittingRenewal, setIsSubmittingRenewal] = useState(false);
  const [renewalError, setRenewalError] = useState<string | null>(null);
  const [persistedRenewal, setPersistedRenewal] = useState<BankTransferRenewal | null>(null);

  // Leads search
  const [leadSearchQuery, setLeadSearchQuery] = useState('');

  // Analytics state
  const [profileAnalytics, setProfileAnalytics] = useState<ProfileAnalyticsSummary | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    if (!selectedProfileId) {
      setProfileAnalytics(null);
      return;
    }
    setIsAnalyticsLoading(true);
    setAnalyticsError(null);
    dataAdapter.getProfileAnalytics(selectedProfileId)
      .then((data) => {
        if (isMounted) {
          setProfileAnalytics(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[TAGTOP] Error loading analytics:', err);
          setAnalyticsError(err?.message || 'Error loading analytics');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAnalyticsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProfileId]);

  // Sync editor when profile changes
  React.useEffect(() => {
    if (currentProfile) {
      setEditorData(currentProfile);
    }
  }, [currentProfile?.id]);

  const handleSaveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorData) return;

    if (editorData.avatarUrl && !isValidExternalUrl(editorData.avatarUrl)) {
      setSaveErrorMessage(t.customerDashboard.urlInvalidError);
      return;
    }
    if (editorData.logoUrl && !isValidExternalUrl(editorData.logoUrl)) {
      setSaveErrorMessage(t.customerDashboard.urlInvalidError);
      return;
    }
    if (editorData.website && !isValidExternalUrl(editorData.website)) {
      setSaveErrorMessage(t.customerDashboard.urlInvalidError);
      return;
    }

    const socials = editorData.socials || {};
    const socialKeys: (keyof typeof socials)[] = ['linkedin', 'instagram', 'facebook', 'tiktok', 'twitter', 'youtube'];
    for (const key of socialKeys) {
      const val = socials[key];
      if (val && !isValidExternalUrl(val)) {
        setSaveErrorMessage(t.customerDashboard.urlInvalidError);
        return;
      }
    }

    const cleanedProfile: BusinessProfile = {
      ...editorData,
      avatarUrl: sanitizeExternalUrl(editorData.avatarUrl),
      logoUrl: sanitizeExternalUrl(editorData.logoUrl),
      website: sanitizeExternalUrl(editorData.website),
      socials: {
        linkedin: sanitizeExternalUrl(socials.linkedin),
        instagram: sanitizeExternalUrl(socials.instagram),
        facebook: sanitizeExternalUrl(socials.facebook),
        tiktok: sanitizeExternalUrl(socials.tiktok),
        twitter: sanitizeExternalUrl(socials.twitter),
        youtube: sanitizeExternalUrl(socials.youtube),
      },
    };

    setIsSavingProfile(true);
    setSaveErrorMessage(null);
    try {
      await onUpdateProfile(cleanedProfile);
      setEditorData(cleanedProfile);
      setProfileSavedToast(true);
      setTimeout(() => setProfileSavedToast(false), 2500);
    } catch (err: any) {
      console.warn('[TAGTOP] Profile save error:', err);
      setSaveErrorMessage(err?.message || 'Error saving profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileCreated = (newProfile: BusinessProfile) => {
    setSelectedProfileId(newProfile.id);
    if (onProfileCreated) {
      onProfileCreated(newProfile);
    }
  };

  const handleClaimTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRenewal) return;
    if (!renewalReceipt.trim() || !currentProfile) return;

    setRenewalError(null);
    setIsSubmittingRenewal(true);

    const renewalAmount = renewalPeriod === '6months' ? (settings?.renewalSixMonthsMAD || 150) : (settings?.renewalAnnualMAD || 200);
    const periodDesc =
      renewalPeriod === '6months'
        ? t.customerDashboard.renewal6MonthsLabel
        : t.customerDashboard.renewalAnnualLabel;

    const newTransfer: BankTransferRenewal = {
      id: '',
      profileId: currentProfile.id,
      profileName: currentProfile.displayName,
      customerName: currentProfile.ownerName || currentUser?.fullName || 'Client TAGTOP',
      customerPhone: currentProfile.phone || currentUser?.phone || '',
      amountMAD: renewalAmount,
      periodDescription: periodDesc,
      receiptNumber: renewalReceipt.trim(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      const saved = await onSubmitRenewalTransfer(newTransfer);
      setPersistedRenewal(saved || newTransfer);
      setRenewalSubmitted(true);
      setRenewalReceipt('');
    } catch (err: any) {
      console.error('[TAGTOP CustomerDashboard] Renewal claim error:', err);
      const msg = err?.message || (
        currentLanguage === 'ar'
          ? 'حدث خطأ أثناء تسجيل طلب التجديد. يرجى المحاولة مرة أخرى.'
          : currentLanguage === 'en'
          ? 'Failed to submit renewal transfer. Please try again.'
          : 'Échec de l\'enregistrement du virement. Veuillez réessayer.'
      );
      setRenewalError(msg);
    } finally {
      setIsSubmittingRenewal(false);
    }
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
                {t.customerDashboard.accountLabel} {currentUser?.email || currentProfile?.ownerEmail || 'client@tagtop.ma'}
              </span>
              {currentUser?.role && (
                <span className="text-[10px] font-mono uppercase bg-neutral-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {currentUser.role === 'founder_admin' ? t.common.founderAdmin : t.common.clientArea}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-black mt-1">
              {t.dashboard.customerTitle}
            </h1>
          </div>

          {/* Quick Profile Switcher & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {profiles.length > 0 && (
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
            )}

            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="bg-neutral-900 hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{t.auth.createNewProfileBtn}</span>
            </button>

            <button
              type="button"
              onClick={onOrderNewCard}
              className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>{t.customerDashboard.orderNewCard}</span>
            </button>

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="bg-neutral-100 hover:bg-neutral-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title={t.auth.signOutBtn}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>{t.auth.signOutBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal for creating a new profile */}
        <CreateProfileModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          currentLanguage={currentLanguage}
          onProfileCreated={handleProfileCreated}
        />

        {/* EMPTY STATE: Customer has zero profiles */}
        {profiles.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-16 border border-neutral-200 shadow-xs text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
              <UserCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              {t.auth.noProfilesTitle}
            </h2>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              {t.auth.noProfilesSubtitle}
            </p>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold text-xs px-6 py-3 rounded-xl shadow-xs transition-transform active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.auth.createFirstProfileBtn}</span>
            </button>
          </div>
        ) : !currentProfile ? null : (
          <>
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
                  className="px-4 py-2 bg-[#FFD700] text-black font-bold text-xs rounded-xl cursor-pointer"
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
                      {isAnalyticsLoading ? '...' : (profileAnalytics?.taps ?? 0)}
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

                {saveErrorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{saveErrorMessage}</span>
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

                    {/* Media / Photos & Logos */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
                            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t.customerDashboard.avatarUrlLabel}</span>
                          </label>
                          <input
                            type="url"
                            placeholder={t.customerDashboard.avatarUrlPlaceholder}
                            value={editorData.avatarUrl || ''}
                            onChange={(e) => setEditorData({ ...editorData, avatarUrl: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs dir-ltr"
                          />
                          {editorData.avatarUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <img
                                src={editorData.avatarUrl}
                                alt="Avatar preview"
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                              />
                              <span className="text-[10px] text-slate-400">Aperçu photo</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t.customerDashboard.logoUrlLabel}</span>
                          </label>
                          <input
                            type="url"
                            placeholder={t.customerDashboard.logoUrlPlaceholder}
                            value={editorData.logoUrl || ''}
                            onChange={(e) => setEditorData({ ...editorData, logoUrl: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs dir-ltr"
                          />
                          {editorData.logoUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <img
                                src={editorData.logoUrl}
                                alt="Logo preview"
                                className="w-8 h-8 rounded-lg object-contain bg-slate-50 p-0.5 border border-slate-200"
                                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                              />
                              <span className="text-[10px] text-slate-400">Aperçu logo</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Social Media & Links */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{t.customerDashboard.socialLinksTitle}</h4>
                        <p className="text-[11px] text-slate-500">{t.customerDashboard.socialLinksSubtitle}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="flex items-center gap-1 text-slate-700 font-semibold mb-1 text-[11px]">
                            <Linkedin className="w-3 h-3 text-[#0A66C2]" />
                            <span>{t.customerDashboard.socialLinkedin}</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/..."
                            value={editorData.socials?.linkedin || ''}
                            onChange={(e) => setEditorData({
                              ...editorData,
                              socials: { ...(editorData.socials || {}), linkedin: e.target.value }
                            })}
                            className="w-full border border-slate-300 rounded-xl p-2 text-xs dir-ltr"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-slate-700 font-semibold mb-1 text-[11px]">
                            <Instagram className="w-3 h-3 text-[#E4405F]" />
                            <span>{t.customerDashboard.socialInstagram}</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://instagram.com/..."
                            value={editorData.socials?.instagram || ''}
                            onChange={(e) => setEditorData({
                              ...editorData,
                              socials: { ...(editorData.socials || {}), instagram: e.target.value }
                            })}
                            className="w-full border border-slate-300 rounded-xl p-2 text-xs dir-ltr"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-slate-700 font-semibold mb-1 text-[11px]">
                            <Facebook className="w-3 h-3 text-[#1877F2]" />
                            <span>{t.customerDashboard.socialFacebook}</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://facebook.com/..."
                            value={editorData.socials?.facebook || ''}
                            onChange={(e) => setEditorData({
                              ...editorData,
                              socials: { ...(editorData.socials || {}), facebook: e.target.value }
                            })}
                            className="w-full border border-slate-300 rounded-xl p-2 text-xs dir-ltr"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-slate-700 font-semibold mb-1 text-[11px]">
                            <TikTokIcon className="w-3 h-3 text-black" />
                            <span>{t.customerDashboard.socialTiktok}</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://tiktok.com/@..."
                            value={editorData.socials?.tiktok || ''}
                            onChange={(e) => setEditorData({
                              ...editorData,
                              socials: { ...(editorData.socials || {}), tiktok: e.target.value }
                            })}
                            className="w-full border border-slate-300 rounded-xl p-2 text-xs dir-ltr"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-slate-700 font-semibold mb-1 text-[11px]">
                            <Twitter className="w-3 h-3 text-slate-800" />
                            <span>{t.customerDashboard.socialTwitter}</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://x.com/..."
                            value={editorData.socials?.twitter || ''}
                            onChange={(e) => setEditorData({
                              ...editorData,
                              socials: { ...(editorData.socials || {}), twitter: e.target.value }
                            })}
                            className="w-full border border-slate-300 rounded-xl p-2 text-xs dir-ltr"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-slate-700 font-semibold mb-1 text-[11px]">
                            <Youtube className="w-3 h-3 text-[#FF0000]" />
                            <span>{t.customerDashboard.socialYoutube}</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://youtube.com/@..."
                            value={editorData.socials?.youtube || ''}
                            onChange={(e) => setEditorData({
                              ...editorData,
                              socials: { ...(editorData.socials || {}), youtube: e.target.value }
                            })}
                            className="w-full border border-slate-300 rounded-xl p-2 text-xs dir-ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Products & Services Catalog Editor */}
                    <ProductsServicesEditor
                      products={editorData.products || []}
                      currentLanguage={currentLanguage}
                      disabled={isSavingProfile}
                      onChange={(updatedProducts) => {
                        setEditorData({
                          ...editorData,
                          products: updatedProducts,
                        });
                      }}
                    />

                    {/* Digital Branding Notice */}
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
                      <strong>{t.customerDashboard.brandingNoticeTitle}</strong> {t.customerDashboard.brandingNoticeDesc}
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="bg-[#FFD700] hover:bg-[#FACC15] disabled:opacity-60 text-black font-extrabold px-6 py-3 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>{t.common.loading}</span>
                        </>
                      ) : (
                        <span>{t.common.save}</span>
                      )}
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
                            {getOrderStatusLabel(ord.orderStatus)}
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
                          <ArtworkProofViewer
                            order={ord}
                            currentLanguage={currentLanguage}
                            onApproveProof={onApproveProof}
                            onRequestProofChange={onRequestProofChange}
                          />
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

                {isAnalyticsLoading && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                    <span>{t.customerDashboard.analyticsLoading}</span>
                  </div>
                )}

                {analyticsError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{analyticsError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">{t.customerDashboard.metricTaps}</p>
                    <p className="text-2xl font-black text-black tabular-nums mt-1">
                      {isAnalyticsLoading ? '...' : (profileAnalytics?.taps ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">{t.customerDashboard.metricWhatsApp}</p>
                    <p className="text-2xl font-black text-emerald-600 tabular-nums mt-1">
                      {isAnalyticsLoading ? '...' : (profileAnalytics?.whatsappClicks ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">{t.customerDashboard.metricVCard}</p>
                    <p className="text-2xl font-black text-black tabular-nums mt-1">
                      {isAnalyticsLoading ? '...' : (profileAnalytics?.vcardDownloads ?? 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-xs text-slate-500">{t.customerDashboard.metricForms}</p>
                    <p className="text-2xl font-black text-amber-600 tabular-nums mt-1">{leads.length}</p>
                  </div>
                </div>

                {!isAnalyticsLoading &&
                  !analyticsError &&
                  (profileAnalytics?.taps ?? 0) === 0 &&
                  (profileAnalytics?.whatsappClicks ?? 0) === 0 &&
                  (profileAnalytics?.vcardDownloads ?? 0) === 0 &&
                  leads.length === 0 && (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      {t.customerDashboard.analyticsEmpty}
                    </div>
                  )}
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

                {renewalSubmitted && persistedRenewal && (
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{t.customerDashboard.renewalSubmittedToast}</span>
                    </div>
                    <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/70 space-y-2 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">ID Déclaration :</span>
                        <span className="font-mono font-bold text-black">{persistedRenewal.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Montant déclaré :</span>
                        <span className="font-bold text-black">{persistedRenewal.amountMAD} {t.common.currency} ({persistedRenewal.periodDescription})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Référence virement :</span>
                        <span className="font-mono font-semibold text-black">{persistedRenewal.receiptNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Statut :</span>
                        <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md text-[11px]">
                          {t.customerDashboard.pendingManualVerification}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {currentLanguage === 'ar'
                        ? 'ملاحظة: تسجيل رقم الوصل لا يعتبر تأكيداً لاستلام الأموال. سيتم تفعيل التمديد فور مطابقة التحويل مع الكشف البنكي من قبل المؤسس.'
                        : currentLanguage === 'en'
                        ? 'Note: Entering a receipt reference does not constitute proof of payment received. The renewal extension is activated once the founder reconciles with the bank statement.'
                        : 'Note : La saisie d\'une référence de reçu ne constitue pas une preuve de paiement reçu. Le renouvellement est activé après vérification effective du relevé bancaire par le fondateur.'}
                    </p>
                  </div>
                )}

                {renewalError && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 font-semibold flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{renewalError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRenewalError(null)}
                      className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
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
                        disabled={isSubmittingRenewal}
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
                        disabled={isSubmittingRenewal}
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
                      disabled={isSubmittingRenewal}
                      className={`font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 ${
                        isSubmittingRenewal
                          ? 'bg-amber-300 text-neutral-600 cursor-not-allowed opacity-75'
                          : 'bg-[#FFD700] hover:bg-[#FACC15] text-black cursor-pointer'
                      }`}
                    >
                      {isSubmittingRenewal ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{currentLanguage === 'ar' ? 'جاري التسجيل...' : currentLanguage === 'en' ? 'Submitting...' : 'Enregistrement en cours...'}</span>
                        </>
                      ) : (
                        <span>{t.customerDashboard.submitVerificationBtn}</span>
                      )}
                    </button>
                    <a
                      href={`https://wa.me/${settings.supportWhatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                        currentLanguage === 'ar'
                          ? 'مرحباً TAGTOP، لقد قمت للتو بتحويل بنكي للتجديد.'
                          : currentLanguage === 'en'
                          ? 'Hello TAGTOP, I just made a renewal bank transfer.'
                          : "Bonjour TAGTOP, je viens d'effectuer un virement de renouvellement."
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.customerDashboard.confirmWhatsAppBtn}</span>
                    </a>
                  </div>
                </form>

                {/* Profile Renewal Transfers History */}
                {transfers.filter((t) => t.profileId === currentProfile?.id).length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h4 className="font-bold text-black text-xs uppercase tracking-wider">
                      {currentLanguage === 'ar' ? 'سجل تحويلات التجديد' : currentLanguage === 'en' ? 'Renewal Transfer History' : 'Historique des virements de renouvellement'}
                    </h4>
                    <div className="space-y-2">
                      {transfers
                        .filter((t) => t.profileId === currentProfile?.id)
                        .map((trn) => (
                          <div
                            key={trn.id}
                            className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex items-center justify-between flex-wrap gap-2"
                          >
                            <div>
                              <span className="font-mono font-bold text-black">{trn.receiptNumber}</span>
                              <span className="text-slate-500 ml-2">
                                ({trn.amountMAD} {t.common.currency} — {trn.periodDescription})
                              </span>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {trn.id} · {new Date(trn.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                trn.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : trn.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {trn.status === 'approved'
                                ? currentLanguage === 'ar'
                                  ? 'تم التأكيد والتمديد'
                                  : currentLanguage === 'en'
                                  ? 'Approved & Extended'
                                  : 'Validé & Prolongé'
                                : trn.status === 'rejected'
                                ? currentLanguage === 'ar'
                                  ? 'مرفوض'
                                  : currentLanguage === 'en'
                                  ? 'Rejected'
                                  : 'Rejeté'
                                : t.customerDashboard.pendingManualVerification}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
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
        </>
        )}

      </div>
    </div>
  );
};
