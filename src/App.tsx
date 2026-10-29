/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Language,
  AppView,
  MarketingSubPage,
  BusinessProfile,
  NfcCardOrder,
  LeadSubmission,
  NfcCardRegistryItem,
  BankTransferRenewal,
  SystemSettings,
  PackageTier,
} from './types';
import {
  getStoredProfiles,
  updateStoredProfile,
  getStoredOrders,
  addStoredOrder,
  saveOrders,
  getStoredLeads,
  addStoredLead,
  getStoredRegistry,
  saveRegistry,
  getStoredTransfers,
  addStoredTransfer,
  saveTransfers,
  getStoredSettings,
  saveSettings,
} from './services/storage';
import { dataAdapter } from './services/dataAdapter';
import { authService, AuthUserProfile } from './services/backend/authService';
import { isSupabaseConfigured } from './services/supabase/client';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroInteractive } from './components/marketing/HeroInteractive';
import { HowItWorksSection } from './components/marketing/HowItWorksSection';
import { FeaturesSection } from './components/marketing/FeaturesSection';
import { CardsShowcaseSection } from './components/marketing/CardsShowcaseSection';
import { PricingSection } from './components/marketing/PricingSection';
import { FaqSection } from './components/marketing/FaqSection';
import { AboutSection } from './components/marketing/AboutSection';
import { CardConfigurator } from './components/configurator/CardConfigurator';
import { ProfileDemoPage } from './components/marketing/ProfileDemoPage';
import { LegalPages } from './components/marketing/LegalPages';
import { PublicProfileView } from './components/profile/PublicProfileView';
import { CustomerDashboard } from './components/dashboard/CustomerDashboard';
import { FounderDashboard } from './components/dashboard/FounderDashboard';
import { ContactQuoteModal } from './components/modals/ContactQuoteModal';
import { CustomerAuth } from './components/auth/CustomerAuth';
import { translations } from './i18n/translations';
import { TAGTOP_LOGO_URL } from './utils/assets';
import { AlertTriangle, Shield } from 'lucide-react';

