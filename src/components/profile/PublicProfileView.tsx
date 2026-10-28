import React, { useState, useEffect } from 'react';
import { BusinessProfile, Language, LeadSubmission } from '../../types';
import { translations } from '../../i18n/translations';
import { downloadVCard, normalizeWhatsAppNumber } from '../../utils/pricingAndAccess';
import { recordAnalyticsEvent } from '../../services/storage';
import { TAGTOP_LOGO_URL } from '../../utils/assets';
import {
  Phone,
  MessageSquare,
  Mail,
  Globe,
  MapPin,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileText,
  UserPlus,
} from 'lucide-react';

interface PublicProfileViewProps {
  profile: BusinessProfile;
  currentLanguage: Language;
  onLeadSubmitted: (lead: LeadSubmission) => void;
  overrideExpiredState?: boolean;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  profile,
  currentLanguage,
  onLeadSubmitted,
  overrideExpiredState = false,
}) => {
  const t = translations[currentLanguage];

  const [isDevMode, setIsDevMode] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDev = new URLSearchParams(window.location.search).has('dev') || localStorage.getItem('tagtop_dev') === 'true';
      setIsDevMode(isDev);
    }
  }, []);

  // Template styling
  const [activeTemplate, setActiveTemplate] = useState<'executive' | 'creative' | 'artisan'>(
    profile.templateId
  );
  const [isSimulatingExpired, setIsSimulatingExpired] = useState<boolean>(
    overrideExpiredState || profile.accessState === 'expired_suspended'
  );

  // Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [promoConsent, setPromoConsent] = useState(false);
  const [leadSubmittedSuccess, setLeadSubmittedSuccess] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  // Handle Save Contact (vCard RFC 6350 with UTF-8 support)
  const handleSaveContact = () => {
    downloadVCard(profile);
    recordAnalyticsEvent(profile.id, 'vcard');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.displayName,
        text: `${profile.displayName} - ${profile.company}`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  const handleWhatsAppClick = () => {
    recordAnalyticsEvent(profile.id, 'whatsapp');
  };

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) return;

    const digits = leadPhone.replace(/\D/g, '');
    if (digits.length < 8) {
      setPhoneError(
        currentLanguage === 'ar'
          ? 'يرجى إدخال رقم هاتف صالح (8 أرقام على الأقل)'
          : currentLanguage === 'en'
          ? 'Please enter a valid phone number (at least 8 digits)'
          : 'Veuillez saisir un numéro de téléphone valide (au moins 8 chiffres)'
      );
      return;
    }
    setPhoneError('');

    const newLead: LeadSubmission = {
      id: `lead-${Date.now()}`,
      profileId: profile.id,
      profileName: profile.company || profile.displayName,
      name: leadName.trim(),
      phone: leadPhone.trim(),
      email: leadEmail.trim(),
      company: leadCompany.trim(),
      notes: leadNotes.trim(),
      submittedAt: new Date().toISOString(),
      promotionalConsent: promoConsent,
    };

    onLeadSubmitted(newLead);
    setLeadSubmittedSuccess(true);
    setLeadName('');
    setLeadPhone('');
    setLeadEmail('');
    setLeadCompany('');
    setLeadNotes('');
    setPromoConsent(false);
  };

  // If Expired / Suspended: Show discreet unavailable screen without leaking owner private content or billing!
  if (isSimulatingExpired) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col justify-between py-12 px-4">

        {/* Prototype Bar to toggle back — Only visible in dev mode */}
        {isDevMode && (
          <div className="max-w-md mx-auto w-full mb-6 p-2 bg-neutral-900 text-white rounded-xl text-xs flex items-center justify-between">
            <span className="font-mono text-amber-400">{t.profile.expiredModeBadge}</span>
            <button
              type="button"
              onClick={() => setIsSimulatingExpired(false)}
              className="px-2.5 py-1 bg-amber-400 text-black font-semibold rounded"
            >
              {t.profile.viewActiveProfileBtn}
            </button>
          </div>
        )}

        <div className="max-w-md mx-auto w-full bg-white rounded-3xl p-8 border border-neutral-200 shadow-lg text-center space-y-6 my-auto">
          <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-2xl mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-neutral-900">
            {t.profile.expiredTitle}
          </h2>

          <p className="text-sm text-neutral-600 leading-relaxed">
            {t.profile.expiredMessage}
          </p>

          <div className="pt-4 border-t border-neutral-100 text-[11px] text-neutral-400">
            {t.profile.networkFooter}
          </div>
        </div>

        <div className="text-center text-xs text-neutral-400 mt-6">
          {t.profile.digitalFooter}
        </div>
      </div>
    );
  }

  // Template specific styling rules
  const templateConfig = {
    executive: {
      headerBg: 'bg-neutral-950 text-white',
      accentColor: 'bg-[#FFD700] text-black',
      secondaryBtn: 'bg-neutral-900 text-white hover:bg-neutral-800',
      badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
      cardRadius: 'rounded-2xl',
    },
    creative: {
      headerBg: 'bg-gradient-to-br from-teal-900 to-emerald-950 text-white',
      accentColor: 'bg-emerald-400 text-neutral-950',
      secondaryBtn: 'bg-teal-900 text-white hover:bg-teal-800',
      badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
      cardRadius: 'rounded-3xl',
    },
    artisan: {
      headerBg: 'bg-gradient-to-br from-amber-950 to-stone-900 text-amber-50',
      accentColor: 'bg-amber-500 text-white',
      secondaryBtn: 'bg-stone-800 text-white hover:bg-stone-700',
      badge: 'bg-amber-600/20 text-amber-300 border-amber-500/30',
      cardRadius: 'rounded-2xl',
    },
  }[activeTemplate];

  const normalizedWhatsAppDigits = normalizeWhatsAppNumber(profile.whatsapp);

  return (
    <div className="min-h-screen bg-neutral-100 py-6 px-3 sm:px-6">

      {/* Dev Mode Testing Bar — Only rendered when ?dev=true */}
      {isDevMode && (
        <div className="max-w-md mx-auto mb-4 bg-white rounded-2xl p-2.5 border border-neutral-200 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{t.profile.styleLabel}</span>
            {(['executive', 'creative', 'artisan'] as const).map((tmpl) => (
              <button
                key={tmpl}
                type="button"
                onClick={() => setActiveTemplate(tmpl)}
                className={`px-2 py-0.5 rounded ${
                  activeTemplate === tmpl
                    ? 'bg-neutral-900 text-white font-bold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {tmpl === 'executive'
                  ? t.common.templateExecutive
                  : tmpl === 'creative'
                  ? t.common.templateCreative
                  : t.common.templateArtisan}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsSimulatingExpired(true)}
            className="text-[11px] text-red-600 hover:text-red-800 font-semibold underline decoration-dotted"
          >
            {t.profile.testExpiredBtn}
          </button>
        </div>
      )}

      {/* If Profile in Grace Period, display clear warning while retaining active access */}
      {profile.accessState === 'grace_period' && (
        <div className="max-w-md mx-auto mb-4 p-3 bg-amber-500 text-black rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {t.profile.graceWarningText} {profile.graceDeadlineDate || '2026-11-04'}.
          </span>
        </div>
      )}

      {/* Mobile Frame Container (Target ~390px baseline) */}
      <div className="max-w-md mx-auto bg-white rounded-[32px] overflow-hidden shadow-2xl border border-neutral-200/90 flex flex-col">

        {/* Cover & Profile Header */}
        <div className={`p-6 pt-10 text-center relative ${templateConfig.headerBg}`}>

          {/* Avatar / Monogram */}
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-neutral-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg border-2 border-white/20">
              {profile.displayName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-0.5">
            {profile.displayName}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 font-medium">
            {profile.jobTitle}
          </p>
          <p className="text-xs text-amber-300 font-semibold mt-0.5">
            {profile.company}
          </p>

          {/* Location */}
          <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 mt-2">
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{profile.city}, {t.profile.morocco}</span>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs text-neutral-300/90 leading-relaxed mt-3 max-w-xs mx-auto">
              {profile.bio}
            </p>
          )}

          {/* Key Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              type="button"
              onClick={handleSaveContact}
              className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] ${templateConfig.accentColor}`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>{t.common.saveContactCTA}</span>
            </button>

            <a
              href={`https://wa.me/${normalizedWhatsAppDigits}`}
              target="_blank"
              rel="noreferrer"
              onClick={handleWhatsAppClick}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>{t.common.whatsappCTA}</span>
            </a>
          </div>

          {/* Secondary Action Icons (Call, Email, Share, Website) */}
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-white/10">
            <a
              href={`tel:${profile.phone}`}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title={t.profile.callAction}
            >
              <Phone className="w-4 h-4" />
            </a>

            <a
              href={`mailto:${profile.email}`}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title={t.profile.emailAction}
            >
              <Mail className="w-4 h-4" />
            </a>

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title={t.profile.websiteAction}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors relative"
              title={t.profile.shareAction}
            >
              <Share2 className="w-4 h-4" />
              {sharedToast && (
                <span className="absolute -top-7 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                  {t.profile.copiedToast}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Profile Content Body */}
        <div className="p-5 space-y-6 bg-white">

          {/* Services & Offerings Showcase */}
          {profile.products.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  {t.profile.productsTitle}
                </h3>
                <span className="text-[10px] text-neutral-500">{t.profile.indicativePrices}</span>
              </div>

              <div className="space-y-2.5">
                {profile.products.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">{item.name}</h4>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-neutral-950 whitespace-nowrap tabular-nums">
                        {item.priceMAD} {t.common.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Downloadable Documents */}
          {profile.documents.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                {t.profile.documentsTitle}
              </h3>
              {profile.documents.map((doc) => (
                <a
                  key={doc.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`${t.profile.simulatedDownload} ${doc.title}`);
                  }}
                  className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold text-neutral-900">{doc.title}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">{doc.size}</span>
                </a>
              ))}
            </div>
          )}

          {/* Voluntary Lead Capture Form */}
          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                {t.profile.leadFormTitle}
              </h3>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                {t.profile.leadFormSubtitle}
              </p>
            </div>

            {leadSubmittedSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1 text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600" />
                <p className="font-bold">{t.profile.leadSuccess}</p>
                <p className="text-[11px] text-emerald-700">{t.profile.leadSuccessDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-0.5">
                    {t.profile.nameField} *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder={t.profile.namePlaceholder}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-0.5">
                    {t.profile.phoneField} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => {
                      setLeadPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="+212 6..."
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs dir-ltr"
                  />
                  {phoneError && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">
                      {phoneError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-0.5">
                    {t.profile.emailField}
                  </label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder={t.profile.emailPlaceholder}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-0.5">
                    {t.profile.companyField}
                  </label>
                  <input
                    type="text"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder={t.profile.companyPlaceholder}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-0.5">
                    {t.profile.notesField}
                  </label>
                  <textarea
                    rows={2}
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    placeholder={t.profile.notesPlaceholder}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                {/* Explicit promotional consent separation (anti-spam / privacy compliant) */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-neutral-600 leading-snug">
                    <input
                      type="checkbox"
                      checked={promoConsent}
                      onChange={(e) => setPromoConsent(e.target.checked)}
                      className="mt-0.5 rounded border-neutral-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span>{t.profile.consentField}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold py-2.5 rounded-xl transition-all shadow-2xs mt-2"
                >
                  {t.profile.submitLead}
                </button>
              </form>
            )}
          </div>

          {/* Discreet Digital TAGTOP Branding Footer */}
          {profile.digitalTagtopBranding && (
            <div className="pt-4 border-t border-neutral-100 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-neutral-500 font-mono">{t.nfcCard.poweredBy}</span>
                <img
                  src={TAGTOP_LOGO_URL}
                  alt="TAGTOP"
                  className="h-3.5 w-auto object-contain"
                />
              </div>
              <p className="text-[9px] text-neutral-400">
                {t.profile.digitalFooterNetwork}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
