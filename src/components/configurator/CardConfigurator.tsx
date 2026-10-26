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
  Truck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Check,
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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [packageTier, setPackageTier] = useState<PackageTier>('starter');
  const [cardColor, setCardColor] = useState<CardColor>('black');
  const [cardBranding, setCardBranding] = useState<CardBranding>('branded');
  const [logoFileName, setLogoFileName] = useState<string>('');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    userProfiles[0]?.id || ''
  );
  const [woodenStandRequested, setWoodenStandRequested] = useState<boolean>(false);

  // Delivery Form
  const [customerName, setCustomerName] = useState<string>('Yassine Bennani');
  const [customerPhone, setCustomerPhone] = useState<string>('+212 6 61 24 88 90');
  const [customerEmail, setCustomerEmail] = useState<string>('yassine.bennani@atlasdesign.ma');
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
      profileName: selectedProfile?.displayName || 'Mon Profil',
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
              <span className="text-slate-500">Numéro de commande :</span>
              <span className="font-mono font-bold text-black">{submittedOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Montant dû à la livraison (COD) :</span>
              <span className="font-bold text-black">{pricing.totalMAD} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Profil associé :</span>
              <span className="font-semibold text-black">{selectedProfile?.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Adresse de livraison :</span>
              <span>{city}, {address}</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left rtl:text-right flex items-start gap-2.5">
            <FileCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Étape suivante - Bon à tirer (BAT) :</strong> Le fondateur TAGTOP préparera votre maquette d'impression et vous contactera au <strong>{customerPhone}</strong> sur WhatsApp pour recueillir votre accord avant toute mise en fabrication.
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#FACC15] text-black font-bold px-8 py-3.5 rounded-xl transition-all shadow-xs"
            >
              Accéder à mon Espace Client
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderSubmitted(false);
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              Configurer une autre carte
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
            Personnalisation Haute Fidélité
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black">
            {t.configurator.title}
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Configurez votre carte physique NFC étape par étape.
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
                  <div className="font-bold text-black text-sm">Starter (1 Carte)</div>
                  <div className="text-xs text-amber-700 font-semibold mt-1">Dès 249 MAD</div>
                  <div className="text-[11px] text-slate-500 mt-1">6 mois inclus</div>
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
                  <div className="font-bold text-black text-sm">Pro (5 Cartes)</div>
                  <div className="text-xs text-slate-700 font-semibold mt-1">Sur devis</div>
                  <div className="text-[11px] text-slate-500 mt-1">Petites équipes</div>
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
                  <div className="font-bold text-black text-sm">Entreprise</div>
                  <div className="text-xs text-slate-700 font-semibold mt-1">Sur devis</div>
                  <div className="text-[11px] text-slate-500 mt-1">Commandes en volume</div>
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
                    <span>Noir Mat</span>
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
                    <span>Blanc Mat</span>
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
                      <span>Avec logo TAGTOP</span>
                      <span className="text-amber-700 font-bold">249 MAD</span>
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
                      <span>Sans logo TAGTOP</span>
                      <span className="text-slate-900 font-bold">349 MAD</span>
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
                  {logoFileName ? `Fichier : ${logoFileName}` : 'Choisir un fichier'}
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
                    {p.displayName} - {p.company} ({p.accessState === 'private_preview' ? 'Aperçu privé' : 'Actif'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                La puce NFC sera encodée par TAGTOP pour ouvrir directement ce profil.
              </p>
            </div>

            {/* Step 6: Accessory - Wooden Stand (Coming Soon state) */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-black">
                  {t.configurator.stepAccessory} - Support de bureau en bois massif
                </label>
                <span className="text-[10px] font-mono bg-neutral-100 text-slate-600 px-2 py-0.5 rounded">
                  Bientôt disponible
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-100/70 border border-neutral-200 text-xs text-slate-600 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  Le support artisanal en bois massif est en cours de confection. Il est actuellement indisponible à la vente et exclu du montant de votre commande.
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
                    placeholder="+212 6..."
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
                    placeholder="ex: Casablanca, Rabat, Marrakech..."
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
                    placeholder="Quartier, rue, n° immeuble..."
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
                {t.configurator.submitOrder} ({pricing.totalMAD} MAD)
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: PERSISTENT LIVE CARD PREVIEW & TIMELINE (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Live 3D Card Preview */}
            <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl flex flex-col items-center">
              <p className="text-xs font-mono text-neutral-400 mb-4 uppercase tracking-widest">
                Aperçu de la Carte en Direct
              </p>
              <NfcCard3D
                color={cardColor}
                branding={cardBranding}
                businessName={selectedProfile?.company || customerName}
                businessTitle={selectedProfile?.jobTitle || 'Professionnel'}
                logoPreviewUrl={logoPreviewUrl}
                showFlipButton={true}
              />
            </div>

            {/* Itemized Order Summary */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-black border-b border-slate-100 pb-3">
                {t.configurator.stepSummary}
              </h3>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Carte NFC PVC {cardColor === 'black' ? 'Noir' : 'Blanc'} mat</span>
                  <span className="font-semibold">{pricing.cardPriceMAD} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Finition physique</span>
                  <span>{cardBranding === 'branded' ? 'Avec logo TAGTOP' : 'Sans logo TAGTOP'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Support en bois</span>
                  <span className="text-slate-400">Non inclus (Bientôt)</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode de paiement</span>
                  <span className="font-semibold text-emerald-700">Paiement à la livraison (COD)</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-black">
                  <span>Total à régler à la réception</span>
                  <span className="text-base tabular-nums">{pricing.totalMAD} MAD</span>
                </div>
              </div>

              {/* Subscription Timeline Reminder */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Calendrier de présence digitale inclus :
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex justify-between">
                    <span>1. 6 premiers mois :</span>
                    <span className="font-semibold text-emerald-700">Inclus (0 MAD)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. 6 mois suivants :</span>
                    <span className="font-semibold">99 MAD (virement manuel)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. Périodes annuelles ultérieures :</span>
                    <span className="font-semibold">199 MAD / an</span>
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
