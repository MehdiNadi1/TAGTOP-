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
  getLocalizedProfiles,
  initialOrders,
  initialLeads,
  getLocalizedLeads,
  initialNfcRegistry,
  initialBankTransfers,
  initialSettings,
  getLocalizedSettings,
} from './data/mockData';
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

  // Application data state with reactive localization
  const [profiles, setProfiles] = useState<BusinessProfile[]>(() => getLocalizedProfiles(currentLanguage));
  const [orders, setOrders] = useState<NfcCardOrder[]>(initialOrders);
  const [leads, setLeads] = useState<LeadSubmission[]>(() => getLocalizedLeads(currentLanguage));
  const [registry, setRegistry] = useState<NfcCardRegistryItem[]>(initialNfcRegistry);
  const [transfers, setTransfers] = useState<BankTransferRenewal[]>(initialBankTransfers);
  const [settings, setSettings] = useState<SystemSettings>(() => getLocalizedSettings(currentLanguage));

  useEffect(() => {
    setProfiles(getLocalizedProfiles(currentLanguage));
    setSettings(getLocalizedSettings(currentLanguage));
    setLeads(getLocalizedLeads(currentLanguage));
  }, [currentLanguage]);

  // Quote modal state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteTier, setQuoteTier] = useState<PackageTier | null>(null);

  // Synchronize HTML dir and lang attributes for full RTL support
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  // Handle URL hash changes for deep linking and client-side routing on GitHub Pages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;

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
    setOrders((prev) => [newOrder, ...prev]);

    // If profile was in private preview, mark as order_pending
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === newOrder.profileId && p.accessState === 'private_preview') {
          return { ...p, accessState: 'order_pending' };
        }
        return p;
      })
    );
  };

  const handleUpdateProfile = (updated: BusinessProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleApproveProof = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, proofApproved: true, orderStatus: 'customer_approved' }
          : o
      )
    );
  };

  const handleRequestProofChange = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              proofApproved: false,
              proofRejectionReason: reason,
              orderStatus: 'artwork_review',
            }
          : o
      )
    );
    alert(translations[currentLanguage].app.proofModificationSentAlert);
  };

  const handleSubmitRenewalTransfer = (transfer: BankTransferRenewal) => {
    setTransfers((prev) => [transfer, ...prev]);
  };

  const handleFounderApproveTransfer = (transferId: string, founderNotes: string) => {
    const targetTransfer = transfers.find((t) => t.id === transferId);
    if (!targetTransfer) return;

    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: 'approved', founderNotes, verifiedAt: new Date().toISOString() }
          : t
      )
    );

    // Extend access date for the associated profile
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === targetTransfer.profileId) {
          const currentExpiry = new Date(p.expiryDate);
          const addDays = targetTransfer.amountMAD === 99 ? 180 : 365;
          currentExpiry.setDate(currentExpiry.getDate() + addDays);
          return {
            ...p,
            accessState: 'active',
            expiryDate: currentExpiry.toISOString().split('T')[0],
          };
        }
        return p;
      })
    );
  };

  const handleFounderRejectTransfer = (transferId: string, reason: string) => {
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: 'rejected', founderNotes: reason }
          : t
      )
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: any) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );

    // If delivered and paid, unlock profile to active
    if (newStatus === 'delivered') {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === order.profileId
              ? { ...p, accessState: 'active', linkedCardCount: (p.linkedCardCount || 0) + 1 }
              : p
          )
        );
      }
    }
  };

  const handleUpdatePaymentStatus = (orderId: string, paymentStatus: any) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o))
    );
  };

  const handleUpdateProfileAccess = (profileId: string, newState: any) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, accessState: newState } : p))
    );
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
          onUpdateSettings={setSettings}
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
              {translations[currentLanguage].app.livePreviewOf} {profiles[0].displayName}
            </span>
          </div>
          <PublicProfileView
            profile={profiles[0]}
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
