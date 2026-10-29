import React, { useState } from 'react';
import { Language, BusinessProfile } from '../../types';
import { translations } from '../../i18n/translations';
import { dataAdapter } from '../../services/dataAdapter';
import { X, Sparkles, Globe, Briefcase, Phone, MessageSquare, Mail, Building, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onProfileCreated: (profile: BusinessProfile) => void;
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onProfileCreated,
}) => {
  const t = translations[currentLanguage];

  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [bio, setBio] = useState('');
  const [templateId, setTemplateId] = useState<'executive' | 'creative' | 'artisan'>('executive');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCleanSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanHandle = handleCleanSlug(handle);
    if (!cleanHandle) {
      setErrorMessage(t.auth.handleLabel + ': ' + t.auth.requiredFields);
      return;
    }

    if (!displayName.trim()) {
      setErrorMessage(t.customerDashboard.displayNameLabel + ': ' + t.auth.requiredFields);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await dataAdapter.createProfile({
        handle: cleanHandle,
        displayName: displayName.trim(),
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        city: city.trim(),
        bio: bio.trim(),
        templateId,
      });

      onProfileCreated(created);
      onClose();
    } catch (err: any) {
      console.warn('[TAGTOP] Create profile error:', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already exists')) {
        setErrorMessage(t.auth.handleAlreadyExists);
      } else {
        setErrorMessage(err?.message || 'Error creating profile');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-neutral-200 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-slate-400 hover:text-black p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label={t.common.close}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase mb-2">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{t.common.privatePreview}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {t.auth.createProfileModalTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.auth.createProfileModalSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Handle / Slug */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.handleLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(handleCleanSlug(e.target.value))}
                placeholder={t.auth.handlePlaceholder}
                dir="ltr"
                className="w-full bg-neutral-50 border border-slate-300 rounded-xl py-2.5 px-3 pl-9 rtl:pl-3 rtl:pr-9 text-xs text-black font-mono focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono" dir="ltr">
              {t.auth.handleHint}{handle || 'votre-nom'}
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.customerDashboard.displayNameLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex: Karim Bennani"
              className="w-full bg-neutral-50 border border-slate-300 rounded-xl p-2.5 text-xs text-black focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Job Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.customerDashboard.jobTitleLabel}
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex: Directeur Général"
                className="w-full bg-neutral-50 border border-slate-300 rounded-xl p-2.5 text-xs text-black focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.customerDashboard.companyLabel}
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: Atlas Conseil"
                className="w-full bg-neutral-50 border border-slate-300 rounded-xl p-2.5 text-xs text-black focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Phone & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.customerDashboard.phoneLabel}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212661000000"
                dir="ltr"
                className="w-full bg-neutral-50 border border-slate-300 rounded-xl p-2.5 text-xs text-black focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.customerDashboard.cityLabel}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Casablanca"
                className="w-full bg-neutral-50 border border-slate-300 rounded-xl p-2.5 text-xs text-black focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Template Style Chooser */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.customerDashboard.templateLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['executive', 'creative', 'artisan'] as const).map((tId) => (
                <button
                  key={tId}
                  type="button"
                  onClick={() => setTemplateId(tId)}
                  className={`p-2 rounded-xl border text-center font-bold text-xs ${
                    templateId === tId
                      ? 'border-amber-400 bg-amber-50 text-black'
                      : 'border-slate-200 text-slate-600 hover:bg-neutral-50'
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

          {/* Private Preview Reassurance Note */}
          <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 text-[11px] text-slate-600">
            {t.auth.profileCreatedPreviewNote}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-black font-semibold text-xs transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#FFD700] hover:bg-[#FACC15] disabled:opacity-60 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-transform active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{t.auth.creatingProfile}</span>
                </>
              ) : (
                <span>{t.auth.createFirstProfileBtn}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
