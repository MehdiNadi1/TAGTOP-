import React, { useState } from 'react';
import {
  Language,
  PackageTier,
  CardColor,
  CardBranding,
  BusinessProfile,
  NfcCardOrder,
} from '../../types';
import { translations } from '../../i18n/translations';
import { NfcCard3D } from '../cards/NfcCard3D';
import { calculateCardPrice } from '../../utils/pricingAndAccess';
import {
  CheckCircle2,
  Upload,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface CardConfiguratorProps {
  currentLanguage: Language;
  userProfiles: BusinessProfile[];
  onOrderCreated: (order: NfcCardOrder) => void;
  onNavigateToDashboard: () => void;
}

export const CardConfigurator: React.FC<CardConfiguratorProps> = ({
  currentLanguage,
  userProfiles,
  onOrderCreated,
  onNavigateToDashboard,
}) => {
  const t = translations[currentLanguage];

  // Configurator state
  const [, setCurrentStep] = useState<number>(1);
  const [packageTier, setPackageTier] = useState<PackageTier>('starter');
  const [cardColor, setCardColor] = useState<CardColor>('black');
  const [cardBranding, setCardBranding] = useState<CardBranding>('branded');
  const [logoFileName, setLogoFileName] = useState<string>('');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    userProfiles[0]?.id || ''
  );
  const [woodenStandRequested] = useState<boolean>(false);

  // Delivery Form
  const [customerName, setCustomerName] = useState<string>('Yassine Bennani');
  const [customerPhone, setCustomerPhone] = useState<string>('+212 6 61 24 88 90');
  const [customerEmail] = useState<string>('yassine.bennani@atlasdesign.ma');
  const [city, setCity] = useState<string>('Casablanca');
  const [address, setAddress] = useState<string>('Boulevard d’Anfa, Résidence Al Manar');

  const [orderSubmitted, setOrderSubmitted] = useState<boolean>(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string>('');

  // Calculate prices with strict business rules
  const pricing = calculateCardPrice(packageTier, cardBranding, woodenStandRequested, false, 0);

  const selectedProfile = userProfiles.find((p) => p.id === selectedProfileId) || userProfiles[0];

  const handleSimulateLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      const url = URL.createObjectURL(file);
      setLogoPreviewUrl(url);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrderId = `ord-tag-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: NfcCardOrder = {
      id: newOrderId,
      customerName,
      customerPhone,
      customerEmail,
      city,
      address,
      packageTier,
      cardColor,
      cardBranding,
      cardQuantity: 1,
      priceMAD: pricing.totalMAD,
      woodenStandSelected: woodenStandRequested,
      woodenStandPriceMAD: 0,
      profileId: selectedProfile?.id || 'prof-casablanca',
      profileName: selectedProfile?.displayName || t.common.liveProfile,
      logoFileName,
      logoPreviewUrl,
      orderStatus: 'artwork_review',
      paymentStatus: 'cod_pending',
      createdAt: new Date().toISOString(),
      proofApproved: false,
    };

    onOrderCreated(newOrder);
    setSubmittedOrderId(newOrderId);
    setOrderSubmitted(true);
  };

  if (orderSubmitted) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-extrabold text-black">
            {t.configurator.orderSuccessTitle}
          </h2>

          <p className="text-base text-slate-700 max-w-lg mx-auto leading-relaxed">
            {t.configurator.orderSuccessDesc}
          </p>

          <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 text-left rtl:text-right space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">{t.configurator.orderNumberLabel}</span>
              <span className="font-mono font-bold text-black">{submittedOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.configurator.amountDueLabel}</span>
              <span className="font-bold text-black">{pricing.totalMAD} {t.common.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.configurator.linkedProfileLabel}</span>
              <span className="font-semibold text-black">{selectedProfile?.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.configurator.deliveryAddressLabel}</span>
              <span>{city}, {address}</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left rtl:text-right flex items-start gap-2.5">
            <FileCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>{t.configurator.nextStepProofTitle} </strong>
              <span>
                {t.configurator.nextStepProofDesc} ({customerPhone})
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold px-8 py-3.5 rounded-xl transition-all shadow-xs"
            >
              {t.configurator.accessDashboardBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderSubmitted(false);
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              {t.configurator.configureAnotherBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-neutral-50 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Title & Step Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            {t.configurator.badge}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black">
            {t.configurator.title}
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            {t.configurator.subtitle}
          </p>
        </div>

        {/* 2-Column Layout: Left Controls, Right Persistent Live Card & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: GUIDED FORM STEPS (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xs space-y-8">
            
            {/* Step 1: Package Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-black block">
                {t.configurator.stepTier}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPackageTier('starter')}
                  className={`p-4 rounded-xl border text-left rtl:text-right transition-all ${
                    packageTier === 'starter'
                      ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-black text-sm">{t.configurator.starterPackage}</div>
                  <div className="text-xs text-amber-700 font-semibold mt-1">{t.configurator.fromPrice}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{t.configurator.sixMonthsIncluded}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPackageTier('pro')}
                  className={`p-4 rounded-xl border text-left rtl:text-right transition-all ${
                    packageTier === 'pro'
                      ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-black text-sm">{t.configurator.proPackage}</div>
                  <div className="text-xs text-slate-700 font-semibold mt-1">{t.configurator.onQuote}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{t.configurator.smallTeams}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPackageTier('enterprise')}
                  className={`p-4 rounded-xl border text-left rtl:text-right transition-all ${
                    packageTier === 'enterprise'
                      ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-black text-sm">{t.configurator.enterprisePackage}</div>
                  <div className="text-xs text-slate-700 font-semibold mt-1">{t.configurator.onQuote}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{t.configurator.volumeOrders}</div>
                </button>
              </div>
            </div>

            {/* Step 2 & 3: Color and Branding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              
              {/* Color */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-black block">
                  {t.configurator.stepColor}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCardColor('black')}
                    className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      cardColor === 'black'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-black border border-white/40" />
                    <span>{t.configurator.matteBlack}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardColor('white')}
                    className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      cardColor === 'white'
                        ? 'border-amber-400 bg-white text-black ring-2 ring-amber-400/30'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-400" />
                    <span>{t.configurator.matteWhite}</span>
                  </button>
                </div>
              </div>

              {/* Branding */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-black block">
                  {t.configurator.stepBranding}
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setCardBranding('branded')}
                    className={`p-2.5 rounded-xl border text-left rtl:text-right text-xs transition-all ${
                      cardBranding === 'branded'
                        ? 'border-amber-400 bg-amber-50/50 font-bold text-black'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{t.configurator.brandedOption}</span>
                      <span className="text-amber-700 font-bold">249 {t.common.currency}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardBranding('unbranded')}
                    className={`p-2.5 rounded-xl border text-left rtl:text-right text-xs transition-all ${
                      cardBranding === 'unbranded'
                        ? 'border-amber-400 bg-amber-50/50 font-bold text-black'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{t.configurator.unbrandedOption}</span>
                      <span className="text-slate-900 font-bold">349 {t.common.currency}</span>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Step 4: Artwork & Logo Upload */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-sm font-bold text-black block">
                {t.configurator.stepArtwork}
              </label>
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-neutral-50/50 flex flex-col items-center justify-center text-center space-y-2">
                <Upload className="w-6 h-6 text-slate-400" />
                <p className="text-xs text-slate-600 max-w-sm">
                  {t.configurator.uploadLogo}
                </p>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleSimulateLogoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-300 text-black text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs"
                >
                  {logoFileName ? `${t.configurator.fileChosen} ${logoFileName}` : t.configurator.chooseFile}
                </label>
              </div>
            </div>

            {/* Step 5: Profile Selection */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-sm font-bold text-black block">
                {t.configurator.stepProfile}
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {userProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName} - {p.company} ({p.accessState === 'private_preview' ? t.common.privatePreview : t.common.active})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                {t.configurator.chipEncodingNote}
              </p>
            </div>

            {/* Step 6: Accessory - Wooden Stand (Coming Soon state) */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-sm font-bold text-black">
                  {t.configurator.stepAccessory} - {t.configurator.woodenStandTitle}
                </label>
                <span className="text-[10px] font-mono bg-neutral-100 text-slate-600 px-2 py-0.5 rounded">
                  {t.configurator.comingSoon}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-100/70 border border-neutral-200 text-xs text-slate-600 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  {t.configurator.woodenStandNotice}
                </p>
              </div>
            </div>

            {/* Step 7: Delivery Form */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-sm font-bold text-black block">
                {t.configurator.stepDelivery}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.configurator.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                    placeholder={t.configurator.namePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.configurator.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm dir-ltr"
                    placeholder={t.configurator.phonePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.configurator.cityLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                    placeholder={t.configurator.cityPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.configurator.addressLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                    placeholder={t.configurator.addressPlaceholder}
                  />
                </div>
              </div>
            </div>

            {/* Proof Notice & Submission */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <FileCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p>{t.configurator.proofNoticeDesc}</p>
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                className="w-full bg-[#FFD700] hover:bg-[#FACC15] text-black font-extrabold text-base py-4 px-6 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                {t.configurator.submitOrder} ({pricing.totalMAD} {t.common.currency})
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: PERSISTENT LIVE CARD PREVIEW & TIMELINE (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Live 3D Card Preview */}
            <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl flex flex-col items-center">
              <p className="text-xs font-mono text-neutral-400 mb-4 uppercase tracking-widest">
                {t.configurator.livePreviewTitle}
              </p>
              <NfcCard3D
                color={cardColor}
                branding={cardBranding}
                businessName={selectedProfile?.company || customerName}
                businessTitle={selectedProfile?.jobTitle || 'Professionnel'}
                logoPreviewUrl={logoPreviewUrl}
                showFlipButton={true}
                currentLanguage={currentLanguage}
              />
            </div>

            {/* Itemized Order Summary */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-black border-b border-slate-100 pb-3">
                {t.configurator.stepSummary}
              </h3>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>{t.configurator.summaryCardPVC} ({cardColor === 'black' ? t.configurator.matteBlack : t.configurator.matteWhite})</span>
                  <span className="font-semibold">{pricing.cardPriceMAD} {t.common.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.configurator.summaryFinish}</span>
                  <span>{cardBranding === 'branded' ? t.configurator.brandedOption : t.configurator.unbrandedOption}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.configurator.summaryStand}</span>
                  <span className="text-slate-400">{t.configurator.summaryStandExcluded}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.configurator.summaryPaymentMode}</span>
                  <span className="font-semibold text-emerald-700">{t.configurator.summaryCOD}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-black">
                  <span>{t.configurator.summaryTotalDue}</span>
                  <span className="text-base tabular-nums">{pricing.totalMAD} {t.common.currency}</span>
                </div>
              </div>

              {/* Subscription Timeline Reminder */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  {t.configurator.timelineReminder}
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex justify-between">
                    <span>{t.configurator.stage1Reminder}</span>
                    <span className="font-semibold text-emerald-700">{t.configurator.stage1Included}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.configurator.stage2Reminder}</span>
                    <span className="font-semibold">{t.configurator.stage2Manual}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.configurator.stage3Reminder}</span>
                    <span className="font-semibold">{t.configurator.stage3Annual}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
