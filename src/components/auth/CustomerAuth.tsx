import React, { useState } from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { authService } from '../../services/backend/authService';
import { TAGTOP_LOGO_URL } from '../../utils/assets';
import { Shield, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface CustomerAuthProps {
  currentLanguage: Language;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const CustomerAuth: React.FC<CustomerAuthProps> = ({
  currentLanguage,
  onSuccess,
  onCancel,
}) => {
  const t = translations[currentLanguage];
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage(t.auth.requiredFields);
      return;
    }

    setIsLoading(true);
    try {
      await authService.signIn(cleanEmail, password);
      setSuccessMessage(t.auth.loginSuccess);
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      console.warn('[TAGTOP Auth] Sign in failed:', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
        setErrorMessage(t.auth.invalidCredentials);
      } else if (msg.includes('email not confirmed')) {
        setErrorMessage(
          currentLanguage === 'ar'
            ? 'يرجى تأكيد بريدك الإلكتروني من خلال الرابط المرسل إلى صندوق الوارد الخاص بك.'
            : currentLanguage === 'en'
            ? 'Please confirm your email address before signing in.'
            : 'Veuillez confirmer votre adresse e-mail avant de vous connecter.'
        );
      } else {
        setErrorMessage(err?.message || t.auth.invalidCredentials);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail || !password || !cleanName || !cleanPhone) {
      setErrorMessage(t.auth.requiredFields);
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t.auth.passwordTooShort);
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.signUp(cleanEmail, password, cleanName, cleanPhone, currentLanguage);
      
      // If Supabase returned a session immediately, user is logged in
      if (data?.session) {
        setSuccessMessage(t.auth.loginSuccess);
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        // Confirmation email was sent
        setSuccessMessage(t.auth.signUpSuccess);
        setActiveTab('signin');
      }
    } catch (err: any) {
      console.warn('[TAGTOP Auth] Sign up failed:', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('rate limit')) {
        setErrorMessage(t.auth.rateLimitExceeded);
      } else if (msg.includes('already registered') || msg.includes('user already exists')) {
        setErrorMessage(
          currentLanguage === 'ar'
            ? 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.'
            : currentLanguage === 'en'
            ? 'An account with this email already exists. Please sign in.'
            : 'Un compte avec cet e-mail existe déjà. Veuillez vous connecter.'
        );
      } else if (msg.includes('invalid') && msg.includes('email')) {
        setErrorMessage(
          currentLanguage === 'ar'
            ? 'يرجى إدخال عنوان بريد إلكتروني صالح.'
            : currentLanguage === 'en'
            ? 'Please enter a valid email address.'
            : 'Veuillez saisir une adresse e-mail valide.'
        );
      } else {
        setErrorMessage(err?.message || t.auth.requiredFields);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 sm:my-16 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xl relative overflow-hidden">
        
        {/* Subtle Moroccan Gold Top Trim */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#FFD700] to-amber-500" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-32 h-10 mx-auto mb-3 flex items-center justify-center">
            <img src={TAGTOP_LOGO_URL} alt="TAGTOP" className="h-8 object-contain" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {activeTab === 'signin' ? t.auth.signInTitle : t.auth.signUpTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {activeTab === 'signin' ? t.auth.signInSubtitle : t.auth.signUpSubtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.auth.signInTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.auth.signUpTab}
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* SIGN IN FORM */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.ma"
                  dir="ltr"
                  className="w-full bg-neutral-50 border border-slate-200 rounded-xl py-2.5 px-3 pl-9 rtl:pl-3 rtl:pr-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t.auth.passwordLabel}
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full bg-neutral-50 border border-slate-200 rounded-xl py-2.5 px-3 pl-9 rtl:pl-3 rtl:pr-9 pr-9 rtl:pr-3 rtl:pl-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#FFD700] hover:bg-[#FACC15] disabled:opacity-60 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{t.auth.signingIn}</span>
                </>
              ) : (
                <>
                  <span>{t.auth.signInBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                }}
                className="text-xs text-slate-600 hover:text-black font-medium underline"
              >
                {t.auth.noAccountPrompt}
              </button>
            </div>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.auth.fullNameLabel}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Yassine Bennani"
                  className="w-full bg-neutral-50 border border-slate-200 rounded-xl py-2.5 px-3 pl-9 rtl:pl-3 rtl:pr-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.auth.phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212661001122"
                    dir="ltr"
                    className="w-full bg-neutral-50 border border-slate-200 rounded-xl py-2.5 px-3 pl-9 rtl:pl-3 rtl:pr-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.auth.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yassine@atelier.ma"
                    dir="ltr"
                    className="w-full bg-neutral-50 border border-slate-200 rounded-xl py-2.5 px-3 pl-9 rtl:pl-3 rtl:pr-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.auth.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full bg-neutral-50 border border-slate-200 rounded-xl py-2.5 px-3 pl-9 rtl:pl-3 rtl:pr-9 pr-9 rtl:pr-3 rtl:pl-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.auth.passwordTooShort}
              </p>
            </div>

            {/* Reassurance Badge */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2 text-[11px] text-slate-600">
              <Shield className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t.auth.privatePreviewBadge}</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#FFD700] hover:bg-[#FACC15] disabled:opacity-60 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{t.auth.signingUp}</span>
                </>
              ) : (
                <>
                  <span>{t.auth.signUpBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                }}
                className="text-xs text-slate-600 hover:text-black font-medium underline"
              >
                {t.auth.hasAccountPrompt}
              </button>
            </div>
          </form>
        )}

        {/* Back Link if onCancel provided */}
        {onCancel && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-black font-semibold"
            >
              {t.common.back}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
