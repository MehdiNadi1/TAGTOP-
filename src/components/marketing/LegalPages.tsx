import React from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface LegalPagesProps {
  page: 'terms' | 'privacy';
  currentLanguage: Language;
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, currentLanguage, onBack }) => {
  const t = translations[currentLanguage];
  const isTerms = page === 'terms';

  return (
    <div className="py-16 bg-white min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-black mb-8"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180 shrink-0" />
          <span>{t.legal.backToSite}</span>
        </button>

        {/* Legal Review Disclaimer */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 mb-8 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>{t.legal.disclaimerTitle} </strong>
            <span>{t.legal.disclaimerText}</span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-black mb-6">
          {isTerms ? t.legal.termsTitle : t.legal.privacyTitle}
        </h1>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-5 leading-relaxed">
          {isTerms ? (
            <>
              <section>
                <h2 className="text-base font-bold text-black">{t.legal.termsS1Title}</h2>
                <p>{t.legal.termsS1Text}</p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">{t.legal.termsS2Title}</h2>
                <p>{t.legal.termsS2Text}</p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">{t.legal.termsS3Title}</h2>
                <p>{t.legal.termsS3Text}</p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">{t.legal.termsS4Title}</h2>
                <p>{t.legal.termsS4Text}</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-base font-bold text-black">{t.legal.privacyS1Title}</h2>
                <p>{t.legal.privacyS1Text}</p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">{t.legal.privacyS2Title}</h2>
                <p>{t.legal.privacyS2Text}</p>
              </section>

              <section>
                <h2 className="text-base font-bold text-black">{t.legal.privacyS3Title}</h2>
                <p>{t.legal.privacyS3Text}</p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