export default function App() {
  // Global presentation language (persisted in localStorage, default initial: 'fr')
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tagtop_lang') : null;
    if (saved === 'ar' || saved === 'en' || saved === 'fr') return saved as Language;
    return 'fr';
  });

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem('tagtop_lang', lang);
    } catch {}
  };

  // Active platform view: marketing website, customer portal, founder console, or public live profile
  const [currentView, setCurrentView] = useState<AppView>('marketing');
  const [currentSubPage, setCurrentSubPage] = useState<MarketingSubPage>('home');

  // Authentication and Session State
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => isSupabaseConfigured());
  const [isCustomerDataLoading, setIsCustomerDataLoading] = useState<boolean>(false);

  // Application data state with persistent storage hydration
  const [profiles, setProfiles] = useState<BusinessProfile[]>(() =>
    isSupabaseConfigured() ? [] : getStoredProfiles(currentLanguage)
  );
  const [orders, setOrders] = useState<NfcCardOrder[]>(() =>
    isSupabaseConfigured() ? [] : getStoredOrders()
  );
  const [leads, setLeads] = useState<LeadSubmission[]>(() =>
    isSupabaseConfigured() ? [] : getStoredLeads()
  );
  const [registry, setRegistry] = useState<NfcCardRegistryItem[]>(() => getStoredRegistry());
  const [transfers, setTransfers] = useState<BankTransferRenewal[]>(() => getStoredTransfers());
  const [settings, setSettings] = useState<SystemSettings>(() => getStoredSettings());

  // Founder Administration state
  const [isFounderVerifying, setIsFounderVerifying] = useState<boolean>(false);
  const [isVerifiedFounderAdmin, setIsVerifiedFounderAdmin] = useState<boolean>(false);
  const [isFounderDataLoading, setIsFounderDataLoading] = useState<boolean>(false);
  const [_founderDataError, setFounderDataError] = useState<string | null>(null);
  const [founderProfiles, setFounderProfiles] = useState<BusinessProfile[]>([]);
  const [founderOrders, setFounderOrders] = useState<NfcCardOrder[]>([]);
  const [founderRegistry, setFounderRegistry] = useState<NfcCardRegistryItem[]>([]);
  const [founderTransfers, setFounderTransfers] = useState<BankTransferRenewal[]>([]);
  const [founderSettings, setFounderSettings] = useState<SystemSettings>(() => getStoredSettings());

  // Public Profile Asynchronous Resolution
  const [loadedPublicProfile, setLoadedPublicProfile] = useState<BusinessProfile | null>(null);
  const [isPublicProfileLoading, setIsPublicProfileLoading] = useState<boolean>(false);

  // Quote modal state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteTier, setQuoteTier] = useState<PackageTier | null>(null);

  // Synchronize HTML dir and lang attributes for full RTL support
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  // Load customer profiles, orders, and leads when user is authenticated
  const loadCustomerData = async (userId: string, email: string) => {
    setIsCustomerDataLoading(true);
    try {
      const [userProfiles, userOrders] = await Promise.all([
        dataAdapter.getCustomerProfiles(userId, currentLanguage),
        dataAdapter.getCustomerOrders(userId, email),
      ]);
      setProfiles(userProfiles);
      setOrders(userOrders);

      if (userProfiles.length > 0) {
        const userLeads = await dataAdapter.getProfileLeads(userProfiles[0].id);
        setLeads(userLeads);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.warn('[TAGTOP App] Error loading customer data:', err);
    } finally {
      setIsCustomerDataLoading(false);
    }
  };

  // Load full platform administrative data for verified founder admin
  const loadFounderData = async () => {
    setIsFounderDataLoading(true);
    setFounderDataError(null);
    try {
      const data = await dataAdapter.getFounderData();
      setFounderProfiles(data.profiles);
      setFounderOrders(data.orders);
      setFounderRegistry(data.registry);
      setFounderTransfers(data.transfers);
      setFounderSettings(data.settings);
    } catch (err: any) {
      console.error('[TAGTOP App] Error loading founder data:', err);
      setFounderDataError(err.message || 'Failed to load administrative data');
    } finally {
      setIsFounderDataLoading(false);
    }
  };

  // Founder Admin Permission Verification & Data Loading
  useEffect(() => {
    if (currentView !== 'founder-dashboard') return;

    if (!isSupabaseConfigured()) {
      setIsVerifiedFounderAdmin(false);
      return;
    }

    if (!currentUser) {
      setIsVerifiedFounderAdmin(false);
      return;
    }

    if (currentUser.role !== 'founder_admin') {
      setIsVerifiedFounderAdmin(false);
      return;
    }

    let isMounted = true;
    setIsFounderVerifying(true);
    dataAdapter.isFounderAdmin().then((isAllowed) => {
      if (!isMounted) return;
      setIsVerifiedFounderAdmin(isAllowed);
      if (isAllowed) {
        loadFounderData();
      }
    }).catch(() => {
      if (!isMounted) return;
      setIsVerifiedFounderAdmin(false);
    }).finally(() => {
      if (isMounted) setIsFounderVerifying(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentView, currentUser]);

  // Supabase Authentication Lifecycle & Persistent Session Recovery
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsAuthLoading(false);
      setProfiles(getStoredProfiles(currentLanguage));
      return;
    }

    let isMounted = true;

    // 1. Initial persistent session check
    authService.getCurrentUser().then(async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      if (user) {
        await loadCustomerData(user.id, user.email);
      }
      setIsAuthLoading(false);
    }).catch((err) => {
      console.warn('[TAGTOP App] Initial auth error:', err);
      if (isMounted) setIsAuthLoading(false);
    });

    // 2. Real-time auth state listener (sign in, sign out, token refresh)
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      if (user) {
        await loadCustomerData(user.id, user.email);
      } else {
        if (isSupabaseConfigured()) {
          setProfiles([]);
          setOrders([]);
          setLeads([]);
        }
      }
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentLanguage]);

  // Handle URL hash changes for deep linking, NFC card taps (#c/tag-xxx), and profile viewing (#p/handle)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;

      // 1. NFC Card direct tap resolution (#c/tag-casablanca-01 or #card/tag-xxx or #c/UID)
      if (hash.startsWith('c/') || hash.startsWith('card/')) {
        const tagUid = hash.replace(/^(c|card)\//, '');
        setIsPublicProfileLoading(true);
        setLoadedPublicProfile(null);
        setCurrentView('public-profile');
        dataAdapter.resolveNfcTap(tagUid).then(async (linkedId) => {
          if (linkedId) {
            const pub = await dataAdapter.getPublicProfile(linkedId, currentLanguage);
            setLoadedPublicProfile(pub);
            if (pub) dataAdapter.recordProfileEvent(pub.id, 'tap');
          } else {
            setLoadedPublicProfile(null);
          }
          setIsPublicProfileLoading(false);
        }).catch(() => {
          setLoadedPublicProfile(null);
          setIsPublicProfileLoading(false);
        });
        return;
      }

      // 2. Direct public profile handle resolution (#p/handle or #p/id)
      if (hash.startsWith('p/')) {
        const handleOrId = hash.replace(/^p\//, '');
        setIsPublicProfileLoading(true);
        setLoadedPublicProfile(null);
        setCurrentView('public-profile');
        dataAdapter.getPublicProfile(handleOrId, currentLanguage).then((pub) => {
          setLoadedPublicProfile(pub);
          if (pub) {
            dataAdapter.recordProfileEvent(pub.id, 'tap');
          }
          setIsPublicProfileLoading(false);
        }).catch(() => {
          setLoadedPublicProfile(null);
          setIsPublicProfileLoading(false);
        });
        return;
      }

      if (hash === 'customer-dashboard' || hash === 'founder-dashboard' || hash === 'public-profile') {
        setCurrentView(hash as AppView);
      } else if (['configurator', 'demo', 'terms', 'privacy', 'home'].includes(hash)) {
        setCurrentView('marketing');
        setCurrentSubPage(hash as MarketingSubPage);
      } else if (['how-it-works', 'cards', 'pricing', 'about', 'faq'].includes(hash)) {
        setCurrentView('marketing');
        setCurrentSubPage(hash as MarketingSubPage);
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentLanguage]);

  // Smooth scroll to anchor sections when subpage changes
  useEffect(() => {
    if (currentView === 'marketing' && ['how-it-works', 'cards', 'pricing', 'about', 'faq'].includes(currentSubPage)) {
      const el = document.getElementById(currentSubPage);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [currentSubPage, currentView]);

  // Order Handlers
  const handleOrderCreated = async (newOrder: NfcCardOrder) => {
    try {
      const savedOrder = await dataAdapter.createOrder(newOrder, currentUser?.id);
      setOrders((prev) => [savedOrder, ...prev]);

      // If profile was in private preview, mark as order_pending
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id === newOrder.profileId && p.accessState === 'private_preview') {
            return { ...p, accessState: 'order_pending' as const };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('[TAGTOP App] Order creation failed:', err);
    }
  };

  const handleUpdateProfile = async (updated: BusinessProfile) => {
    try {
      const saved = await dataAdapter.updateProfile(updated);
      setProfiles((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    } catch (err) {
      console.error('[TAGTOP App] Profile update failed:', err);
      throw err;
    }
  };

  const handleProfileCreated = (newProfile: BusinessProfile) => {
    setProfiles((prev) => [newProfile, ...prev]);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.warn('[TAGTOP App] Sign out error:', err);
    }
    setCurrentUser(null);
    setIsVerifiedFounderAdmin(false);
    setFounderProfiles([]);
    setFounderOrders([]);
    setFounderRegistry([]);
    setFounderTransfers([]);
    if (isSupabaseConfigured()) {
      setProfiles([]);
      setOrders([]);
      setLeads([]);
    }
    setCurrentView('marketing');
  };

  const handleApproveProof = (orderId: string) => {
    dataAdapter.approveProof(orderId).then(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, proofApproved: true, orderStatus: 'customer_approved' as const }
            : o
        )
      );
    }).catch(console.error);
  };

  const handleRequestProofChange = (orderId: string, reason: string) => {
    dataAdapter.requestProofChange(orderId, reason).then(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                proofApproved: false,
                proofRejectionReason: reason,
                orderStatus: 'artwork_review' as const,
              }
            : o
        )
      );
      alert(translations[currentLanguage].app.proofModificationSentAlert);
    }).catch(console.error);
  };

  const handleSubmitRenewalTransfer = (transfer: BankTransferRenewal) => {
    const updated = addStoredTransfer(transfer);
    setTransfers(updated);
  };

  const handleFounderApproveTransfer = async (transferId: string, founderNotes: string) => {
    const result = await dataAdapter.founderApproveTransfer(transferId, founderNotes);
    setFounderTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: 'approved' as const, founderNotes, verifiedAt: new Date().toISOString() }
          : t
      )
    );
    if (result.newExpiryDate) {
      const target = founderTransfers.find((t) => t.id === transferId);
      if (target) {
        setFounderProfiles((prev) =>
          prev.map((p) =>
            p.id === target.profileId
              ? { ...p, accessState: 'active' as const, expiryDate: result.newExpiryDate! }
              : p
          )
        );
      }
    }
  };

  const handleFounderRejectTransfer = async (transferId: string, reason: string) => {
    await dataAdapter.founderRejectTransfer(transferId, reason);
    setFounderTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: 'rejected' as const, founderNotes: reason, verifiedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    await dataAdapter.founderUpdateOrderStatus(orderId, newStatus);
    setFounderOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    if (newStatus === 'delivered') {
      const ord = founderOrders.find((o) => o.id === orderId);
      if (ord && ord.profileId) {
        setFounderProfiles((prev) =>
          prev.map((p) =>
            p.id === ord.profileId
              ? {
                  ...p,
                  accessState: 'active' as const,
                  linkedCardCount: (p.linkedCardCount || 0) + ord.cardQuantity,
                }
              : p
          )
        );
      }
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: any) => {
    const ord = founderOrders.find((o) => o.id === orderId);
    await dataAdapter.founderUpdateOrderStatus(orderId, ord?.orderStatus || 'received', paymentStatus);
    setFounderOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o))
    );
  };

  const handleUpdateProfileAccess = async (profileId: string, newState: any) => {
    await dataAdapter.founderUpdateProfileAccess(profileId, newState);
    setFounderProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, accessState: newState } : p))
    );
  };

  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    await dataAdapter.founderUpdateSettings(newSettings);
    setFounderSettings(newSettings);
  };

  const handleLeadSubmitted = (lead: LeadSubmission) => {
    setLeads((prev) => [lead, ...prev]);
  };

  const openQuoteModalForTier = (tier: PackageTier) => {
    setQuoteTier(tier);
    setQuoteModalOpen(true);
  };


  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-amber-300 selection:text-black">
      
      {/* Universal Top Header with Brand Logo and View Switching */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        currentView={currentView}
        onViewChange={setCurrentView}
        currentSubPage={currentSubPage}
        onNavigateSubPage={setCurrentSubPage}
        currentUser={currentUser}
      />

      {/* VIEW 1: CUSTOMER DASHBOARD (PROTECTED ROUTE) */}
      {currentView === 'customer-dashboard' && (
        <>
          {isAuthLoading ? (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl text-center max-w-sm w-full animate-fadeIn">
                <div className="w-28 h-8 mx-auto mb-4 flex items-center justify-center">
                  <img src={TAGTOP_LOGO_URL} alt="TAGTOP" className="h-6 object-contain" />
                </div>
                <div className="w-7 h-7 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-700">{translations[currentLanguage].auth.sessionLoading}</p>
              </div>
            </div>
          ) : isSupabaseConfigured() && !currentUser ? (
            <div className="min-h-screen bg-neutral-100 py-8 px-4 flex items-center justify-center">
              <CustomerAuth
                currentLanguage={currentLanguage}
                onSuccess={() => {
                  // onAuthStateChange handles user state hydration
                }}
                onCancel={() => setCurrentView('marketing')}
              />
            </div>
          ) : (
            <CustomerDashboard
              currentLanguage={currentLanguage}
              profiles={profiles}
              orders={orders}
              leads={leads}
              transfers={transfers}
              settings={settings}
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onProfileCreated={handleProfileCreated}
              onApproveProof={handleApproveProof}
              onRequestProofChange={handleRequestProofChange}
              onSubmitRenewalTransfer={handleSubmitRenewalTransfer}
              onViewChange={setCurrentView}
              onOrderNewCard={() => {
                setCurrentView('marketing');
                setCurrentSubPage('configurator');
              }}
              onSignOut={handleSignOut}
            />
          )}
        </>
      )}

      {/* VIEW 2: FOUNDER / ADMIN DASHBOARD (RESTRICTED TO FOUNDER_ADMIN) */}
      {currentView === 'founder-dashboard' && (
        <>
          {isAuthLoading || isFounderVerifying ? (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
              <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-xl text-center max-w-sm w-full animate-fadeIn">
                <div className="w-12 h-12 bg-amber-400/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div className="w-7 h-7 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-neutral-300">
                  {translations[currentLanguage].founderDashboard.verifyingPermissions}
                </p>
              </div>
            </div>
          ) : !currentUser ? (
            <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center py-12 px-4">
              <div className="max-w-md w-full bg-neutral-900 rounded-3xl p-8 border border-neutral-800 shadow-2xl space-y-6 text-center">
                <div className="w-14 h-14 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl mx-auto flex items-center justify-center shadow-md">
                  <Shield className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl font-black text-white">
                    {translations[currentLanguage].founderDashboard.accessDeniedTitle}
                  </h1>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {translations[currentLanguage].founderDashboard.accessDeniedDesc}
                  </p>
                </div>
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setCurrentView('customer-dashboard')}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-black font-extrabold py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer"
                  >
                    {translations[currentLanguage].founderDashboard.loginAsFounderBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('marketing')}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    {translations[currentLanguage].founderDashboard.backToHomeBtn}
                  </button>
                </div>
              </div>
            </div>
          ) : !isVerifiedFounderAdmin ? (
            <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center py-12 px-4">
              <div className="max-w-md w-full bg-neutral-900 rounded-3xl p-8 border border-red-900/40 shadow-2xl space-y-6 text-center">
                <div className="w-14 h-14 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-2xl mx-auto flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase bg-red-950 text-red-400 border border-red-800 px-2.5 py-0.5 rounded font-bold">
                    role: {currentUser.role} (unauthorized)
                  </span>
                  <h1 className="text-xl font-black text-white">
                    {translations[currentLanguage].founderDashboard.accessDeniedTitle}
                  </h1>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {translations[currentLanguage].founderDashboard.accessDeniedCustomerRole}
                  </p>
                </div>
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setCurrentView('customer-dashboard')}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-black font-extrabold py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer"
                  >
                    {translations[currentLanguage].founderDashboard.backToClientAreaBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('marketing')}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    {translations[currentLanguage].founderDashboard.backToHomeBtn}
                  </button>
                </div>
              </div>
            </div>
          ) : isFounderDataLoading ? (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
              <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-xl text-center max-w-sm w-full animate-fadeIn">
                <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-neutral-300">
                  {translations[currentLanguage].founderDashboard.loadingAdministrativeData}
                </p>
              </div>
            </div>
          ) : (
            <FounderDashboard
              currentLanguage={currentLanguage}
              currentUser={currentUser}
              profiles={founderProfiles}
              orders={founderOrders}
              registry={founderRegistry}
              transfers={founderTransfers}
              settings={founderSettings}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onApproveTransfer={handleFounderApproveTransfer}
              onRejectTransfer={handleFounderRejectTransfer}
              onUpdateProfileAccess={handleUpdateProfileAccess}
              onUpdateSettings={handleUpdateSettings}
              onViewChange={setCurrentView}
              onSignOut={handleSignOut}
            />
          )}
        </>
      )}

      {/* VIEW 3: LIVE PUBLIC PROFILE PREVIEW */}
      {currentView === 'public-profile' && (
        <div className="py-8 bg-neutral-100 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('marketing')}
              className="text-xs font-bold text-slate-600 hover:text-black flex items-center gap-1 cursor-pointer"
            >
              <span>←</span>
              <span>{translations[currentLanguage].app.backToSite}</span>
            </button>
            {loadedPublicProfile && (
              <span className="text-xs font-mono text-slate-500">
                {translations[currentLanguage].app.livePreviewOf} {loadedPublicProfile.displayName}
              </span>
            )}
          </div>

          {isPublicProfileLoading ? (
            <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl text-center">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">{translations[currentLanguage].app.profileLoading}</p>
            </div>
          ) : loadedPublicProfile ? (
            <PublicProfileView
              profile={loadedPublicProfile}
              currentLanguage={currentLanguage}
              onLeadSubmitted={handleLeadSubmitted}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{translations[currentLanguage].app.profileNotFound}</h3>
              <p className="text-xs text-slate-500 mb-5">{translations[currentLanguage].app.profilePrivateOrNotFound}</p>
              <button
                type="button"
                onClick={() => setCurrentView('marketing')}
                className="bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
              >
                {translations[currentLanguage].app.backToHome}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: PUBLIC MARKETING WEBSITE WITH SEPARATE DESTINATIONS */}
      {currentView === 'marketing' && (
        <>
          {currentSubPage === 'configurator' && (
            <CardConfigurator
              currentLanguage={currentLanguage}
              userProfiles={profiles}
              onOrderCreated={handleOrderCreated}
              onNavigateToDashboard={() => setCurrentView('customer-dashboard')}
            />
          )}

          {currentSubPage === 'demo' && (
            <ProfileDemoPage
              currentLanguage={currentLanguage}
              demoProfiles={getStoredProfiles(currentLanguage)}
              onNavigate={setCurrentSubPage}
              onOrderCard={() => setCurrentSubPage('configurator')}
            />
          )}

          {(currentSubPage === 'terms' || currentSubPage === 'privacy') && (
            <LegalPages
              page={currentSubPage}
              currentLanguage={currentLanguage}
              onBack={() => setCurrentSubPage('home')}
            />
          )}

          {/* Standard Homepage & Content Sections */}
          {currentSubPage !== 'configurator' &&
            currentSubPage !== 'demo' &&
            currentSubPage !== 'terms' &&
            currentSubPage !== 'privacy' && (
              <main>
                <HeroInteractive
                  currentLanguage={currentLanguage}
                  onNavigate={setCurrentSubPage}
                  onViewChange={setCurrentView}
                />

                <HowItWorksSection currentLanguage={currentLanguage} />

                <FeaturesSection currentLanguage={currentLanguage} />

                <CardsShowcaseSection
                  currentLanguage={currentLanguage}
                  onNavigate={setCurrentSubPage}
                />

                <PricingSection
                  currentLanguage={currentLanguage}
                  onNavigate={setCurrentSubPage}
                  onOpenQuoteModal={openQuoteModalForTier}
                />

                <AboutSection currentLanguage={currentLanguage} />

                <FaqSection currentLanguage={currentLanguage} />
              </main>
            )}

          {/* Global Footer */}
          <Footer
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            onNavigateSubPage={setCurrentSubPage}
            onViewChange={setCurrentView}
          />
        </>
      )}

      {/* Quote Inquiry Modal (Pro / Enterprise) */}
      <ContactQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        tier={quoteTier}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
