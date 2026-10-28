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
  initialProfiles,
  initialOrders,
  initialNfcRegistry,
  initialBankTransfers,
  initialSettings,
} from './data/mockData';
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
  recordAnalyticsEvent,
} from './services/storage';
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
import { translations } from './i18n/translations';

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
  const [activeProfileId, setActiveProfileId] = useState<string>('prof-casablanca');

  // Application data state with persistent storage hydration
  const [profiles, setProfiles] = useState<BusinessProfile[]>(() => getStoredProfiles(currentLanguage));
  const [orders, setOrders] = useState<NfcCardOrder[]>(() => getStoredOrders());
  const [leads, setLeads] = useState<LeadSubmission[]>(() => getStoredLeads());
  const [registry, setRegistry] = useState<NfcCardRegistryItem[]>(() => getStoredRegistry());
  const [transfers, setTransfers] = useState<BankTransferRenewal[]>(() => getStoredTransfers());
  const [settings, setSettings] = useState<SystemSettings>(() => getStoredSettings());

  // Reload profiles with language-aware merging when language changes without overwriting customer edits
  useEffect(() => {
    setProfiles(getStoredProfiles(currentLanguage));
  }, [currentLanguage]);

  // Quote modal state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteTier, setQuoteTier] = useState<PackageTier | null>(null);

  // Synchronize HTML dir and lang attributes for full RTL support
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  // Handle URL hash changes for deep linking, NFC card taps (#c/tag-xxx), and profile viewing (#p/handle)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;

      // 1. NFC Card direct tap resolution (#c/tag-casablanca-01 or #card/tag-xxx or #c/UID)
      if (hash.startsWith('c/') || hash.startsWith('card/')) {
        const tagUid = hash.replace(/^(c|card)\//, '');
        const currentReg = getStoredRegistry();
        const matched = currentReg.find(
          (item) => item.uid.toLowerCase() === tagUid.toLowerCase() || item.serialNumber.toLowerCase() === tagUid.toLowerCase()
        );
        if (matched && matched.linkedProfileId) {
          setActiveProfileId(matched.linkedProfileId);
          recordAnalyticsEvent(matched.linkedProfileId, 'tap');
          setCurrentView('public-profile');
          return;
        }
      }

      // 2. Direct public profile handle resolution (#p/handle or #p/id)
      if (hash.startsWith('p/')) {
        const handleOrId = hash.replace(/^p\//, '');
        const currentProfs = getStoredProfiles();
        const matched = currentProfs.find((p) => p.handle === handleOrId || p.id === handleOrId);
        if (matched) {
          setActiveProfileId(matched.id);
          recordAnalyticsEvent(matched.id, 'tap');
          setCurrentView('public-profile');
          return;
        }
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
  }, []);

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
  const handleOrderCreated = (newOrder: NfcCardOrder) => {
    const updatedOrders = addStoredOrder(newOrder);
    setOrders(updatedOrders);

    // If profile was in private preview, mark as order_pending
    setProfiles((prev) => {
      const next = prev.map((p) => {
        if (p.id === newOrder.profileId && p.accessState === 'private_preview') {
          return { ...p, accessState: 'order_pending' as const };
        }
        return p;
      });
      // Update in storage
      const target = next.find((p) => p.id === newOrder.profileId);
      if (target) updateStoredProfile(target);
      return next;
    });
  };

  const handleUpdateProfile = (updated: BusinessProfile) => {
    const nextProfiles = updateStoredProfile(updated);
    setProfiles(nextProfiles);
  };

  const handleApproveProof = (orderId: string) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId
          ? { ...o, proofApproved: true, orderStatus: 'customer_approved' as const }
          : o
      );
      saveOrders(next);
      return next;
    });
  };

  const handleRequestProofChange = (orderId: string, reason: string) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              proofApproved: false,
              proofRejectionReason: reason,
              orderStatus: 'artwork_review' as const,
            }
          : o
      );
      saveOrders(next);
      return next;
    });
    alert(translations[currentLanguage].app.proofModificationSentAlert);
  };

  const handleSubmitRenewalTransfer = (transfer: BankTransferRenewal) => {
    const updated = addStoredTransfer(transfer);
    setTransfers(updated);
  };

  const handleFounderApproveTransfer = (transferId: string, founderNotes: string) => {
    const targetTransfer = transfers.find((t) => t.id === transferId);
    if (!targetTransfer) return;

    const nextTransfers = transfers.map((t) =>
      t.id === transferId
        ? { ...t, status: 'approved' as const, founderNotes, verifiedAt: new Date().toISOString() }
        : t
    );
    setTransfers(nextTransfers);
    saveTransfers(nextTransfers);

    // Extend access date for the associated profile
    setProfiles((prev) => {
      const next = prev.map((p) => {
        if (p.id === targetTransfer.profileId) {
          const currentExpiry = new Date(p.expiryDate);
          const addDays = targetTransfer.amountMAD === 150 ? 180 : 365;
          currentExpiry.setDate(currentExpiry.getDate() + addDays);
          const updatedProfile = {
            ...p,
            accessState: 'active' as const,
            expiryDate: currentExpiry.toISOString().split('T')[0],
          };
          updateStoredProfile(updatedProfile);
          return updatedProfile;
        }
        return p;
      });
      return next;
    });
  };

  const handleFounderRejectTransfer = (transferId: string, reason: string) => {
    const next = transfers.map((t) =>
      t.id === transferId
        ? { ...t, status: 'rejected' as const, founderNotes: reason }
        : t
    );
    setTransfers(next);
    saveTransfers(next);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: any) => {
    const nextOrders = orders.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    setOrders(nextOrders);
    saveOrders(nextOrders);

    // If delivered and paid, unlock profile to active
    if (newStatus === 'delivered') {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setProfiles((prev) => {
          const next = prev.map((p) => {
            if (p.id === order.profileId) {
              const updated = {
                ...p,
                accessState: 'active' as const,
                linkedCardCount: (p.linkedCardCount || 0) + 1,
              };
              updateStoredProfile(updated);
              return updated;
            }
            return p;
          });
          return next;
        });
      }
    }
  };

  const handleUpdatePaymentStatus = (orderId: string, paymentStatus: any) => {
    const nextOrders = orders.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o));
    setOrders(nextOrders);
    saveOrders(nextOrders);
  };

  const handleUpdateProfileAccess = (profileId: string, newState: any) => {
    setProfiles((prev) => {
      const next = prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, accessState: newState };
          updateStoredProfile(updated);
          return updated;
        }
        return p;
      });
      return next;
    });
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleLeadSubmitted = (lead: LeadSubmission) => {
    const updated = addStoredLead(lead);
    setLeads(updated);
  };

  const openQuoteModalForTier = (tier: PackageTier) => {
    setQuoteTier(tier);
    setQuoteModalOpen(true);
  };

  const resolvedPublicProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || initialProfiles[0];

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
      />

      {/* VIEW 1: CUSTOMER DASHBOARD */}
      {currentView === 'customer-dashboard' && (
        <CustomerDashboard
          currentLanguage={currentLanguage}
          profiles={profiles}
          orders={orders}
          leads={leads}
          transfers={transfers}
          settings={settings}
          onUpdateProfile={handleUpdateProfile}
          onApproveProof={handleApproveProof}
          onRequestProofChange={handleRequestProofChange}
          onSubmitRenewalTransfer={handleSubmitRenewalTransfer}
          onViewChange={setCurrentView}
          onOrderNewCard={() => {
            setCurrentView('marketing');
            setCurrentSubPage('configurator');
          }}
        />
      )}

      {/* VIEW 2: FOUNDER / ADMIN DASHBOARD */}
      {currentView === 'founder-dashboard' && (
        <FounderDashboard
          currentLanguage={currentLanguage}
          profiles={profiles}
          orders={orders}
          registry={registry}
          transfers={transfers}
          settings={settings}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
          onApproveTransfer={handleFounderApproveTransfer}
          onRejectTransfer={handleFounderRejectTransfer}
          onUpdateProfileAccess={handleUpdateProfileAccess}
          onUpdateSettings={handleUpdateSettings}
          onViewChange={setCurrentView}
        />
      )}

      {/* VIEW 3: LIVE PUBLIC PROFILE PREVIEW */}
      {currentView === 'public-profile' && (
        <div className="py-8 bg-neutral-100 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('marketing')}
              className="text-xs font-bold text-slate-600 hover:text-black"
            >
              ← {translations[currentLanguage].app.backToSite}
            </button>
            <span className="text-xs font-mono text-slate-500">
              {translations[currentLanguage].app.livePreviewOf} {resolvedPublicProfile.displayName}
            </span>
          </div>
          <PublicProfileView
            profile={resolvedPublicProfile}
            currentLanguage={currentLanguage}
            onLeadSubmitted={handleLeadSubmitted}
          />
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
              demoProfiles={profiles}
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
