import { Language } from '../types';

export interface Translations {
  common: {
    brandName: string;
    brandTagline: string;
    currency: string;
    language: string;
    clientArea: string;
    founderAdmin: string;
    viewSite: string;
    publicSite: string;
    liveProfile: string;
    freePreviewCTA: string;
    orderCardCTA: string;
    exploreCardsCTA: string;
    saveContactCTA: string;
    whatsappCTA: string;
    callCTA: string;
    shareCTA: string;
    loading: string;
    save: string;
    cancel: string;
    close: string;
    back: string;
    next: string;
    status: string;
    actions: string;
    demoNote: string;
    reassuranceBadge: string;
    active: string;
    privatePreview: string;
    gracePeriod: string;
    suspended: string;
    individual: string;
    copied: string;
    morocco: string;
    ariaHome: string;
    ariaSwitchLang: string;
    ariaMainMenu: string;
    templateExecutive: string;
    templateCreative: string;
    templateArtisan: string;
  };
  nav: {
    home: string;
    howItWorks: string;
    features: string;
    cards: string;
    pricing: string;
    demo: string;
    about: string;
    faq: string;
    contact: string;
    login: string;
    register: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    reassurance: string;
    pauseAnimation: string;
    playAnimation: string;
    interactiveDemoTitle: string;
    tapPrompt: string;
    codBadge: string;
    preEncodedBadge: string;
    compatibilityBadge: string;
    pause: string;
    play: string;
    sampleJob: string;
    samplePrice: string;
    sampleLocation: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    badge: string;
    step1Title: string;
    step1Desc: string;
    step1Highlight: string;
    step2Title: string;
    step2Desc: string;
    step2Highlight: string;
    step3Title: string;
    step3Desc: string;
    step3Highlight: string;
    step4Title: string;
    step4Desc: string;
    step4Highlight: string;
  };
  features: {
    title: string;
    subtitle: string;
    badge: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
    f4Title: string;
    f4Desc: string;
    f5Title: string;
    f5Desc: string;
    f6Title: string;
    f6Desc: string;
  };
  cards: {
    title: string;
    subtitle: string;
    badge: string;
    matteBlack: string;
    matteWhite: string;
    brandedTitle: string;
    brandedDesc: string;
    unbrandedTitle: string;
    unbrandedDesc: string;
    brandedOption: string;
    unbrandedOption: string;
    woodenStandTitle: string;
    woodenStandStatus: string;
    woodenStandDesc: string;
    woodenStandDisclaimer: string;
    specsTitle: string;
    specFormat: string;
    specFinish: string;
    specChip: string;
    specReady: string;
    customizeCta: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    badge: string;
    recommendedBadge: string;
    cardCount1: string;
    cardCount5: string;
    volumeBadge: string;
    starterTitle: string;
    starterBrandedBadge: string;
    starterUnbrandedBadge: string;
    starterBrandedTag: string;
    starterOr: string;
    starterUnbrandedTag: string;
    starterFeature1: string;
    starterFeature2: string;
    starterFeature3: string;
    starterFeature4: string;
    starterFeature5: string;
    starterCta: string;
    proTitle: string;
    proSubtitle: string;
    proDesc: string;
    proQuote: string;
    proFeature1: string;
    proFeature2: string;
    proFeature3: string;
    proFeature4: string;
    proCta: string;
    enterpriseTitle: string;
    enterpriseSubtitle: string;
    enterpriseDesc: string;
    enterpriseQuote: string;
    enterpriseFeature1: string;
    enterpriseFeature2: string;
    enterpriseFeature3: string;
    enterpriseFeature4: string;
    enterpriseCta: string;
    timelineTitle: string;
    stage1Label: string;
    stage1Title: string;
    stage1Desc: string;
    stage1Included: string;
    stage2Label: string;
    stage2Title: string;
    stage2Desc: string;
    stage2Per6Months: string;
    stage3Label: string;
    stage3Title: string;
    stage3Desc: string;
    stage3PerYear: string;
    renewalNotice: string;
    graceGuarantee: string;
  };
  configurator: {
    title: string;
    badge: string;
    subtitle: string;
    stepTier: string;
    stepColor: string;
    stepBranding: string;
    stepArtwork: string;
    stepProfile: string;
    stepAccessory: string;
    stepDelivery: string;
    stepSummary: string;
    stepProofNotice: string;
    starterPackage: string;
    fromPrice: string;
    sixMonthsIncluded: string;
    proPackage: string;
    onQuote: string;
    smallTeams: string;
    enterprisePackage: string;
    volumeOrders: string;
    matteBlack: string;
    matteWhite: string;
    brandedOption: string;
    unbrandedOption: string;
    uploadLogo: string;
    fileChosen: string;
    chooseFile: string;
    selectProfile: string;
    chipEncodingNote: string;
    woodenStandTitle: string;
    comingSoon: string;
    woodenStandNotice: string;
    cityLabel: string;
    cityPlaceholder: string;
    addressLabel: string;
    addressPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    fullNameLabel: string;
    namePlaceholder: string;
    codNotice: string;
    proofNoticeDesc: string;
    submitOrder: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
    orderNumberLabel: string;
    amountDueLabel: string;
    linkedProfileLabel: string;
    deliveryAddressLabel: string;
    nextStepProofTitle: string;
    nextStepProofDesc: string;
    accessDashboardBtn: string;
    configureAnotherBtn: string;
    livePreviewTitle: string;
    summaryCardPVC: string;
    summaryFinish: string;
    summaryStand: string;
    summaryStandExcluded: string;
    summaryPaymentMode: string;
    summaryCOD: string;
    summaryTotalDue: string;
    timelineReminder: string;
    stage1Reminder: string;
    stage1Included: string;
    stage2Reminder: string;
    stage2Manual: string;
    stage3Reminder: string;
    stage3Annual: string;
  };
  profile: {
    saveContactPrompt: string;
    productsTitle: string;
    servicesTitle: string;
    documentsTitle: string;
    videosTitle: string;
    leadFormTitle: string;
    leadFormSubtitle: string;
    nameField: string;
    phoneField: string;
    emailField: string;
    companyField: string;
    notesField: string;
    consentField: string;
    submitLead: string;
    leadSuccess: string;
    leadSuccessDesc: string;
    expiredTitle: string;
    expiredMessage: string;
    digitalFooter: string;
    expiredModeBadge: string;
    viewActiveProfileBtn: string;
    networkFooter: string;
    styleLabel: string;
    testExpiredBtn: string;
    graceWarningText: string;
    morocco: string;
    callAction: string;
    emailAction: string;
    websiteAction: string;
    shareAction: string;
    copiedToast: string;
    indicativePrices: string;
    simulatedDownload: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    companyPlaceholder: string;
    notesPlaceholder: string;
    digitalFooterNetwork: string;
  };
  dashboard: {
    customerTitle: string;
    founderTitle: string;
    overview: string;
    profiles: string;
    cardsOrders: string;
    leads: string;
    analytics: string;
    subscription: string;
    settings: string;
    customers: string;
    nfcRegistry: string;
    transfers: string;
    graceSuspension: string;
    configuration: string;
  };
  about: {
    missionTag: string;
    missionTitle: string;
    p1: string;
    p2: string;
    designedInMorocco: string;
    cities: string;
    craftsmanship: string;
    proofValidated: string;
    founderCommitment: string;
    founderQuoteTitle: string;
    founderQuote: string;
    founderTeam: string;
    founderSub: string;
    dedicatedSupport: string;
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
    q6: string;
    a6: string;
  };
  legal: {
    backToSite: string;
    disclaimerTitle: string;
    disclaimerText: string;
    termsTitle: string;
    privacyTitle: string;
    termsS1Title: string;
    termsS1Text: string;
    termsS2Title: string;
    termsS2Text: string;
    termsS3Title: string;
    termsS3Text: string;
    termsS4Title: string;
    termsS4Text: string;
    privacyS1Title: string;
    privacyS1Text: string;
    privacyS2Title: string;
    privacyS2Text: string;
    privacyS3Title: string;
    privacyS3Text: string;
  };
  demoPage: {
    backHome: string;
    badge: string;
    note: string;
    title: string;
    orderCta: string;
    businessExamples: string;
    demoLeadAlert: string;
  };
  quoteModal: {
    submittedTitle: string;
    submittedDesc: string;
    title: string;
    subtitle: string;
    tierBadgePro: string;
    tierBadgeEnterprise: string;
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    companyLabel: string;
    quantityLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    submitBtn: string;
    close: string;
  };
  nfcCard: {
    cardLabel: string;
    holderLabel: string;
    secureChip: string;
    backInstructions: string;
    poweredBy: string;
    bespokeCard: string;
    madeForMorocco: string;
    flipFront: string;
    flipBack: string;
    tiltHint: string;
    sampleBusinessTitle: string;
    nfcTap: string;
    nfcIdLabel: string;
    isoStandard: string;
    matteBlack: string;
    matteWhite: string;
  };
  customerDashboard: {
    ownerSpace: string;
    accountLabel: string;
    orderNewCard: string;
    graceBannerTitle: string;
    graceBannerDesc: string;
    graceBannerAction: string;
    previewBannerTitle: string;
    previewBannerDesc: string;
    previewBannerAction: string;
    profileStatus: string;
    expiryLabel: string;
    anonymousViews: string;
    tapsAndScans: string;
    collectedLeads: string;
    formsSubmittedWithConsent: string;
    timelineTitle: string;
    stage1Title: string;
    stage1Value: string;
    stage1ActiveUntil: string;
    stage2Title: string;
    stage2Value: string;
    stage2Manual: string;
    stage3Title: string;
    stage3Value: string;
    stage3Continuity: string;
    recentLeadsTitle: string;
    viewAllLeads: string;
    individual: string;
    openWhatsApp: string;
    call: string;
    editorTitle: string;
    editorSubtitle: string;
    editBtn: string;
    previewBtn: string;
    savedToast: string;
    templateLabel: string;
    displayNameLabel: string;
    jobTitleLabel: string;
    companyLabel: string;
    cityLabel: string;
    bioLabel: string;
    phoneLabel: string;
    whatsappLabel: string;
    emailLabel: string;
    websiteLabel: string;
    brandingNoticeTitle: string;
    brandingNoticeDesc: string;
    myCardsOrdersTitle: string;
    myCardsOrdersSubtitle: string;
    newOrderBtn: string;
    stepReceived: string;
    stepProofReview: string;
    stepEncodingFab: string;
    stepDelivered: string;
    proofReadyTitle: string;
    proofReadyDesc: string;
    approveProofBtn: string;
    requestProofChangeBtn: string;
    proofRemarksPrompt: string;
    proofRemarksSentAlert: string;
    linkedProfile: string;
    paymentLabel: string;
    paidOnDelivery: string;
    dueOnDelivery: string;
    leadsTitle: string;
    leadsSubtitle: string;
    searchPlaceholder: string;
    colName: string;
    colPhone: string;
    colEmail: string;
    colDate: string;
    colPromo: string;
    colContact: string;
    optInYes: string;
    optInNo: string;
    analyticsNoteTitle: string;
    analyticsNoteDesc: string;
    metricTaps: string;
    metricWhatsApp: string;
    metricVCard: string;
    metricForms: string;
    subscriptionTitle: string;
    subscriptionSubtitle: string;
    renewalSubmittedToast: string;
    bankDetailsTitle: string;
    claimTransferTitle: string;
    renewalPeriodLabel: string;
    option6Months: string;
    optionAnnual: string;
    receiptRefLabel: string;
    receiptPlaceholder: string;
    submitVerificationBtn: string;
    confirmWhatsAppBtn: string;
    settingsTitle: string;
    settingsSubtitle: string;
    pwaTitle: string;
    pwaDesc: string;
    pwaIphone: string;
    pwaAndroid: string;
    renewal6MonthsLabel: string;
    renewalAnnualLabel: string;
    pendingManualVerification: string;
    orderStatusReceived: string;
    orderStatusArtworkReview: string;
    orderStatusCustomerApproved: string;
    orderStatusProduction: string;
    orderStatusLinked: string;
    orderStatusShipped: string;
    orderStatusDelivered: string;
  };
  founderDashboard: {
    adminBadge: string;
    founderTitle: string;
    viewCustomerPortal: string;
    tabOverview: string;
    tabCustomers: string;
    tabOrders: string;
    tabNfcRegistry: string;
    tabTransfers: string;
    tabGrace: string;
    tabConfiguration: string;
    ordersToProcess: string;
    pendingProofs: string;
    activeNfcCards: string;
    encoded100: string;
    transfersToVerify: string;
    whatsAppReceipts: string;
    inGracePeriod: string;
    max14Days: string;
    prioritiesTitle: string;
    proofsWaitingDesc: string;
    reviewProofsBtn: string;
    transfersWaitingDesc: string;
    verifyTransfersBtn: string;
    customersTitle: string;
    profilesManaged: string;
    colHolder: string;
    colCity: string;
    colAccessStatus: string;
    colExpiry: string;
    colLinkedCards: string;
    colChangeStatus: string;
    ordersTitle: string;
    ordersSubtitle: string;
    codCollected: string;
    codPending: string;
    cardFinish: string;
    linkedProfile: string;
    orderStage: string;
    codPayment: string;
    paymentConfirmed: string;
    markCollected: string;
    registryTitle: string;
    registrySubtitle: string;
    colHardwareUid: string;
    colSerialNumber: string;
    colFinish: string;
    colProfile: string;
    colChipStatus: string;
    transfersTitle: string;
    transfersSubtitle: string;
    amountReceived: string;
    concernedProfile: string;
    approveAndExtend: string;
    reject: string;
    rejectPrompt: string;
    approvedNotes: string;
    graceTitle: string;
    graceSubtitle: string;
    restoreAccess: string;
    discreetlySuspend: string;
    settingsTitle: string;
    settingsSubtitle: string;
    savedToast: string;
    starterBrandedLabel: string;
    fixedAt249: string;
    starterUnbrandedLabel: string;
    fixedAt349: string;
    renewal6MonthsLabel: string;
    fixedAt99: string;
    renewalAnnualLabel: string;
    fixedAt199: string;
    woodenStandCheckbox: string;
    woodenStandHelp: string;
    supportWhatsAppLabel: string;
    updateSettingsBtn: string;
    finishBlack: string;
    finishWhite: string;
    withLogo: string;
    withoutLogo: string;
    statusActive: string;
    statusInTransit: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
    orderStep1: string;
    orderStep2: string;
    orderStep3: string;
    orderStep4: string;
    orderStep5: string;
    orderStep6: string;
    orderStep7: string;
  };
  app: {
    proofModificationSentAlert: string;
    backToSite: string;
    livePreviewOf: string;
  };
  footer: {
    mission: string;
    cities: string;
    navTitle: string;
    spacesTitle: string;
    cardConfigurator: string;
    liveDemo: string;
    paymentTitle: string;
    paymentDesc: string;
    copyright: string;
    privacy: string;
    terms: string;
    cashOnDelivery: string;
    cihBank: string;
    ntagCertified: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    common: {
      brandName: 'TAGTOP',
      brandTagline: 'Cartes de Visite NFC & Profils Professionnels au Maroc',
      currency: 'MAD',
      language: 'Langue',
      clientArea: 'Espace Client',
      founderAdmin: 'Admin Fondateur',
      viewSite: 'Retour au site',
      publicSite: 'Site Public',
      liveProfile: 'Profil Public Live',
      freePreviewCTA: 'Créer mon aperçu gratuit',
      orderCardCTA: 'Commander une carte',
      exploreCardsCTA: 'Découvrir les cartes',
      saveContactCTA: 'Enregistrer le contact',
      whatsappCTA: 'WhatsApp',
      callCTA: 'Appeler',
      shareCTA: 'Partager',
      loading: 'Chargement...',
      save: 'Enregistrer les modifications',
      cancel: 'Annuler',
      close: 'Fermer',
      back: 'Retour',
      next: 'Continuer',
      status: 'Statut',
      actions: 'Actions',
      demoNote: 'Données de démonstration marocaines',
      reassuranceBadge: 'Aperçu privé gratuit. Achat d’une carte requis pour publier.',
      active: 'Actif',
      privatePreview: 'Aperçu privé',
      gracePeriod: 'Période de grâce',
      suspended: 'Suspendu',
      individual: 'Particulier',
      copied: 'Copié !',
      morocco: 'Maroc',
      ariaHome: 'TAGTOP Accueil',
      ariaSwitchLang: 'Changer la langue en',
      ariaMainMenu: 'Menu principal',
      templateExecutive: 'Exécutif',
      templateCreative: 'Créatif',
      templateArtisan: 'Artisan',
    },
    nav: {
      home: 'Accueil',
      howItWorks: 'Comment ça marche',
      features: 'Fonctionnalités',
      cards: 'Cartes & Accessoires',
      pricing: 'Tarifs',
      demo: 'Démo du profil',
      about: 'À propos',
      faq: 'FAQ',
      contact: 'Contact & Devis',
      login: 'Connexion',
      register: 'Créer un aperçu',
    },
    hero: {
      headline: 'Un seul geste. Toutes vos connexions.',
      subheadline: 'Une carte NFC haut de gamme qui ouvre votre profil professionnel complet, transmet instantanément vos coordonnées et recueille des opportunités qualifiées sans exiger d’application.',
      primaryCta: 'Créer mon aperçu gratuit',
      secondaryCta: 'Découvrir les cartes',
      reassurance: 'Aperçu privé gratuit. Achat d’une carte requis pour publier.',
      pauseAnimation: 'Mettre en pause la démonstration',
      playAnimation: 'Relancer la démonstration',
      interactiveDemoTitle: 'Démonstration interactive NFC',
      tapPrompt: 'Approchez la carte du smartphone pour révéler le profil digital',
      codBadge: 'Paiement à la livraison (COD)',
      preEncodedBadge: 'Cartes livrées pré-encodées',
      compatibilityBadge: 'Compatible iPhone & Android',
      pause: 'Pause',
      play: 'Lecture',
      sampleJob: 'Architecture d’intérieur',
      samplePrice: 'Dès 15 000 MAD',
      sampleLocation: 'Atelier Atlas Design · Casablanca',
    },
    howItWorks: {
      title: 'Une transition fluide du digital au physique',
      subtitle: 'Concevez votre profil en toute sérénité, commandez votre carte physique et recevez-la prête à l’emploi partout au Maroc.',
      badge: 'Processus Simple & Sécurisé',
      step1Title: '01. Aperçu privé gratuit',
      step1Desc: 'Créez votre profil en ligne, ajoutez vos informations professionnelles, services et coordonnées. Cet aperçu reste strictement privé jusqu’à confirmation.',
      step1Highlight: '100% privé & sans engagement',
      step2Title: '02. Choix & personnalisation de la carte',
      step2Desc: 'Sélectionnez votre finition PVC noire ou blanche, avec ou sans logo TAGTOP. Téléversez votre logo d’entreprise pour un rendu exclusif.',
      step2Highlight: 'Noir ou blanc mat haut de gamme',
      step3Title: '03. Validation du bon à tirer & encodage',
      step3Desc: 'Le fondateur TAGTOP prépare le visuel d’impression, vous soumet le BAT pour approbation finale, puis encode la puce avec votre profil dédié.',
      step3Highlight: 'Validation BAT sur WhatsApp',
      step4Title: '04. Réception prête à l’emploi',
      step4Desc: 'Livraison en paiement à la livraison (COD) partout au Maroc. Votre carte fonctionne immédiatement dès le premier contact physique.',
      step4Highlight: 'Paiement à la livraison au Maroc',
    },
    features: {
      title: 'Pensé pour les professionnels exigeants au Maroc',
      subtitle: 'Une technologie sans friction au service de votre image de marque et de votre développement commercial.',
      badge: 'Technologie & Finitions',
      f1Title: 'Zéro application requise',
      f1Desc: 'Un simple contact ouvre instantanément votre profil dans le navigateur de votre interlocuteur sur iPhone comme Android.',
      f2Title: 'Import vCard natif',
      f2Desc: 'Votre contact s’enregistre dans le carnet d’adresses du smartphone en un geste grâce au format vCard universel.',
      f3Title: 'Vitrine Produits & Services',
      f3Desc: 'Présentez vos réalisations, tarifs en dirhams, photos et brochures PDF directement depuis votre fiche.',
      f4Title: 'Collecte de prospects consentis',
      f4Desc: 'Recevez les coordonnées de vos contacts avec distinction claire entre la mise en relation et l’opt-in marketing.',
      f5Title: 'Modifications en temps réel',
      f5Desc: 'Changez de numéro, ajoutez une offre ou actualisez vos liens sans jamais avoir à réimprimer une carte.',
      f6Title: 'Fabriqué avec rigueur',
      f6Desc: 'PVC mat tactile résistant à l’eau et aux frottements du quotidien, avec antenne NFC haute sensibilité intégrée.',
    },
    cards: {
      title: 'Des cartes physiques nobles et durables',
      subtitle: 'Finition mate anti-traces, tranche soignée et puce NFC protégée pour une longévité maximale.',
      badge: 'Matériaux & Confection',
      matteBlack: 'Noir Mat Profond',
      matteWhite: 'Blanc Mat Épuré',
      brandedTitle: 'Carte avec logo TAGTOP',
      brandedDesc: 'Comporte le discret logo TAGTOP au dos. Tarif accessible et avantageux pour les créateurs indépendants.',
      unbrandedTitle: 'Carte 100% Personnalisée',
      unbrandedDesc: 'Sans aucun marquage TAGTOP sur la carte physique. Seul le visuel de votre entreprise est imprimé.',
      brandedOption: 'Avec logo TAGTOP (249 MAD)',
      unbrandedOption: 'Sans logo TAGTOP (349 MAD)',
      woodenStandTitle: 'Support de bureau en bois massif',
      woodenStandStatus: 'Bientôt disponible',
      woodenStandDesc: 'Accessoire de comptoir ou de bureau élégant. Actuellement en cours de fabrication artisanale, disponible prochainement.',
      woodenStandDisclaimer: 'Conformément aux directives de lancement, cet accessoire est configurable mais exclu des montants de commande actuels.',
      specsTitle: 'Spécifications de la Carte PVC NFC',
      specFormat: 'Format carte bancaire : Dimensions standard 85.60 × 53.98 mm, épaisseur premium 0.84 mm.',
      specFinish: 'Finition mate soignée : Toucher velouté haute densité résistant aux micro-rayures et traces.',
      specChip: 'Puce NTAG haute sensibilité : Compatible 100% avec les téléphones équipés de NFC sans batterie requise.',
      specReady: 'Prête à l’emploi : Votre carte est encodée directement par TAGTOP avec votre profil digital avant envoi.',
      customizeCta: 'Personnaliser ma carte dans le configurateur',
    },
    pricing: {
      title: 'Tarification claire et sans surprise',
      subtitle: 'Un investissement physique initial comprenant votre première période de présence digitale.',
      badge: 'Transparence Absolue',
      recommendedBadge: 'Formule Recommandée',
      cardCount1: '1 Carte NFC',
      cardCount5: 'Pack 5 Cartes',
      volumeBadge: 'Volume & Réseaux',
      starterTitle: 'Formule Starter',
      starterBrandedBadge: '249 MAD (Avec logo TAGTOP)',
      starterUnbrandedBadge: '349 MAD (Sans logo TAGTOP)',
      starterBrandedTag: '(Avec logo TAGTOP)',
      starterOr: 'ou 349 MAD',
      starterUnbrandedTag: '(Sans logo TAGTOP sur la carte)',
      starterFeature1: '1 carte PVC noire ou blanche finition mate',
      starterFeature2: '6 premiers mois d\'accès digital inclus',
      starterFeature3: 'Profil professionnel complet sans application',
      starterFeature4: 'Validation du BAT sur WhatsApp avant impression',
      starterFeature5: 'Paiement à la livraison au Maroc',
      starterCta: 'Configurer ma carte Starter',
      proTitle: 'Formule Pro (Pack 5 cartes)',
      proSubtitle: 'Tarif sur mesure adapté à vos besoins d’équipe',
      proDesc: 'Pour les cabinets, associés et petites équipes gérées par un seul compte propriétaire.',
      proQuote: 'Sur devis',
      proFeature1: '5 cartes NFC avec attribution flexible',
      proFeature2: 'Plusieurs cartes vers un ou plusieurs profils',
      proFeature3: 'Gestion centralisée par un seul compte propriétaire',
      proFeature4: 'Option avec ou sans marquage TAGTOP',
      proCta: 'Demander un devis Pro',
      enterpriseTitle: 'Formule Entreprise',
      enterpriseSubtitle: 'Commandes groupées pour entreprises et institutions',
      enterpriseDesc: 'Commandes en volume pour organisations, réseaux et grandes structures au Maroc.',
      enterpriseQuote: 'Sur devis',
      enterpriseFeature1: 'Volume dès 10+ cartes NFC personnalisées',
      enterpriseFeature2: 'Charte graphique d\'entreprise sur mesure',
      enterpriseFeature3: 'Accompagnement dédié du fondateur TAGTOP',
      enterpriseFeature4: 'Facturation marocaine entreprise (SARL)',
      enterpriseCta: 'Demander un devis Entreprise',
      timelineTitle: 'Calendrier de présence digitale inclus & renouvellements',
      stage1Label: 'Étape 1',
      stage1Title: 'Étape 1 : 6 premiers mois inclus',
      stage1Desc: 'Inclus avec l’achat de votre carte physique Starter. Aucun frais additionnel pour démarrer.',
      stage1Included: '0 MAD inclus',
      stage2Label: 'Étape 2',
      stage2Title: 'Étape 2 : 6 mois suivants',
      stage2Desc: '99 MAD pour prolonger votre profil actif pendant 6 mois supplémentaires (règlement manuel par virement).',
      stage2Per6Months: '99 MAD / 6 mois',
      stage3Label: 'Étape 3',
      stage3Title: 'Étape 3 : Périodes annuelles ultérieures',
      stage3Desc: '199 MAD par an pour maintenir votre profil accessible en continu et bénéficier de toutes les mises à jour.',
      stage3PerYear: '199 MAD / an',
      renewalNotice: 'Renouvellement manuel par virement bancaire vérifié par le fondateur via WhatsApp. Pas de prélèvement automatique.',
      graceGuarantee: 'Période de grâce de 14 jours garantie : En cas d’échéance, votre profil reste actif pendant 14 jours avec un rappel discret dans votre espace client. Après ce délai, le profil public est suspendu discrètement sans aucune divulgation de vos données privées.',
    },
    configurator: {
      title: 'Configurateur de Carte NFC TAGTOP',
      badge: 'Personnalisation Haute Fidélité',
      subtitle: 'Configurez votre carte physique NFC étape par étape.',
      stepTier: '1. Formule',
      stepColor: '2. Couleur PVC',
      stepBranding: '3. Marquage',
      stepArtwork: '4. Logo & Design',
      stepProfile: '5. Profil associé',
      stepAccessory: '6. Accessoire',
      stepDelivery: '7. Coordonnées & Livraison',
      stepSummary: '8. Récapitulatif',
      stepProofNotice: '9. Validation & BAT',
      starterPackage: 'Starter (1 Carte)',
      fromPrice: 'Dès 249 MAD',
      sixMonthsIncluded: '6 mois inclus',
      proPackage: 'Pro (5 Cartes)',
      onQuote: 'Sur devis',
      smallTeams: 'Petites équipes',
      enterprisePackage: 'Entreprise',
      volumeOrders: 'Commandes en volume',
      matteBlack: 'Noir Mat',
      matteWhite: 'Blanc Mat',
      brandedOption: 'Avec logo TAGTOP',
      unbrandedOption: 'Sans logo TAGTOP',
      uploadLogo: 'Téléverser le logo de votre entreprise (PNG, SVG, PDF haute résolution)',
      fileChosen: 'Fichier :',
      chooseFile: 'Choisir un fichier',
      selectProfile: 'Sélectionnez le profil digital qui sera associé à cette carte',
      chipEncodingNote: 'La puce NFC sera encodée par TAGTOP pour ouvrir directement ce profil.',
      woodenStandTitle: 'Support de bureau en bois massif',
      comingSoon: 'Bientôt disponible',
      woodenStandNotice: 'Le support artisanal en bois massif est en cours de confection. Il est actuellement indisponible à la vente et exclu du montant de votre commande.',
      cityLabel: 'Ville au Maroc',
      cityPlaceholder: 'ex: Casablanca, Rabat, Marrakech...',
      addressLabel: 'Adresse de livraison complète',
      addressPlaceholder: 'Quartier, rue, n° immeuble...',
      phoneLabel: 'Numéro de téléphone marocain (+212)',
      phonePlaceholder: '+212 6...',
      fullNameLabel: 'Nom complet du destinataire',
      namePlaceholder: 'ex: Yassine Bennani',
      codNotice: 'Paiement à la livraison (Cash on Delivery) lors de la réception de votre colis physique.',
      proofNoticeDesc: 'Notre fondateur prépare votre bon à tirer (BAT). L’impression ne démarre qu’après votre accord explicite sur WhatsApp.',
      submitOrder: 'Confirmer la commande (Paiement à la livraison)',
      orderSuccessTitle: 'Commande enregistrée avec succès',
      orderSuccessDesc: 'Votre demande a été transmise à l’équipe TAGTOP. Nous vous contacterons pour valider votre maquette avant impression.',
      orderNumberLabel: 'Numéro de commande :',
      amountDueLabel: 'Montant dû à la livraison (COD) :',
      linkedProfileLabel: 'Profil associé :',
      deliveryAddressLabel: 'Adresse de livraison :',
      nextStepProofTitle: 'Étape suivante - Bon à tirer (BAT) :',
      nextStepProofDesc: 'Le fondateur TAGTOP préparera votre maquette d\'impression et vous contactera sur WhatsApp pour recueillir votre accord avant toute mise en fabrication.',
      accessDashboardBtn: 'Accéder à mon Espace Client',
      configureAnotherBtn: 'Configurer une autre carte',
      livePreviewTitle: 'Aperçu de la Carte en Direct',
      summaryCardPVC: 'Carte NFC PVC',
      summaryFinish: 'Finition physique',
      summaryStand: 'Support en bois',
      summaryStandExcluded: 'Non inclus (Bientôt)',
      summaryPaymentMode: 'Mode de paiement',
      summaryCOD: 'Paiement à la livraison (COD)',
      summaryTotalDue: 'Total à régler à la réception',
      timelineReminder: 'Calendrier de présence digitale inclus :',
      stage1Reminder: '1. 6 premiers mois :',
      stage1Included: 'Inclus (0 MAD)',
      stage2Reminder: '2. 6 mois suivants :',
      stage2Manual: '99 MAD (virement manuel)',
      stage3Reminder: '3. Périodes annuelles ultérieures :',
      stage3Annual: '199 MAD / an',
    },
    profile: {
      saveContactPrompt: 'Enregistrer dans vos contacts',
      productsTitle: 'Services & Réalisations',
      servicesTitle: 'Prestations proposées',
      documentsTitle: 'Catalogues & Documents PDF',
      videosTitle: 'Présentation vidéo',
      leadFormTitle: 'Laisser vos coordonnées',
      leadFormSubtitle: 'Partagez vos coordonnées directement avec nous pour une mise en relation rapide.',
      nameField: 'Votre nom complet',
      phoneField: 'Numéro de téléphone',
      emailField: 'Adresse email',
      companyField: 'Entreprise / Activité',
      notesField: 'Message ou projet souhaité',
      consentField: 'J’accepte de recevoir des actualités ou offres exclusives de cette entreprise (optionnel)',
      submitLead: 'Transmettre mes coordonnées',
      leadSuccess: 'Vos coordonnées ont été transmises avec succès !',
      leadSuccessDesc: 'Vos coordonnées ont été enregistrées avec succès.',
      expiredTitle: 'Profil temporairement indisponible',
      expiredMessage: 'Ce profil TAGTOP n’est pas accessible actuellement. Veuillez contacter directement le titulaire pour toute demande.',
      digitalFooter: 'Propulsé par la technologie NFC TAGTOP Maroc',
      expiredModeBadge: 'Mode : Profil Expiré (Discret)',
      viewActiveProfileBtn: 'Voir le profil actif',
      networkFooter: 'TAGTOP · Réseau de cartes de visite NFC au Maroc',
      styleLabel: 'Style :',
      testExpiredBtn: 'Tester statut expiré',
      graceWarningText: 'Période de grâce de 14 jours en cours jusqu’au',
      morocco: 'Maroc',
      callAction: 'Appeler',
      emailAction: 'Envoyer un email',
      websiteAction: 'Visiter le site web',
      shareAction: 'Partager ce profil',
      copiedToast: 'Lien copié !',
      indicativePrices: 'Tarifs indicatifs',
      simulatedDownload: 'Téléchargement simulé :',
      namePlaceholder: 'Votre nom',
      emailPlaceholder: 'contact@atlasdesign.ma',
      companyPlaceholder: 'Votre entreprise',
      notesPlaceholder: 'Projet ou objet du contact...',
      digitalFooterNetwork: 'Cartes de visite NFC & Profils connectés au Maroc',
    },
    dashboard: {
      customerTitle: 'Espace Client TAGTOP',
      founderTitle: 'Console d’Administration Fondateur',
      overview: 'Vue d’ensemble',
      profiles: 'Mes Profils',
      cardsOrders: 'Cartes & Commandes',
      leads: 'Prospects collectés',
      analytics: 'Statistiques de consultation',
      subscription: 'Abonnement & Renouvellement',
      settings: 'Paramètres & Application',
      customers: 'Gestion Clients & Profils',
      nfcRegistry: 'Registre Cartes NFC',
      transfers: 'Validation Virements',
      graceSuspension: 'Période de grâce & Suspension',
      configuration: 'Paramètres Système',
    },
    about: {
      missionTag: 'Notre Mission au Maroc',
      missionTitle: 'Redéfinir le premier contact des entrepreneurs marocains',
      p1: 'TAGTOP est née d’un constat évident : les cartes de visite papier traditionnelles finissent oubliées ou jetées, alors que chaque rencontre physique d’affaires est une opportunité précieuse.',
      p2: 'Nous avons conçu une solution matérielle et logicielle haut de gamme, adaptée aux réalités et exigences des professionnels au Maroc : des cartes PVC mates d’une grande élégance tactile, associées à un profil professionnel dynamique, accessible instantanément sans application et respectueux du consentement de vos interlocuteurs.',
      designedInMorocco: 'Conçu au Maroc',
      cities: 'Casablanca & Royaume',
      craftsmanship: 'Artisanat & Contrôle',
      proofValidated: 'Chaque BAT validé',
      founderCommitment: 'Engagement Fondateur',
      founderQuoteTitle: 'Une relation directe et humaine avec chaque client',
      founderQuote: '« Chez TAGTOP, nous ne déléguons pas votre identité à un algorithme impersonnel. Avant toute impression de carte NFC, je vérifie personnellement la qualité de votre logo, prépare votre bon à tirer et vous le soumets directement sur WhatsApp. Vous ne payez votre carte qu’à la livraison après vérification du colis. »',
      founderTeam: 'L\'Équipe Fondatrice TAGTOP',
      founderSub: 'Maroc · Service Entreprises & Créateurs',
      dedicatedSupport: 'Support Dédié',
    },
    faq: {
      tag: 'Questions Fréquentes',
      title: 'Tout ce que vous devez savoir sur TAGTOP',
      subtitle: 'Des réponses claires pour aborder votre transition vers la carte de visite sans contact.',
      q1: 'Est-ce que tous les smartphones sont compatibles avec la carte TAGTOP ?',
      a1: 'Tous les iPhones récents (iPhone XR, XS, 11, 12, 13, 14, 15, 16 et suivants) lisent les cartes NFC nativement sans aucune configuration. La quasi-totalité des smartphones Android modernes sont également équipés de NFC. Aucun téléchargement d’application n’est requis pour votre interlocuteur.',
      q2: 'Qu’est-ce que l’aperçu privé gratuit ?',
      a2: 'Avant de commander votre carte physique, vous pouvez créer un compte et configurer votre profil complet (bio, services, catalogue, liens, formulaire). Cet aperçu reste strictement confidentiel et accessible uniquement par vous. Il ne sera publié et lié à une carte NFC qu’après validation de votre commande.',
      q3: 'Comment fonctionne le paiement à la livraison (COD) ?',
      a3: 'Pour votre commande de carte physique Starter, vous réglez le montant exact (249 MAD avec logo TAGTOP ou 349 MAD sans logo TAGTOP) directement en espèces au livreur lors de la remise de votre colis en main propre.',
      q4: 'Comment s’effectuent les renouvellements après les 6 premiers mois inclus ?',
      a4: 'Les renouvellements (99 MAD pour 6 mois, puis 199 MAD par an) s’effectuent par virement bancaire manuel vers notre compte bancaire marocain (CIH Bank). Vous transmettez votre avis de virement via WhatsApp à notre fondateur qui valide manuellement votre période.',
      q5: 'Que se passe-t-il si j’oublie de renouveler à temps (Période de grâce) ?',
      a5: 'TAGTOP applique une période de grâce de 14 jours. Durant ces 14 jours, votre carte et votre profil public restent parfaitement actifs et fonctionnels, avec une simple alerte dans votre espace client. Si aucun virement n’est confirmé après 14 jours, le profil public affiche un message discret d’indisponibilité, tout en conservant intacts tous vos contenus privés.',
      q6: 'Puis-je modifier mes informations après réception de ma carte ?',
      a6: 'Oui, à tout moment et de manière illimitée depuis votre Espace Client TAGTOP. Le lien encodé dans votre carte NFC renvoie directement vers votre profil dynamique en ligne, sans jamais avoir besoin de réimprimer une carte.',
    },
    legal: {
      backToSite: 'Retour au site principal',
      disclaimerTitle: 'Document type pour révision juridique :',
      disclaimerText: 'Cette notice contractuelle constitue un modèle préparatoire destiné à la révision et validation finale par le conseil juridique du titulaire de TAGTOP (conforme aux dispositions de la loi marocaine n° 09-08 relative à la protection des données à caractère personnel).',
      termsTitle: 'Conditions Générales de Vente et d’Utilisation',
      privacyTitle: 'Politique de Confidentialité & Données Personnelles',
      termsS1Title: '1. Objet & Prestations',
      termsS1Text: 'Les présentes Conditions régissent la vente des cartes physiques sans contact NFC commercialisées sous la marque TAGTOP au Maroc, ainsi que l’accès au service d’hébergement du profil professionnel digital associé.',
      termsS2Title: '2. Modalités de Commande & Bon à Tirer (BAT)',
      termsS2Text: 'Toute commande de carte avec personnalisation d’artwork donne lieu à l’émission d’un bon à tirer électronique soumis au client via WhatsApp ou interface web. La production matérielle ne débute qu\'après approbation expresse du BAT par le client.',
      termsS3Title: '3. Paiement à la Livraison & Renouvellements',
      termsS3Text: 'Les cartes physiques Starter (249 MAD avec logo TAGTOP ou 349 MAD sans logo TAGTOP) sont payables en dirhams marocains (MAD) en espèces lors de la livraison (Cash on Delivery). L\'abonnement initial de six (6) mois est inclus. Les renouvellements ultérieurs (99 MAD pour 6 mois, puis 199 MAD par an) s\'effectuent par virement bancaire manuel vérifié par le fondateur.',
      termsS4Title: '4. Période de Grâce & Suspension',
      termsS4Text: 'À l’issue de la période souscrite, une période de grâce de quatorze (14) jours calendaires est accordée durant laquelle le profil demeure actif. Passé ce délai sans régularisation, le profil public est suspendu de manière discrète sans communication des données de facturation.',
      privacyS1Title: '1. Collecte des Données Professionnelles',
      privacyS1Text: 'TAGTOP collecte uniquement les données nécessaires à la configuration de la carte physique et du profil professionnel digital (nom, fonction, société, coordonnées téléphoniques, liens web).',
      privacyS2Title: '2. Séparation Stricte du Consentement (Leads vs Contact Direct)',
      privacyS2Text: 'Un simple tapotement NFC de la carte ne recueille aucune information sur l\'interlocuteur. Seul le remplissage volontaire du formulaire de mise en relation par le visiteur transmet ses coordonnées. L\'acceptation d\'offres promotionnelles fait l\'objet d\'une case à cocher distincte, non pré-cochée.',
      privacyS3Title: '3. Conformité Loi 09-08',
      privacyS3Text: 'Conformément à la législation marocaine, les utilisateurs disposent d’un droit d\'accès, de rectification et d\'opposition sur leurs données personnelles en écrivant au service support TAGTOP.',
    },
    demoPage: {
      backHome: 'Retour à l’accueil',
      badge: 'Démonstration Interactive Officielle',
      note: 'Données fictives de démonstration marocaine',
      title: 'Expérience Visiteur Profil NFC',
      orderCta: 'Commander ma carte NFC',
      businessExamples: 'Exemples Métiers :',
      demoLeadAlert: 'Démonstration : Prospect reçu pour',
    },
    quoteModal: {
      submittedTitle: 'Demande de devis transmise',
      submittedDesc: 'Le fondateur TAGTOP étudiera votre demande et vous contactera rapidement avec une proposition chiffrée sur mesure.',
      title: 'Demander un devis sur mesure',
      subtitle: 'Tarification personnalisée pour équipes et volumes au Maroc.',
      tierBadgePro: 'Formule Pro · Sur Devis',
      tierBadgeEnterprise: 'Formule Entreprise · Sur Devis',
      nameLabel: 'Votre Nom *',
      phoneLabel: 'Téléphone (+212) *',
      emailLabel: 'Email professionnel *',
      companyLabel: 'Entreprise / Organisme',
      quantityLabel: 'Nombre de cartes estimé',
      notesLabel: 'Besoins spécifiques / Personnalisation',
      notesPlaceholder: 'Ex : Charte graphique entreprise, profils séparés...',
      submitBtn: 'Envoyer ma demande de devis',
      close: 'Fermer',
    },
    nfcCard: {
      cardLabel: 'Carte NFC TAGTOP',
      holderLabel: 'Titulaire Professionnel',
      secureChip: 'MAROC · SECURE CHIP',
      backInstructions: 'Approchez cette carte de tout smartphone compatible pour accéder instantanément au profil professionnel. Sans application.',
      poweredBy: 'PROPULSÉ PAR',
      bespokeCard: 'CARTE SUR MESURE PRIVÉE',
      madeForMorocco: 'FABRIQUÉ POUR LE MAROC',
      flipFront: 'Voir le recto',
      flipBack: 'Retourner la carte (verso)',
      tiltHint: 'Inclinez avec la souris',
      sampleBusinessTitle: 'Architecture & Scénographie',
      nfcTap: 'NFC Tap',
      nfcIdLabel: 'ID NFC',
      isoStandard: 'ISO/IEC 14443-A',
      matteBlack: 'Noir Mat',
      matteWhite: 'Blanc Mat',
    },
    customerDashboard: {
      ownerSpace: 'Espace Propriétaire',
      accountLabel: 'Compte :',
      orderNewCard: 'Commander une nouvelle carte',
      graceBannerTitle: 'Période de grâce de 14 jours active pour',
      graceBannerDesc: 'Votre profil reste public et accessible par NFC. Date limite de renouvellement :',
      graceBannerAction: 'Régulariser par virement (99 MAD)',
      previewBannerTitle: 'Ce profil est actuellement en APERÇU PRIVÉ GRATUIT',
      previewBannerDesc: 'Visible uniquement par vous. Pour publier ce profil en ligne et l\'associer à une puce NFC, une commande de carte physique est requise.',
      previewBannerAction: 'Commander la carte pour publier',
      profileStatus: 'Statut du profil',
      expiryLabel: 'Échéance :',
      anonymousViews: 'Consultations anonymes',
      tapsAndScans: 'Taps NFC & scans QR au Maroc',
      collectedLeads: 'Prospects collectés (Leads)',
      formsSubmittedWithConsent: 'Formulaires soumis avec consentement',
      timelineTitle: 'Calendrier de votre abonnement standard',
      stage1Title: '1. 6 premiers mois',
      stage1Value: 'Inclus avec la carte',
      stage1ActiveUntil: 'Statut : Actif jusqu\'au',
      stage2Title: '2. 6 mois suivants',
      stage2Value: '99 MAD',
      stage2Manual: 'Virement bancaire manuel',
      stage3Title: '3. Périodes annuelles',
      stage3Value: '199 MAD / an',
      stage3Continuity: 'Continuité et mises à jour illimitées',
      recentLeadsTitle: 'Derniers contacts reçus via le formulaire',
      viewAllLeads: 'Voir tous les prospects',
      individual: 'Particulier',
      openWhatsApp: 'Ouvrir WhatsApp',
      call: 'Appeler',
      editorTitle: 'Éditeur de Profil Digital :',
      editorSubtitle: 'Modifications instantanées synchronisées avec votre carte NFC.',
      editBtn: 'Modifier',
      previewBtn: 'Aperçu Live',
      savedToast: 'Modifications enregistrées avec succès !',
      templateLabel: 'Modèle graphique',
      displayNameLabel: 'Nom affiché',
      jobTitleLabel: 'Titre / Poste',
      companyLabel: 'Entreprise',
      cityLabel: 'Ville au Maroc',
      bioLabel: 'Bio / Présentation',
      phoneLabel: 'Téléphone cellulaire',
      whatsappLabel: 'WhatsApp',
      emailLabel: 'Email professionnel',
      websiteLabel: 'Site Web',
      brandingNoticeTitle: 'Marquage digital TAGTOP :',
      brandingNoticeDesc: 'La suppression de la mention TAGTOP dans le pied de page du profil digital est une option d\'abonnement avancée distincte de la suppression physique sur la carte. Actuellement non configurée au lancement.',
      myCardsOrdersTitle: 'Mes Cartes & Commandes',
      myCardsOrdersSubtitle: 'Suivi de production, validation des maquettes (BAT) et encodage.',
      newOrderBtn: 'Nouvelle commande',
      stepReceived: '1. Reçue',
      stepProofReview: '2. Validation BAT',
      stepEncodingFab: '3. Encodage & Fab',
      stepDelivered: '4. Livrée (COD)',
      proofReadyTitle: 'Bon à Tirer (BAT) prêt pour validation',
      proofReadyDesc: 'Le visuel d\'impression a été préparé par le fondateur. Veuillez valider la maquette ou formuler vos remarques.',
      approveProofBtn: 'Approuver le bon à tirer (BAT)',
      requestProofChangeBtn: 'Demander une modification',
      proofRemarksPrompt: 'Indiquez vos remarques ou modifications souhaitées pour le fondateur :',
      proofRemarksSentAlert: 'Vos remarques ont été transmises au fondateur pour modification du BAT.',
      linkedProfile: 'Profil lié :',
      paymentLabel: 'Règlement :',
      paidOnDelivery: 'Payé à la livraison',
      dueOnDelivery: 'Dû à la livraison',
      leadsTitle: 'Prospects Volontaires Reçus',
      leadsSubtitle: 'Coordonnées transmises par vos contacts via votre profil NFC.',
      searchPlaceholder: 'Rechercher un contact...',
      colName: 'Nom & Entreprise',
      colPhone: 'Téléphone',
      colEmail: 'Email',
      colDate: 'Date',
      colPromo: 'Opt-in Promo',
      colContact: 'Contacter',
      optInYes: 'Oui (Consenti)',
      optInNo: 'Non',
      analyticsNoteTitle: 'Statistiques de consultation :',
      analyticsNoteDesc: 'Données de démonstration marocaines représentatives. Un événement « Enregistrer le contact » correspond au clic ou téléchargement du vCard, sans garantie d\'enregistrement dans le carnet d\'adresses de l\'utilisateur.',
      metricTaps: 'Taps & Visites Profil',
      metricWhatsApp: 'Clics WhatsApp',
      metricVCard: 'Téléchargements vCard',
      metricForms: 'Formulaires Soumis',
      subscriptionTitle: 'Abonnement & Renouvellement Manuel',
      subscriptionSubtitle: 'Au Maroc, les renouvellements TAGTOP se règlent par virement bancaire vérifié manuellement par le fondateur.',
      renewalSubmittedToast: 'Votre avis de virement a été transmis au fondateur pour vérification. Votre accès sera prolongé dès validation.',
      bankDetailsTitle: 'Coordonnées Bancaires Officielles TAGTOP',
      claimTransferTitle: 'Déclarer un virement bancaire effectué',
      renewalPeriodLabel: 'Période à renouveler',
      option6Months: 'Étape 2 : 6 mois supplémentaires (99 MAD)',
      optionAnnual: 'Étape 3 : 1 an renouvellement (199 MAD)',
      receiptRefLabel: 'Référence de virement ou numéro de reçu CIH / AWB',
      receiptPlaceholder: 'ex: CIH-VIR-20261026-9042',
      submitVerificationBtn: 'Transmettre pour vérification',
      confirmWhatsAppBtn: 'Confirmer sur WhatsApp',
      settingsTitle: 'Paramètres & Application Web (PWA)',
      settingsSubtitle: 'Configuration de votre compte et instructions d\'installation de l\'application web.',
      pwaTitle: 'Installer TAGTOP sur votre écran d\'accueil (PWA)',
      pwaDesc: 'L\'application TAGTOP fonctionne comme une Progressive Web App (PWA) sans téléchargement sur l\'App Store ou Google Play.',
      pwaIphone: 'Sur iPhone (Safari) : Appuyez sur l\'icône de partage puis « Sur l\'écran d\'accueil ».',
      pwaAndroid: 'Sur Android (Chrome) : Appuyez sur le menu (trois points) puis « Installer l\'application ».',
      renewal6MonthsLabel: 'Renouvellement 6 mois supplémentaires (99 MAD)',
      renewalAnnualLabel: 'Renouvellement annuel (199 MAD)',
      pendingManualVerification: 'En attente de vérification manuelle par le fondateur.',
      orderStatusReceived: 'Reçue',
      orderStatusArtworkReview: 'Revue maquette (BAT)',
      orderStatusCustomerApproved: 'Validée par le client',
      orderStatusProduction: 'En fabrication',
      orderStatusLinked: 'Puce associée',
      orderStatusShipped: 'Expédiée',
      orderStatusDelivered: 'Livrée',
    },
    founderDashboard: {
      adminBadge: 'Accès Administrateur Unique',
      founderTitle: 'Fondateur TAGTOP',
      viewCustomerPortal: 'Voir Espace Client',
      tabOverview: 'Vue d’ensemble',
      tabCustomers: 'Clients & Profils',
      tabOrders: 'Commandes & BAT',
      tabNfcRegistry: 'Registre Puces NFC',
      tabTransfers: 'Virements Bancaires',
      tabGrace: 'Période de grâce & Suspension',
      tabConfiguration: 'Configuration & Tarifs',
      ordersToProcess: 'Commandes à traiter',
      pendingProofs: 'BAT en attente',
      activeNfcCards: 'Cartes NFC Actives',
      encoded100: '100% encodées',
      transfersToVerify: 'Virements à vérifier',
      whatsAppReceipts: 'Reçus WhatsApp',
      inGracePeriod: 'En Période de Grâce',
      max14Days: '14 jours max',
      prioritiesTitle: 'Priorités de gestion du fondateur',
      proofsWaitingDesc: 'maquette(s) en attente de révision du bon à tirer (BAT).',
      reviewProofsBtn: 'Examiner les BAT',
      transfersWaitingDesc: 'avis de virement bancaire pour renouvellement en attente.',
      verifyTransfersBtn: 'Valider les virements',
      customersTitle: 'Clients & Profils Enregistrés',
      profilesManaged: 'profils gérés',
      colHolder: 'Titulaire & Entreprise',
      colCity: 'Ville',
      colAccessStatus: 'Statut d\'accès',
      colExpiry: 'Échéance',
      colLinkedCards: 'Cartes liées',
      colChangeStatus: 'Changer Statut',
      ordersTitle: 'Gestion des Commandes & Bons à Tirer (BAT)',
      ordersSubtitle: 'Contrôle de production, préparation du visuel, suivi de livraison COD.',
      codCollected: 'COD Encaissé',
      codPending: 'COD En attente',
      cardFinish: 'Finition carte :',
      linkedProfile: 'Profil associé :',
      orderStage: 'Étape commande :',
      codPayment: 'Règlement COD :',
      paymentConfirmed: 'Paiement confirmé',
      markCollected: 'Marquer encaissé',
      registryTitle: 'Registre Officiel des Cartes & Puces NFC',
      registrySubtitle: 'Traçabilité physique des identifiants matériels (UID) associés aux profils TAGTOP.',
      colHardwareUid: 'UID Matériel',
      colSerialNumber: 'N° de Série',
      colFinish: 'Finition',
      colProfile: 'Profil Associé',
      colChipStatus: 'Statut Puce',
      transfersTitle: 'Validation Manuelle des Virements Bancaires',
      transfersSubtitle: 'Vérifiez les reçus de renouvellement avant de prolonger l\'accès au profil.',
      amountReceived: 'Montant reçu :',
      concernedProfile: 'Profil concerné :',
      approveAndExtend: 'Approuver & Prolonger l\'accès',
      reject: 'Rejeter',
      rejectPrompt: 'Motif de rejet du virement :',
      approvedNotes: 'Virement validé par le fondateur',
      graceTitle: 'Gestion de la Grâce (14 Jours) & Suspension',
      graceSubtitle: 'Surveillance des profils arrivés à échéance. Suspension discrète sans fuite de données privées.',
      restoreAccess: 'Rétablir l’accès',
      discreetlySuspend: 'Suspendre discrètement',
      settingsTitle: 'Paramètres Système & Tarifs TAGTOP',
      settingsSubtitle: 'Configuration des montants confirmés et du statut de lancement des accessoires.',
      savedToast: 'Paramètres sauvegardés avec succès !',
      starterBrandedLabel: 'Starter avec logo TAGTOP (MAD)',
      fixedAt249: 'Fixé à 249 MAD',
      starterUnbrandedLabel: 'Starter sans logo TAGTOP (MAD)',
      fixedAt349: 'Fixé à 349 MAD',
      renewal6MonthsLabel: 'Renouvellement 6 mois (MAD)',
      fixedAt99: 'Fixé à 99 MAD',
      renewalAnnualLabel: 'Renouvellement annuel (MAD)',
      fixedAt199: 'Fixé à 199 MAD',
      woodenStandCheckbox: 'Activer la vente du support en bois massif (Actuellement désactivé au lancement)',
      woodenStandHelp: 'Tant que cette case reste décochée, le support est affiché comme « Bientôt disponible » et n\'est pas facturable.',
      supportWhatsAppLabel: 'Numéro WhatsApp officiel pour les confirmations de virement',
      updateSettingsBtn: 'Mettre à jour les paramètres',
      finishBlack: 'PVC Noir',
      finishWhite: 'PVC Blanc',
      withLogo: 'Avec logo TAGTOP',
      withoutLogo: 'Sans logo TAGTOP',
      statusActive: 'Actif',
      statusInTransit: 'En transit',
      statusPending: 'En attente',
      statusApproved: 'Approuvé',
      statusRejected: 'Rejeté',
      orderStep1: '1. Reçue',
      orderStep2: '2. BAT en cours',
      orderStep3: '3. BAT Approuvé',
      orderStep4: '4. En fabrication',
      orderStep5: '5. Puce liée',
      orderStep6: '6. Expédiée',
      orderStep7: '7. Livrée',
    },
    app: {
      proofModificationSentAlert: 'Vos remarques ont été transmises au fondateur pour modification du BAT.',
      backToSite: '← Retour au site TAGTOP',
      livePreviewOf: 'Aperçu en direct du profil',
    },
    footer: {
      mission: 'Cartes de visite NFC d\'exception et profils professionnels digitaux pour les entrepreneurs et entreprises au Maroc.',
      cities: 'Casablanca · Rabat · Marrakech · Tanger · Fès · Agadir',
      navTitle: 'Navigation',
      spacesTitle: 'Espaces & Solutions',
      cardConfigurator: 'Configurateur de Carte',
      liveDemo: 'Démonstration Profil Public Live',
      paymentTitle: 'Paiement & Confiance',
      paymentDesc: 'Cartes physiques livrées en paiement à la livraison (Cash on Delivery). Renouvellements d\'accès validés par virement bancaire sécurisé.',
      copyright: 'Tous droits réservés. Fabriqué pour le Maroc.',
      privacy: 'Politique de Confidentialité',
      terms: 'Conditions d\'Utilisation',
      cashOnDelivery: 'Paiement à la livraison (COD)',
      cihBank: 'Virement CIH Bank',
      ntagCertified: 'Certifié NTAG',
    },
  },
  ar: {
    common: {
      brandName: 'TAGTOP',
      brandTagline: 'بطاقات العمل الذكية بتقنية NFC والملفات التعريفية الرقمية في المغرب',
      currency: 'درهم',
      language: 'اللغة',
      clientArea: 'فضاء الزبون',
      founderAdmin: 'إدارة المنصة',
      viewSite: 'العودة للموقع',
      publicSite: 'الموقع الرئيسي',
      liveProfile: 'معاينة الملف المباشر',
      freePreviewCTA: 'إنشاء معاينة مجانية',
      orderCardCTA: 'طلب بطاقة NFC',
      exploreCardsCTA: 'اكتشف البطاقات',
      saveContactCTA: 'حفظ جهة الاتصال',
      whatsappCTA: 'واتساب',
      callCTA: 'اتصال هاتف',
      shareCTA: 'مشاركة',
      loading: 'جاري التحميل...',
      save: 'حفظ التغييرات',
      cancel: 'إلغاء',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'متابعة',
      status: 'الحالة',
      actions: 'إجراءات',
      demoNote: 'بيانات تجريبية مغربية توضيحية',
      reassuranceBadge: 'معاينة خاصة مجانية. يلزم شراء بطاقة لتفعيل النشر للعموم.',
      active: 'نشط',
      privatePreview: 'معاينة خاصة',
      gracePeriod: 'فترة سماح',
      suspended: 'معلق',
      individual: 'فردي',
      copied: 'تم النسخ!',
      morocco: 'المغرب',
      ariaHome: 'الرئيسية TAGTOP',
      ariaSwitchLang: 'تغيير اللغة إلى',
      ariaMainMenu: 'القائمة الرئيسية',
      templateExecutive: 'تنفيذي',
      templateCreative: 'إبداعي',
      templateArtisan: 'حرفي',
    },
    nav: {
      home: 'الرئيسية',
      howItWorks: 'كيف تعمل',
      features: 'المزايا',
      cards: 'البطاقات والإكسسوارات',
      pricing: 'الأسعار',
      demo: 'تجربة الملف الشخصي',
      about: 'عن TAGTOP',
      faq: 'الأسئلة الشائعة',
      contact: 'اتصال وعروض أسعار',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب تجريبي',
    },
    hero: {
      headline: 'حركة واحدة. كل علاقاتك المهنية.',
      subheadline: 'بطاقة عمل ذكية فاخرة بتقنية NFC تفتح ملفك المهني الشامل فوراً، وتتيح مشاركة أرقامك وخدماتك واستقبال جهات الاتصال دون الحاجة لأي تطبيق.',
      primaryCta: 'إنشاء معاينة مجانية',
      secondaryCta: 'اكتشف البطاقات',
      reassurance: 'معاينة خاصة مجانية. يلزم شراء بطاقة لتفعيل النشر للعموم.',
      pauseAnimation: 'إيقاف العرض التوضيحي',
      playAnimation: 'تشغيل العرض التوضيحي',
      interactiveDemoTitle: 'عرض تفاعلي لتقنية NFC',
      tapPrompt: 'قرب البطاقة من الهاتف لإظهار الملف المهني المتكامل',
      codBadge: 'الدفع نقداً عند الاستلام (COD)',
      preEncodedBadge: 'بطاقات مبرمجة وجاهزة فوراً',
      compatibilityBadge: 'متوافقة مع آيفون وأندرويد',
      pause: 'إيقاف مؤقت',
      play: 'تشغيل',
      sampleJob: 'هندسة الديكور الداخلي',
      samplePrice: 'ابتداءً من 15,000 درهم',
      sampleLocation: 'أتيليه أطلس ديزاين · الدار البيضاء',
    },
    howItWorks: {
      title: 'تجربة انسيابية من العالم الرقمي إلى الواقعي',
      subtitle: 'صمم ملفك الشخصي بكل ثقة، واطلب بطاقتك لتصلك جاهزة للاستخدام في جميع مدن المغرب.',
      badge: 'خطوات بسيطة وموثوقة',
      step1Title: '01. معاينة خاصة مجانية',
      step1Desc: 'أنشئ ملفك الرقمي، وأضف خدماتك وبيانات التواصل. تظل هذه المعاينة سرية وخاصة بك فقط حتى تأكيد طلبك.',
      step1Highlight: 'خاص 100% وبدون أي التزام',
      step2Title: '02. اختيار البطاقة وتخصيصها',
      step2Desc: 'اختر اللون الأسود أو الأبيض غير اللامع، بشعار TAGTOP أو بهويتك البصرية الحصرية 100%.',
      step2Highlight: 'أسود أو أبيض مطفي فاخر',
      step3Title: '03. مراجعة النموذج الأولي والبرمجة',
      step3Desc: 'يقوم مؤسس TAGTOP بإعداد التصوير الطباعي وإرساله لك عبر واتساب للموافقة، ثم برمجة شريحة NFC بملفك الخاص.',
      step3Highlight: 'موافقة على النموذج عبر واتساب',
      step4Title: '04. استلام بطاقة جاهزة للعمل',
      step4Desc: 'توصيل مع الدفع عند الاستلام في كل أنحاء المغرب. تعمل بطاقتك بمجرد لمسها لأي هاتف حديث.',
      step4Highlight: 'الدفع عند الاستلام في المغرب',
    },
    features: {
      title: 'مصممة خصيصاً لرواد الأعمال والمهنيين في المغرب',
      subtitle: 'تقنية عصرية لتعزيز مكانة علامتك التجارية وتسهيل عقد الصفقات واللقاءات.',
      badge: 'التكنولوجيا وجودة التصنيع',
      f1Title: 'بدون أي تطبيق',
      f1Desc: 'لمسة واحدة تفتح ملفك فوراً في متصفح الطرف الآخر على هواتف آيفون وأندرويد دون تثبيت أي برامج.',
      f2Title: 'حفظ مباشر لجهة الاتصال (vCard)',
      f2Desc: 'إمكانية تنزيل وحفظ بياناتك بالكامل في سجل الهاتف بضغطة زر واحدة.',
      f3Title: 'عرض المنتجات والخدمات',
      f3Desc: 'اعرض باقاتك، أسعارك بالدرهم المغربي، كتالوجات PDF والروابط الخارجية مباشرة.',
      f4Title: 'جمع جهات اتصال بموافقة واضحة',
      f4Desc: 'نموذج أنيق لاستقبال بيانات المهتمين مع فصل صريح بين طلب التواصل والموافقة على العروض.',
      f5Title: 'تحديث فوري للمعلومات',
      f5Desc: 'عدل رقمك أو نشاطك في أي وقت من لوحة التحكم دون الحاجة لإعادة طباعة بطاقة جديدة.',
      f6Title: 'صناعة متقنة ومقاومة',
      f6Desc: 'مادة PVC عالية الجودة مقاومة للماء والخدوش مع هوائي NFC فائق الدقة والاستجابة.',
    },
    cards: {
      title: 'بطاقات عملية متينة بملمس فاخر',
      subtitle: 'ملمس مطفي أنيق مانع للبصمات، وشريحة محمية لضمان استخدام طويل الأمد.',
      badge: 'المواد وجودة التصنيع',
      matteBlack: 'أسود مطفي كلاسيكي',
      matteWhite: 'أبيض مطفي نقي',
      brandedTitle: 'بطاقة مع شعار TAGTOP',
      brandedDesc: 'تحتوي على شعار TAGTOP الأنيق في ظهر البطاقة. خيار اقتصادي ومثالي لأصحاب المشاريع المستقلة.',
      unbrandedTitle: 'بطاقة مخصصة بالكامل 100%',
      unbrandedDesc: 'خالية تماماً من أي علامة لـ TAGTOP على البطاقة المادية. تظهر فقط هويتك وشعارك الخاص.',
      brandedOption: 'مع شعار TAGTOP (249 درهم)',
      unbrandedOption: 'بدون شعار TAGTOP (349 درهم)',
      woodenStandTitle: 'حامل مكتبي خشبي طبيعي',
      woodenStandStatus: 'قريباً',
      woodenStandDesc: 'إكسسوار مكتبي مصنوع يدوياً من الخشب الطبيعي. قيد التجهيز وسيتوفر للشراء قريباً.',
      woodenStandDisclaimer: 'وفقاً لتعليمات الإطلاق، هذا الإكسسوار للعرض فقط وغير مشمول في حساب المجموع حالياً.',
      specsTitle: 'مواصفات بطاقة PVC الذكية بتقنية NFC',
      specFormat: 'حجم البطاقة البنكية القياسي: الأبعاد 85.60 × 53.98 مم، سمك ممتاز 0.84 مم.',
      specFinish: 'ملمس مطفي ناعم: جودة عالية مقاومة للخدوش الخفيفة وبصمات الأصابع.',
      specChip: 'شريحة NTAG فائقة الاستجابة: متوافقة 100% مع كافة الهواتف المزودة بـ NFC وبدون بطارية.',
      specReady: 'جاهزة للعمل فوراً: يقوم فريق TAGTOP ببرمجة الشريحة بملفك الرقمي مباشرة قبل الشحن.',
      customizeCta: 'تخصيص بطاقتي في المخصص',
    },
    pricing: {
      title: 'أسعار واضحة ومحددة بكل شفافية',
      subtitle: 'استثمار مادي لبطاقتك يتضمن فترة حضورك الرقمي الأولى دون أي رسوم خفية.',
      badge: 'شفافية تامة',
      recommendedBadge: 'الباقة الموصى بها',
      cardCount1: 'بطاقة NFC واحدة',
      cardCount5: 'حزمة 5 بطاقات',
      volumeBadge: 'طلبات الجملة والمؤسسات',
      starterTitle: 'باقة ستارتـر (Starter)',
      starterBrandedBadge: '249 درهم (مع شعار TAGTOP)',
      starterUnbrandedBadge: '349 درهم (بدون شعار TAGTOP)',
      starterBrandedTag: '(مع شعار TAGTOP)',
      starterOr: 'أو 349 درهم',
      starterUnbrandedTag: '(بدون شعار TAGTOP على البطاقة)',
      starterFeature1: 'بطاقة PVC واحدة بلون أسود أو أبيض مطفي فاخر',
      starterFeature2: 'أول 6 أشهر من الاستضافة الرقمية متضمنة مجاناً',
      starterFeature3: 'ملف مهني رقمي متكامل دون الحاجة لأي تطبيق',
      starterFeature4: 'مراجعة نموذج الطباعة والموافقة عليه عبر واتساب',
      starterFeature5: 'الدفع نقداً عند الاستلام في جميع مدن المغرب',
      starterCta: 'تخصيص باقة ستارتـر',
      proTitle: 'باقة المحترفين Pro (حزمة 5 بطاقات)',
      proSubtitle: 'تسعير مخصص يناسب احتياجات فريقك المشترك',
      proDesc: 'للفرق الصغيرة والمكاتب المشتركة المدارة بواسطة صاحب عمل واحد.',
      proQuote: 'طلب عرض أسعار',
      proFeature1: '5 بطاقات ذكية مع حرية توزيعها بين أعضاء الفريق',
      proFeature2: 'ربط عدة بطاقات بملف واحد أو ملفات مستقلة',
      proFeature3: 'إدارة مركزية من حساب مالك واحد',
      proFeature4: 'إمكانية الاختيار مع أو بدون شعار TAGTOP',
      proCta: 'طلب عرض أسعار Pro',
      enterpriseTitle: 'باقة المؤسسات',
      enterpriseSubtitle: 'طلبات مجمعة للشركات والهيئات الكبرى بالمغرب',
      enterpriseDesc: 'للطلبات الكبيرة والشركات والهيئات في جميع أنحاء المملكة.',
      enterpriseQuote: 'طلب عرض أسعار',
      enterpriseFeature1: 'كميات ابتداءً من 10 بطاقات مخصصة فأكثر',
      enterpriseFeature2: 'تطبيق كامل للهوية البصرية لشركتك',
      enterpriseFeature3: 'متابعة خاصة ومباشرة من مؤسس TAGTOP',
      enterpriseFeature4: 'فاتورة نظامية مغربية للشركات (SARL)',
      enterpriseCta: 'طلب عرض أسعار للمؤسسات',
      timelineTitle: 'جدول الحضور الرقمي المتضمن والتجديد',
      stage1Label: 'المرحلة 1',
      stage1Title: 'المرحلة 1: أول 6 أشهر متضمنة مجاناً',
      stage1Desc: 'متضمنة مع ثمن البطاقة المادية. لا توجد أي تكلفة إضافية للبدء.',
      stage1Included: '0 درهم متضمنة',
      stage2Label: 'المرحلة 2',
      stage2Title: 'المرحلة 2: الـ 6 أشهر التالية',
      stage2Desc: '99 درهم فقط لتمديد تفعيل الملف الرقمي لـ 6 أشهر إضافية (تحويل بنكي يدوي).',
      stage2Per6Months: '99 درهم / 6 أشهر',
      stage3Label: 'المرحلة 3',
      stage3Title: 'المرحلة 3: الفترات السنوية اللاحقة',
      stage3Desc: '199 درهم سنوياً للاستمرار في الخدمة والتمتع بكافة التحديثات والميزات.',
      stage3PerYear: '199 درهم / سنوياً',
      renewalNotice: 'تجديد يدوي عبر تحويل بنكي يتم التحقق منه بواسطة المؤسس عبر واتساب. لا يوجد اقتطاع بنكي تلقائي.',
      graceGuarantee: 'فترة سماح مضمونة لمدة 14 يوماً: عند انتهاء الصلاحية، يظل ملفك نشطاً لمدة 14 يوماً مع تنبيه هادئ في فضاء الزبون. بعد ذلك يتم تعليق الملف العام بسرية تامة دون كشف أي معلومات خاصة.',
    },
    configurator: {
      title: 'مخصص بطاقة NFC الذكية من TAGTOP',
      badge: 'تخصيص دقيق وعالي الجودة',
      subtitle: 'قم بتهيئة بطاقتك الذكية خطوة بخطوة.',
      stepTier: '1. نوع الباقة',
      stepColor: '2. لون البطاقة',
      stepBranding: '3. نمط الهوية',
      stepArtwork: '4. الشعار والتصميم',
      stepProfile: '5. الملف المرتبط',
      stepAccessory: '6. إكسسوار إضافي',
      stepDelivery: '7. معلومات التوصيل',
      stepSummary: '8. ملخص الطلب',
      stepProofNotice: '9. مراجعة النموذج والطباعة',
      starterPackage: 'ستارتـر (بطاقة واحدة)',
      fromPrice: 'ابتداءً من 249 درهم',
      sixMonthsIncluded: '6 أشهر متضمنة',
      proPackage: 'برو (5 بطاقات)',
      onQuote: 'طلب عرض أسعار',
      smallTeams: 'فرق عمل صغيرة',
      enterprisePackage: 'المؤسسات',
      volumeOrders: 'طلبات الجملة والشركات',
      matteBlack: 'أسود مطفي',
      matteWhite: 'أبيض مطفي',
      brandedOption: 'مع شعار TAGTOP',
      unbrandedOption: 'بدون شعار TAGTOP',
      uploadLogo: 'ارفع شعار شركتك (بصيغة PNG أو SVG أو PDF عالي الدقة)',
      fileChosen: 'الملف :',
      chooseFile: 'اختر ملفاً',
      selectProfile: 'اختر الملف الرقمي الذي سيتم ربطه بهذه البطاقة',
      chipEncodingNote: 'ستتم برمجة شريحة NFC بواسطة TAGTOP لتفتح هذا الملف مباشرة.',
      woodenStandTitle: 'حامل مكتبي خشبي طبيعي',
      comingSoon: 'قريباً',
      woodenStandNotice: 'الحامل المكتبي المصنوع يدوياً قيد التجهيز حالياً، وهو غير متوفر للشراء ومستثنى من قيمة الطلب.',
      cityLabel: 'المدينة في المغرب',
      cityPlaceholder: 'مثال: الدار البيضاء، الرباط، مراكش...',
      addressLabel: 'عنوان التوصيل بالتفصيل',
      addressPlaceholder: 'الحي، الشارع، رقم المبنى...',
      phoneLabel: 'رقم الهاتف للتواصل والتسليم (+212)',
      phonePlaceholder: '+212 6...',
      fullNameLabel: 'الاسم الكامل للمستلم',
      namePlaceholder: 'مثال: ياسين بناني',
      codNotice: 'الدفع نقداً عند الاستلام (COD) عند وصول البطاقة إلى عنوانك.',
      proofNoticeDesc: 'يقوم المؤسس بإعداد مسودة الطباعة وإرسالها لك. لن تبدأ الطباعة إلا بعد موافقتك الصريحة عبر واتساب.',
      submitOrder: 'تأكيد الطلب (الدفع عند الاستلام)',
      orderSuccessTitle: 'تم تسجيل طلبك بنجاح',
      orderSuccessDesc: 'سيتواصل معك فريق TAGTOP عبر واتساب لمراجعة التصميم النهائي قبل الطباعة.',
      orderNumberLabel: 'رقم الطلب :',
      amountDueLabel: 'المبلغ المستحق عند التسليم (COD) :',
      linkedProfileLabel: 'الملف المرتبط :',
      deliveryAddressLabel: 'عنوان التوصيل :',
      nextStepProofTitle: 'الخطوة التالية - مراجعة النموذج الأولي (BAT) :',
      nextStepProofDesc: 'سيقوم مؤسس TAGTOP بإعداد مسودة الطباعة والتواصل معك على واتساب لأخذ موافقتك قبل بدء الإنتاج.',
      accessDashboardBtn: 'الدخول إلى فضاء الزبون',
      configureAnotherBtn: 'تخصيص بطاقة أخرى',
      livePreviewTitle: 'معاينة حية للبطاقة',
      summaryCardPVC: 'بطاقة NFC بلاستيكية',
      summaryFinish: 'الهوية والطباعة',
      summaryStand: 'الحامل الخشبي',
      summaryStandExcluded: 'غير متضمن (قريباً)',
      summaryPaymentMode: 'طريقة الدفع',
      summaryCOD: 'الدفع نقداً عند الاستلام (COD)',
      summaryTotalDue: 'المجموع المستحق عند الاستلام',
      timelineReminder: 'جدول الاستضافة الرقمية المتضمن :',
      stage1Reminder: '1. أول 6 أشهر :',
      stage1Included: 'متضمنة (0 درهم)',
      stage2Reminder: '2. الـ 6 أشهر التالية :',
      stage2Manual: '99 درهم (تحويل يدوي)',
      stage3Reminder: '3. الفترات السنوية اللاحقة :',
      stage3Annual: '199 درهم / سنوياً',
    },
    profile: {
      saveContactPrompt: 'حفظ جهة الاتصال في الهاتف',
      productsTitle: 'المنتجات والخدمات',
      servicesTitle: 'الخدمات المتاحة',
      documentsTitle: 'الكتالوجات والمستندات',
      videosTitle: 'عرض فيديو توضيحي',
      leadFormTitle: 'شاركني بيانات تواصلك',
      leadFormSubtitle: 'أرسل بياناتك مباشرة لتسهيل التواصل والتعاون المهني.',
      nameField: 'الاسم الكامل',
      phoneField: 'رقم الهاتف',
      emailField: 'البريد الإلكتروني',
      companyField: 'الشركة أو النشاط',
      notesField: 'تفاصيل المشروع أو الاستفسار',
      consentField: 'أوافق على استلام عروض وأخبار جديدة من هذه الشركة (اختياري)',
      submitLead: 'إرسال بياناتي',
      leadSuccess: 'تم إرسال بياناتك بنجاح، شكراً لتواصلك!',
      leadSuccessDesc: 'تم حفظ بياناتك بنجاح في سجل جهات الاتصال.',
      expiredTitle: 'الملف غير متوفر حالياً',
      expiredMessage: 'هذا الملف الشخصي غير متاح حالياً. يرجى التواصل مع صاحبه عبر قنواته الرسمية.',
      digitalFooter: 'مدعوم بتقنية بطاقات TAGTOP الذكية بالمغرب',
      expiredModeBadge: 'وضع: ملف منتهي الصلاحية (مظهر هادئ)',
      viewActiveProfileBtn: 'مشاهدة الملف النشط',
      networkFooter: 'TAGTOP · شبكة بطاقات العمل الذكية في المغرب',
      styleLabel: 'المظهر :',
      testExpiredBtn: 'تجربة شاشة الانتهاء',
      graceWarningText: 'فترة سماح 14 يوماً جارية حتى تاريخ',
      morocco: 'المغرب',
      callAction: 'اتصال هاتف',
      emailAction: 'إرسال بريد',
      websiteAction: 'زيارة الموقع',
      shareAction: 'مشاركة هذا الملف',
      copiedToast: 'تم نسخ الرابط!',
      indicativePrices: 'أسعار تقديرية',
      simulatedDownload: 'تنزيل تجريبي :',
      namePlaceholder: 'الاسم الكامل',
      emailPlaceholder: 'contact@atlasdesign.ma',
      companyPlaceholder: 'شركتك أو نشاطك',
      notesPlaceholder: 'تفاصيل المشروع أو سبب التواصل...',
      digitalFooterNetwork: 'بطاقات عمل ذكية وملفات مهنية رقمية بالمغرب',
    },
    dashboard: {
      customerTitle: 'فضاء الزبون TAGTOP',
      founderTitle: 'لوحة إدارة المؤسس',
      overview: 'نظرة عامة',
      profiles: 'ملفاتي الشخصية',
      cardsOrders: 'البطاقات والطلبات',
      leads: 'جهات الاتصال المستلمة',
      analytics: 'إحصائيات الزيارات',
      subscription: 'الاشتراك والتجديد',
      settings: 'الإعدادات والتطبيق',
      customers: 'إدارة الزبائن والملفات',
      nfcRegistry: 'سجل بطاقات NFC',
      transfers: 'التحقق من التحويلات البنكية',
      graceSuspension: 'فترة السماح والتعليق',
      configuration: 'إعدادات النظام والأسعار',
    },
    about: {
      missionTag: 'مهمتنا في المغرب',
      missionTitle: 'إعادة صياغة اللقاء المهني الأول لرواد الأعمال في المغرب',
      p1: 'انطلقت TAGTOP من ملاحظة بديهية: بطاقات العمل الورقية التقليدية ينتهي بها الأمر منسية أو مهملة، في حين أن كل لقاء عمل مباشر يمثل فرصة ثمينة.',
      p2: 'لقد صممنا حلاً متكاملاً يجمع بين العتاد والبرمجيات الفاخرة، ومناسباً لمتطلبات المهنيين في المغرب: بطاقات PVC مطفية بملمس أنيق، مقترنة بملف رقمي مهني متجدد، يُفتح فوراً دون تطبيق ويحترم خصوصية جهات الاتصال.',
      designedInMorocco: 'صُمم في المغرب',
      cities: 'الدار البيضاء وكافة المملكة',
      craftsmanship: 'حرفية وإتقان',
      proofValidated: 'مراجعة يدوية لكل نموذج',
      founderCommitment: 'التزام المؤسس',
      founderQuoteTitle: 'علاقة مباشرة وإنسانية مع كل عميل',
      founderQuote: '«في TAGTOP، لا نترك هويتك لخوارزميات آلية. قبل طباعة أي بطاقة NFC، أراجع شخصياً جودة شعارك، وأجهز نموذج الطباعة وأرسله لك مباشرة عبر واتساب للموافقة. ولا تدفع ثمن بطاقتك إلا عند الاستلام بعد معاينة الطرد.»',
      founderTeam: 'فريق تأسيس TAGTOP',
      founderSub: 'المغرب · خدمة الشركات والمبدعين',
      dedicatedSupport: 'دعم مخصص',
    },
    faq: {
      tag: 'الأسئلة الشائعة',
      title: 'كل ما تحتاج معرفته عن TAGTOP',
      subtitle: 'إجابات واضحة لتبدأ التحول نحو بطاقات العمل الذكية اللاتلامسية.',
      q1: 'هل تدعم جميع الهواتف الذكية بطاقة TAGTOP ؟',
      a1: 'جميع هواتف آيفون الحديثة (iPhone XR وXS و11 و12 و13 و14 و15 و16 وما بعدها) تقرأ شرائح NFC تلقائياً دون أي إعدادات. كما أن الأغلبية الساحقة من هواتف أندرويد الحديثة تدعم NFC. لا يحتاج الطرف الآخر لتثبيت أي تطبيق.',
      q2: 'ما هي المعاينة الخاصة المجانية ؟',
      a2: 'قبل طلب بطاقتك المادية، يمكنك إنشاء حساب وتجهيز ملفك بالكامل (النبذة، الخدمات، الكتالوج، الروابط، النموذج). يظل هذا الملف سرياً وخاصاً بك وحدك، ولن يُنشر على الإنترنت إلا بعد تأكيد طلبك.',
      q3: 'كيف يعمل خيار الدفع عند الاستلام (COD) ؟',
      a3: 'عند طلب بطاقة ستارتـر، تدفع المبلغ المحدد بدقة (249 درهم مع شعار TAGTOP أو 349 درهم بدون شعاره) نقداً وبشكل مباشر لمسؤول التوصيل عند تسليمك الطرد بيدك.',
      q4: 'كيف يتم تجديد الاشتراك بعد أول 6 أشهر المتضمنة ؟',
      a4: 'يتم التجديد (99 درهم لـ 6 أشهر، أو 199 درهم لسنة كاملة) عبر تحويل بنكي يدوي لحسابنا البنكي بالمغرب (CIH Bank). ترسل إشعار التحويل عبر واتساب لمؤسس TAGTOP الذي يفعل الفترة يدوياً.',
      q5: 'ماذا يحدث إذا تأخرت في التجديد (فترة السماح) ؟',
      a5: 'تمنح TAGTOP فترة سماح لمدة 14 يوماً. خلال هذه المدة، تظل بطاقتك وملفك العام يعملان بكامل الكفاءة مع تنبيه هادئ داخل فضاء الزبون. وإذا لم يتم تأكيد التحويل بعد 14 يوماً، يعرض الملف العام رسالة عدم توفر مؤقتة مع الحفاظ التام على بياناتك.',
      q6: 'هل يمكنني تعديل معلوماتي بعد استلام البطاقة ؟',
      a6: 'نعم، في أي وقت وبشكل غير محدود من خلال فضاء الزبون TAGTOP الخاص بك. الرابط المبرمج في بطاقة NFC يحول الزائر مباشرة إلى ملفك الديناميكي، دون الحاجة أبداً لإعادة طباعة البطاقة.',
    },
    legal: {
      backToSite: 'العودة للموقع الرئيسي',
      disclaimerTitle: 'وثيقة نموذجية للمراجعة القانونية :',
      disclaimerText: 'تعتبر هذه الوثيقة نموذجاً تحضيرياً مخصصاً للمراجعة القانونية وفقاً لمقتضيات القانون المغربي رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.',
      termsTitle: 'الشروط العامة للبيع والاستخدام',
      privacyTitle: 'سياسة الخصوصية وحماية المعطيات الشخصية',
      termsS1Title: '1. الموضوع والخدمات',
      termsS1Text: 'تحدد هذه الشروط بيع بطاقات العمل الذكية اللاتلامسية NFC المسوقة تحت العلامة التجارية TAGTOP في المغرب، بالإضافة إلى خدمة استضافة الملف المهني الرقمي المرتبط بها.',
      termsS2Title: '2. شروط الطلب والنموذج الأولي (BAT)',
      termsS2Text: 'يخضع كل طلب لبطاقة مخصصة لإصدار نموذج طباعي أولي يتم إرساله للعميل عبر واتساب أو واجهة الويب. لا يبدأ التصنيع الفعلي إلا بعد الموافقة الصريحة للعميل على النموذج.',
      termsS3Title: '3. الدفع عند الاستلام والتجديد',
      termsS3Text: 'تُدفع قيمة بطاقات ستارتـر المادية (249 درهم مع شعار TAGTOP أو 349 درهم بدون شعار) بالدرهم المغربي نقداً عند الاستلام (COD). الاشتراك الأولي لـ 6 أشهر متضمن، ويتم التجديد اللاحق (99 درهم لـ 6 أشهر، ثم 199 درهم سنوياً) عبر تحويل بنكي يدوي يدققه المؤسس.',
      termsS4Title: '4. فترة السماح والتعليق',
      termsS4Text: 'عند انقضاء فترة الاشتراك، يُمنح العميل فترة سماح مدتها أربعة عشر (14) يوماً يظل فيها الملف نشطاً. وبعد انقضاء هذه المدة دون تسوية، يُعلق الملف العام بهدوء ودون إظهار أي بيانات مالية.',
      privacyS1Title: '1. جمع البيانات المهنية',
      privacyS1Text: 'تجمع TAGTOP فقط البيانات الضرورية لتهيئة البطاقة المادية والملف المهني الرقمي (الاسم، المنصب، الشركة، الهاتف، الروابط).',
      privacyS2Title: '2. الفصل الصريح للموافقة (جهات الاتصال مقابل العروض)',
      privacyS2Text: 'لا تجمع لمسة NFC أي بيانات عن الزائر تلقائياً. إرسال البيانات يتم فقط عند ملء نموذج التواصل طواعية من الزائر. كما تخضع الموافقة على العروض الترويجية لخيار مستقل تماماً.',
      privacyS3Title: '3. الامتثال للقانون رقم 09-08',
      privacyS3Text: 'وفقاً للتشريعات المغربية، يحق للمستخدمين الوصول إلى معطياتهم الشخصية وتصحيحها أو الاعتراض عليها عبر مراسلة دعم TAGTOP.',
    },
    demoPage: {
      backHome: 'العودة للرئيسية',
      badge: 'عرض توضيحي تفاعلي رسمي',
      note: 'بيانات تجريبية مغربية توضيحية',
      title: 'تجربة زائر الملف الشخصي الذكي',
      orderCta: 'طلب بطاقتي الذكية',
      businessExamples: 'أمثلة الأنشطة والمهن :',
      demoLeadAlert: 'عرض تجريبي : تم استلام جهة اتصال لـ',
    },
    quoteModal: {
      submittedTitle: 'تم إرسال طلب عرض الأسعار',
      submittedDesc: 'سيتواصل معك مؤسس TAGTOP في أقرب وقت بمقترح تسعير مفصل ومخصص لاحتياجات فريقك.',
      title: 'طلب عرض أسعار مخصص',
      subtitle: 'تسعير مخصص للفرق والطلبات الكبيرة في المغرب.',
      tierBadgePro: 'باقة المحترفين · عرض أسعار',
      tierBadgeEnterprise: 'باقة المؤسسات · عرض أسعار',
      nameLabel: 'الاسم الكامل *',
      phoneLabel: 'رقم الهاتف (+212) *',
      emailLabel: 'البريد الإلكتروني المهني *',
      companyLabel: 'الشركة / المؤسسة',
      quantityLabel: 'العدد التقديري للبطاقات',
      notesLabel: 'متطلبات خاصة / التخصيص',
      notesPlaceholder: 'مثال: هوية بصرية خاصة للشركة، ملفات منفصلة...',
      submitBtn: 'إرسال طلب عرض الأسعار',
      close: 'إغلاق',
    },
    nfcCard: {
      cardLabel: 'بطاقة TAGTOP الذكية',
      holderLabel: 'صاحب البطاقة',
      secureChip: 'المغرب · شريحة آمنة',
      backInstructions: 'قرب هذه البطاقة من أي هاتف ذكي متوافق لفتح الملف المهني مباشرة دون أي تطبيق.',
      poweredBy: 'مدعوم بواسطة',
      bespokeCard: 'بطاقة مخصصة خاصة',
      madeForMorocco: 'صُنع للمغرب',
      flipFront: 'عرض الوجه الأمامي',
      flipBack: 'قلب البطاقة (الوجه الخلفي)',
      tiltHint: 'حرك الفأرة للتأثير ثلاثي الأبعاد',
      sampleBusinessTitle: 'هندسة معمارية وتصميم',
      nfcTap: 'لمسة NFC',
      nfcIdLabel: 'معرف NFC',
      isoStandard: 'ISO/IEC 14443-A',
      matteBlack: 'أسود غير لامع',
      matteWhite: 'أبيض غير لامع',
    },
    customerDashboard: {
      ownerSpace: 'فضاء المالك',
      accountLabel: 'الحساب :',
      orderNewCard: 'طلب بطاقة جديدة',
      graceBannerTitle: 'فترة سماح 14 يوماً جارية لـ',
      graceBannerDesc: 'يظل ملفك متاحاً للعموم وقابلاً للفتح بـ NFC. آخر أجل للتجديد :',
      graceBannerAction: 'تسوية الاشتراك بتحويل بنكي (99 درهم)',
      previewBannerTitle: 'هذا الملف في وضع المعاينة الخاصة المجانية',
      previewBannerDesc: 'مرئي لك فقط. لنشر هذا الملف على الإنترنت وربطه ببطاقة ذكية، يلزم تأكيد طلب البطاقة المادية.',
      previewBannerAction: 'طلب البطاقة لتفعيل النشر',
      profileStatus: 'حالة الملف',
      expiryLabel: 'تاريخ الانتهاء :',
      anonymousViews: 'الزيارات العامة',
      tapsAndScans: 'لمسات NFC ومسح QR في المغرب',
      collectedLeads: 'جهات الاتصال المستلمة',
      formsSubmittedWithConsent: 'استمارات معبأة بموافقة صريحة',
      timelineTitle: 'جدول اشتراكك المعتمد',
      stage1Title: '1. أول 6 أشهر',
      stage1Value: 'متضمنة مع البطاقة',
      stage1ActiveUntil: 'الحالة : نشط حتى',
      stage2Title: '2. الـ 6 أشهر التالية',
      stage2Value: '99 درهم',
      stage2Manual: 'تحويل بنكي يدوي',
      stage3Title: '3. الفترات السنوية',
      stage3Value: '199 درهم / سنوياً',
      stage3Continuity: 'استمرارية وتحديثات غير محدودة',
      recentLeadsTitle: 'آخر جهات الاتصال المستلمة',
      viewAllLeads: 'عرض كل جهات الاتصال',
      individual: 'فردي',
      openWhatsApp: 'فتح واتساب',
      call: 'اتصال',
      editorTitle: 'محرر الملف الرقمي :',
      editorSubtitle: 'تعديلات فورية تنعكس مباشرة على بطاقتك الذكية.',
      editBtn: 'تعديل',
      previewBtn: 'معاينة حية',
      savedToast: 'تم حفظ التعديلات بنجاح!',
      templateLabel: 'النمط الجمالي',
      displayNameLabel: 'الاسم المعروض',
      jobTitleLabel: 'المسمى المهني',
      companyLabel: 'الشركة أو النشاط',
      cityLabel: 'المدينة في المغرب',
      bioLabel: 'نبذة تعريفية',
      phoneLabel: 'رقم الهاتف المحمول',
      whatsappLabel: 'واتساب',
      emailLabel: 'البريد الإلكتروني المهني',
      websiteLabel: 'الموقع الإلكتروني',
      brandingNoticeTitle: 'شعار TAGTOP الرقمي :',
      brandingNoticeDesc: 'إزالة شعار TAGTOP من الملف الرقمي خيار متقدم منفصل عن إزالته من البطاقة المادية، وهو غير مفعل حالياً عند الإطلاق.',
      myCardsOrdersTitle: 'بطاقاتي وطلباتي',
      myCardsOrdersSubtitle: 'متابعة التصنيع، مراجعة النماذج والبرمجة.',
      newOrderBtn: 'طلب جديد',
      stepReceived: '1. تم الاستلام',
      stepProofReview: '2. مراجعة النموذج',
      stepEncodingFab: '3. البرمجة والتصنيع',
      stepDelivered: '4. تم التسليم (COD)',
      proofReadyTitle: 'نموذج الطباعة (BAT) جاهز للمراجعة',
      proofReadyDesc: 'أعد المؤسس مسودة الطباعة الخاصة بك. يرجى مراجعتها وتأكيد الموافقة أو طلب تعديل.',
      approveProofBtn: 'الموافقة على النموذج الأولي',
      requestProofChangeBtn: 'طلب تعديل على التصميم',
      proofRemarksPrompt: 'اكتب ملاحظاتك أو التعديلات المطلوبة للمؤسس :',
      proofRemarksSentAlert: 'تم إرسال ملاحظاتك إلى المؤسس لتعديل النموذج الأولي.',
      linkedProfile: 'الملف المرتبط :',
      paymentLabel: 'الدفع :',
      paidOnDelivery: 'تم الدفع عند الاستلام',
      dueOnDelivery: 'مستحق عند الاستلام',
      leadsTitle: 'جهات الاتصال المستلمة طواعية',
      leadsSubtitle: 'بيانات التواصل المرسلة من زوار ملفك الشخصي عبر البطاقة الذكية.',
      searchPlaceholder: 'البحث عن جهة اتصال...',
      colName: 'الاسم والشركة',
      colPhone: 'الهاتف',
      colEmail: 'البريد الإلكتروني',
      colDate: 'التاريخ',
      colPromo: 'الموافقة على العروض',
      colContact: 'تواصل',
      optInYes: 'نعم (بموافقة)',
      optInNo: 'لا',
      analyticsNoteTitle: 'إحصائيات الزيارات :',
      analyticsNoteDesc: 'بيانات تجريبية مغربية توضيحية. تسجيل حدث "حفظ جهة الاتصال" يشير لتنزيل ملف vCard دون تأكيد الحفظ التلقائي في الهاتف.',
      metricTaps: 'اللمسات وزيارات الملف',
      metricWhatsApp: 'نقرات واتساب',
      metricVCard: 'تنزيلات جهة الاتصال vCard',
      metricForms: 'الاستمارات المستلمة',
      subscriptionTitle: 'الاشتراك والتجديد اليدوي',
      subscriptionSubtitle: 'في المغرب، يتم تجديد اشتراكات TAGTOP عبر تحويل بنكي يدوي يدققه المؤسس.',
      renewalSubmittedToast: 'تم إرسال إشعار التحويل للمؤسس للمراجعة. سيتم تمديد صلاحية ملفك فور التأكيد.',
      bankDetailsTitle: 'الحساب البنكي الرسمي لـ TAGTOP',
      claimTransferTitle: 'التصريح بتحويل بنكي تم إنجازه',
      renewalPeriodLabel: 'فترة التجديد',
      option6Months: 'المرحلة 2 : 6 أشهر إضافية (99 درهم)',
      optionAnnual: 'المرحلة 3 : تجديد لسنة كاملة (199 درهم)',
      receiptRefLabel: 'رقم التحويل أو مرجع الإيصال البنكي CIH / AWB',
      receiptPlaceholder: 'مثال: CIH-VIR-20261026-9042',
      submitVerificationBtn: 'إرسال للتحقق',
      confirmWhatsAppBtn: 'تأكيد عبر واتساب',
      settingsTitle: 'الإعدادات وتطبيق الويب (PWA)',
      settingsSubtitle: 'إعدادات الحساب وإرشادات تثبيت تطبيق الويب.',
      pwaTitle: 'تثبيت TAGTOP على شاشتك الرئيسية (PWA)',
      pwaDesc: 'يعمل تطبيق TAGTOP كتطبيق ويب متقدم (PWA) دون الحاجة للتنزيل من App Store أو Google Play.',
      pwaIphone: 'على هواتف آيفون (Safari) : اضغط على زر المشاركة ثم "إضافة إلى الشاشة الرئيسية".',
      pwaAndroid: 'على هواتف أندرويد (Chrome) : اضغط على القائمة (ثلاث نقاط) ثم "تثبيت التطبيق".',
      renewal6MonthsLabel: 'تجديد 6 أشهر إضافية (99 درهم)',
      renewalAnnualLabel: 'تجديد سنوي (199 درهم)',
      pendingManualVerification: 'في انتظار التحقق اليدوي من قبل المؤسس.',
      orderStatusReceived: 'تم الاستلام',
      orderStatusArtworkReview: 'مراجعة النموذج (BAT)',
      orderStatusCustomerApproved: 'معتمدة من العميل',
      orderStatusProduction: 'قيد التصنيع',
      orderStatusLinked: 'تم ربط الشريحة',
      orderStatusShipped: 'تم الشحن',
      orderStatusDelivered: 'تم التسليم',
    },
    founderDashboard: {
      adminBadge: 'دخول الإدارة الموحد',
      founderTitle: 'مؤسس TAGTOP',
      viewCustomerPortal: 'زيارة فضاء الزبون',
      tabOverview: 'نظرة عامة',
      tabCustomers: 'الزبائن والملفات',
      tabOrders: 'الطلبات ونماذج الطباعة',
      tabNfcRegistry: 'سجل بطاقات NFC',
      tabTransfers: 'التحويلات البنكية',
      tabGrace: 'فترة السماح والتعليق',
      tabConfiguration: 'الإعدادات والأسعار',
      ordersToProcess: 'طلبات قيد المعالجة',
      pendingProofs: 'نماذج قيد المراجعة',
      activeNfcCards: 'بطاقات NFC النشطة',
      encoded100: 'مبرمجة 100%',
      transfersToVerify: 'تحويلات للمراجعة',
      whatsAppReceipts: 'إيصالات واتساب',
      inGracePeriod: 'في فترة السماح',
      max14Days: '14 يوماً كحد أقصى',
      prioritiesTitle: 'أولويات إدارة المؤسس',
      proofsWaitingDesc: 'نموذج طباعة في انتظار المراجعة والموافقة.',
      reviewProofsBtn: 'فحص نماذج الطباعة',
      transfersWaitingDesc: 'إشعار تحويل بنكي لتجديد الاشتراك قيد الانتظار.',
      verifyTransfersBtn: 'التحقق من التحويلات',
      customersTitle: 'الزبائن والملفات المسجلة',
      profilesManaged: 'ملف تحت الإدارة',
      colHolder: 'الاسم والشركة',
      colCity: 'المدينة',
      colAccessStatus: 'حالة الصلاحية',
      colExpiry: 'تاريخ الانتهاء',
      colLinkedCards: 'البطاقات المرتبطة',
      colChangeStatus: 'تغيير الحالة',
      ordersTitle: 'إدارة الطلبات ونماذج الطباعة (BAT)',
      ordersSubtitle: 'مراقبة الإنتاج، إعداد التصميم، ومتابعة توصيل الدفع عند الاستلام.',
      codCollected: 'تم تحصيل الدفع',
      codPending: 'في انتظار التحصيل',
      cardFinish: 'مواصفات البطاقة :',
      linkedProfile: 'الملف المرتبط :',
      orderStage: 'مرحلة الطلب :',
      codPayment: 'الدفع عند الاستلام :',
      paymentConfirmed: 'تم تأكيد الدفع',
      markCollected: 'تحديد كمحصّل',
      registryTitle: 'السجل الرسمي لبطاقات وشرائح NFC',
      registrySubtitle: 'تتبع المعرفات الفيزيائية (UID) المرتبطة بملفات TAGTOP.',
      colHardwareUid: 'المعرف الفيزيائي UID',
      colSerialNumber: 'الرقم التسلسلي',
      colFinish: 'اللون والهوية',
      colProfile: 'الملف المرتبط',
      colChipStatus: 'حالة الشريحة',
      transfersTitle: 'المصادقة اليدوية على التحويلات البنكية',
      transfersSubtitle: 'تأكد من إيصالات التجديد قبل تمديد صلاحية الملفات.',
      amountReceived: 'المبلغ المستلم :',
      concernedProfile: 'الملف المستهدف :',
      approveAndExtend: 'الموافقة وتمديد الصلاحية',
      reject: 'رفض',
      rejectPrompt: 'سبب رفض التحويل البنكي :',
      approvedNotes: 'تحويل موثق من طرف المؤسس',
      graceTitle: 'إدارة فترة السماح (14 يوماً) والتعليق',
      graceSubtitle: 'متابعة الملفات المنتهية. تعليق هادئ دون كشف أي بيانات شخصية.',
      restoreAccess: 'استعادة الصلاحية',
      discreetlySuspend: 'تعليق هادئ للملف',
      settingsTitle: 'إعدادات النظام وأسعار TAGTOP',
      settingsSubtitle: 'ضبط الأسعار المعتمدة وحالة توفر الإكسسوارات عند الإطلاق.',
      savedToast: 'تم حفظ الإعدادات بنجاح!',
      starterBrandedLabel: 'ستارتـر مع شعار TAGTOP (درهم)',
      fixedAt249: 'محدد في 249 درهم',
      starterUnbrandedLabel: 'ستارتـر بدون شعار TAGTOP (درهم)',
      fixedAt349: 'محدد في 349 درهم',
      renewal6MonthsLabel: 'تجديد 6 أشهر (درهم)',
      fixedAt99: 'محدد في 99 درهم',
      renewalAnnualLabel: 'تجديد سنوي (درهم)',
      fixedAt199: 'محدد في 199 درهم',
      woodenStandCheckbox: 'تفعيل بيع الحامل الخشبي (معطل حالياً عند الإطلاق)',
      woodenStandHelp: 'طالما لم يتم تحديد هذا الخيار، سيظهر الحامل كـ "قريباً" ولن يُحتسب في الفواتير.',
      supportWhatsAppLabel: 'رقم واتساب الرسمي لتأكيد التحويلات البنكية',
      updateSettingsBtn: 'تحديث الإعدادات',
      finishBlack: 'PVC أسود',
      finishWhite: 'PVC أبيض',
      withLogo: 'مع شعار TAGTOP',
      withoutLogo: 'بدون شعار TAGTOP',
      statusActive: 'نشط',
      statusInTransit: 'قيد الشحن',
      statusPending: 'قيد الانتظار',
      statusApproved: 'معتمد',
      statusRejected: 'مرفوض',
      orderStep1: '1. تم الاستلام',
      orderStep2: '2. مراجعة النموذج (BAT)',
      orderStep3: '3. تمت الموافقة على النموذج',
      orderStep4: '4. قيد التصنيع',
      orderStep5: '5. الشريحة مبرمجة',
      orderStep6: '6. تم الشحن',
      orderStep7: '7. تم التوصيل',
    },
    app: {
      proofModificationSentAlert: 'تم إرسال ملاحظاتك إلى المؤسس لتعديل النموذج الأولي.',
      backToSite: '← العودة لموقع TAGTOP',
      livePreviewOf: 'معاينة حية لملف',
    },
    footer: {
      mission: 'بطاقات عمل ذكية فاخرة بتقنية NFC وملفات مهنية رقمية لرواد الأعمال والشركات في المغرب.',
      cities: 'الدار البيضاء · الرباط · مراكش · طنجة · فاس · أكادير',
      navTitle: 'التنقل',
      spacesTitle: 'البوابات والحلول',
      cardConfigurator: 'مخصص البطاقات',
      liveDemo: 'عرض تجريبي للملف المباشر',
      paymentTitle: 'الدفع والضمان',
      paymentDesc: 'توصيل البطاقات المادية مع الدفع عند الاستلام في المغرب. تجديد الاشتراكات عبر تحويل بنكي موثوق.',
      copyright: 'جميع الحقوق محفوظة. صُمم للمغرب.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
      cashOnDelivery: 'الدفع عند الاستلام (COD)',
      cihBank: 'تحويل CIH Bank',
      ntagCertified: 'معتمد بشريحة NTAG',
    },
  },
  en: {
    common: {
      brandName: 'TAGTOP',
      brandTagline: 'Moroccan Premium NFC Business Cards & Digital Profiles',
      currency: 'MAD',
      language: 'Language',
      clientArea: 'Customer Portal',
      founderAdmin: 'Founder Admin',
      viewSite: 'Back to website',
      publicSite: 'Public Site',
      liveProfile: 'Live Public Profile',
      freePreviewCTA: 'Create Free Preview',
      orderCardCTA: 'Order NFC Card',
      exploreCardsCTA: 'Explore Cards',
      saveContactCTA: 'Save Contact',
      whatsappCTA: 'WhatsApp',
      callCTA: 'Call',
      shareCTA: 'Share',
      loading: 'Loading...',
      save: 'Save Changes',
      cancel: 'Cancel',
      close: 'Close',
      back: 'Back',
      next: 'Continue',
      status: 'Status',
      actions: 'Actions',
      demoNote: 'Moroccan Demonstration Data',
      reassuranceBadge: 'Free private preview. Card purchase required to publish.',
      active: 'Active',
      privatePreview: 'Private preview',
      gracePeriod: 'Grace period',
      suspended: 'Suspended',
      individual: 'Individual',
      copied: 'Copied!',
      morocco: 'Morocco',
      ariaHome: 'TAGTOP Home',
      ariaSwitchLang: 'Switch language to',
      ariaMainMenu: 'Main menu',
      templateExecutive: 'Executive',
      templateCreative: 'Creative',
      templateArtisan: 'Artisan',
    },
    nav: {
      home: 'Home',
      howItWorks: 'How it works',
      features: 'Features',
      cards: 'Cards & Accessories',
      pricing: 'Pricing',
      demo: 'Profile Demo',
      about: 'About',
      faq: 'FAQ',
      contact: 'Contact & Quotes',
      login: 'Sign In',
      register: 'Free Preview',
    },
    hero: {
      headline: 'One single tap. All your connections.',
      subheadline: 'A premium Moroccan NFC card that opens your comprehensive business profile, shares contact info instantly, and collects qualified leads without requiring an app.',
      primaryCta: 'Create Free Preview',
      secondaryCta: 'Explore Cards',
      reassurance: 'Free private preview. Card purchase required to publish.',
      pauseAnimation: 'Pause demo',
      playAnimation: 'Resume demo',
      interactiveDemoTitle: 'Interactive NFC Experience',
      tapPrompt: 'Bring the card near the phone to unlock the professional profile',
      codBadge: 'Cash on delivery (COD)',
      preEncodedBadge: 'Pre-encoded cards ready to tap',
      compatibilityBadge: 'Compatible with iPhone & Android',
      pause: 'Pause',
      play: 'Play',
      sampleJob: 'Interior Architecture',
      samplePrice: 'From 15,000 MAD',
      sampleLocation: 'Atelier Atlas Design · Casablanca',
    },
    howItWorks: {
      title: 'Seamless bridge from digital to physical networking',
      subtitle: 'Build your profile in peace, customize your physical card, and receive it ready to tap anywhere in Morocco.',
      badge: 'Simple & Secure Process',
      step1Title: '01. Free Private Preview',
      step1Desc: 'Set up your online profile with services, bio, and contact channels. It remains strictly private to you until order approval.',
      step1Highlight: '100% private & obligation-free',
      step2Title: '02. Card Choice & Customization',
      step2Desc: 'Choose matte black or white PVC, branded with TAGTOP or 100% bespoke with only your company artwork.',
      step2Highlight: 'Premium matte black or white',
      step3Title: '03. Proof Review & Chip Linking',
      step3Desc: 'The TAGTOP founder prepares your visual proof for WhatsApp sign-off, then securely links your NFC chip to your profile.',
      step3Highlight: 'Design proof sign-off on WhatsApp',
      step4Title: '04. Arrives Ready to Use',
      step4Desc: 'Cash on delivery across Morocco. Your card works immediately on arrival with no tedious client self-activation.',
      step4Highlight: 'Cash on delivery across Morocco',
    },
    features: {
      title: 'Engineered for discerning Moroccan business leaders',
      subtitle: 'Frictionless contactless technology designed to elevate your brand prestige and convert introductions into deals.',
      badge: 'Technology & Craftsmanship',
      f1Title: 'No App Required',
      f1Desc: 'A single NFC tap instantly opens your profile in native browsers on both iOS and Android.',
      f2Title: 'Native vCard Export',
      f2Desc: 'New contacts download your clean contact card directly into phone address books.',
      f3Title: 'Showcase Offerings',
      f3Desc: 'Display services, MAD price guides, portfolios, and PDF brochures directly from your link.',
      f4Title: 'Voluntary Lead Collection',
      f4Desc: 'Receive contact info with clean separation between direct inquiry consent and optional promotional marketing.',
      f5Title: 'Instant Live Updates',
      f5Desc: 'Update your phone, title, or links anytime without ever having to reorder physical cards.',
      f6Title: 'Premium Resilient PVC',
      f6Desc: 'Tactile matte finish resistant to daily wear, scratches, and water with high-sensitivity embedded NFC antenna.',
    },
    cards: {
      title: 'Noble and durable physical cards',
      subtitle: 'Fingerprint-resistant matte texture, clean edges, and protected microchip for years of dependable use.',
      badge: 'Materials & Craftsmanship',
      matteBlack: 'Deep Matte Black',
      matteWhite: 'Clean Matte White',
      brandedTitle: 'Card with TAGTOP Logo',
      brandedDesc: 'Includes discreet TAGTOP hallmark on the reverse. Most accessible pricing for solopreneurs.',
      unbrandedTitle: '100% Bespoke Unbranded Card',
      unbrandedDesc: 'Zero TAGTOP markings on the physical card. Exclusively highlights your enterprise identity.',
      brandedOption: 'With TAGTOP logo (249 MAD)',
      unbrandedOption: 'Without TAGTOP logo (349 MAD)',
      woodenStandTitle: 'Natural Solid Wood Desk Stand',
      woodenStandStatus: 'Coming Soon',
      woodenStandDesc: 'Handcrafted natural timber desktop holder. Currently in artisan production, available soon.',
      woodenStandDisclaimer: 'In accordance with launch guidelines, this accessory is previewable but excluded from active order totals.',
      specsTitle: 'NFC PVC Card Specifications',
      specFormat: 'Standard bank-card format: 85.60 × 53.98 mm, premium 0.84 mm thickness.',
      specFinish: 'Refined matte finish: High-density velvety touch resistant to scratches and fingerprints.',
      specChip: 'High-sensitivity NTAG chip: 100% compatible with NFC-enabled smartphones, no battery required.',
      specReady: 'Ready to use: Pre-encoded by TAGTOP with your digital profile before shipping.',
      customizeCta: 'Customize my card in the configurator',
    },
    pricing: {
      title: 'Transparent, predictable pricing',
      subtitle: 'A single hardware purchase that includes your qualifying initial digital presence.',
      badge: 'Full Transparency',
      recommendedBadge: 'Recommended Choice',
      cardCount1: '1 NFC Card',
      cardCount5: '5-Card Pack',
      volumeBadge: 'Volume & Networks',
      starterTitle: 'Starter Card',
      starterBrandedBadge: '249 MAD (With TAGTOP logo)',
      starterUnbrandedBadge: '349 MAD (Without TAGTOP logo)',
      starterBrandedTag: '(With TAGTOP logo)',
      starterOr: 'or 349 MAD',
      starterUnbrandedTag: '(Without TAGTOP logo on the card)',
      starterFeature1: '1 matte black or white PVC card',
      starterFeature2: 'First 6 months of digital access included',
      starterFeature3: 'Comprehensive professional profile with no app required',
      starterFeature4: 'WhatsApp visual proof sign-off before printing',
      starterFeature5: 'Cash on delivery across Morocco',
      starterCta: 'Configure My Starter Card',
      proTitle: 'Pro Bundle (5 Cards)',
      proSubtitle: 'Tailored pricing suited to your team needs',
      proDesc: 'For partnerships, clinics, and small teams managed by a single owner account.',
      proQuote: 'Request a quote',
      proFeature1: '5 NFC cards with flexible assignment',
      proFeature2: 'Multiple cards pointing to one or several profiles',
      proFeature3: 'Centralized management through a single owner portal',
      proFeature4: 'Option with or without TAGTOP branding',
      proCta: 'Request a Pro Quote',
      enterpriseTitle: 'Enterprise Volume',
      enterpriseSubtitle: 'Volume orders for organizations and corporations',
      enterpriseDesc: 'Volume orders for organizations, hotel chains, and corporate divisions in Morocco.',
      enterpriseQuote: 'Request a quote',
      enterpriseFeature1: 'Volume orders starting from 10+ customized cards',
      enterpriseFeature2: 'Bespoke corporate brand guideline integration',
      enterpriseFeature3: 'Dedicated priority support from the TAGTOP founder',
      enterpriseFeature4: 'Official Moroccan corporate invoicing (SARL)',
      enterpriseCta: 'Request an Enterprise Quote',
      timelineTitle: 'Confirmed 3-stage access & renewal schedule',
      stage1Label: 'Stage 1',
      stage1Title: 'Stage 1: First 6 Months Included',
      stage1Desc: 'Included with your physical Starter card. Zero extra cost to get up and running.',
      stage1Included: '0 MAD included',
      stage2Label: 'Stage 2',
      stage2Title: 'Stage 2: Next 6 Months',
      stage2Desc: '99 MAD for your next 6 months of active hosting (manual bank transfer verified by founder).',
      stage2Per6Months: '99 MAD / 6 months',
      stage3Label: 'Stage 3',
      stage3Title: 'Stage 3: Subsequent Annual Periods',
      stage3Desc: '199 MAD per year to retain active public visibility and uninterrupted profile features.',
      stage3PerYear: '199 MAD / year',
      renewalNotice: 'Manual renewal verified by founder via WhatsApp. No recurring card charges or surprise billing.',
      graceGuarantee: 'Guaranteed 14-day grace period: In case of expiration, your profile remains active for 14 days with a discreet reminder in your customer portal. After this period, the public profile is discreetly suspended without disclosing private details.',
    },
    configurator: {
      title: 'TAGTOP NFC Card Configurator',
      badge: 'High-Fidelity Customization',
      subtitle: 'Configure your physical NFC card step by step.',
      stepTier: '1. Package',
      stepColor: '2. Card Color',
      stepBranding: '3. Physical Branding',
      stepArtwork: '4. Logo & Design',
      stepProfile: '5. Linked Profile',
      stepAccessory: '6. Accessory',
      stepDelivery: '7. Moroccan Delivery',
      stepSummary: '8. Itemized Summary',
      stepProofNotice: '9. Proof Approval Policy',
      starterPackage: 'Starter (1 Card)',
      fromPrice: 'From 249 MAD',
      sixMonthsIncluded: '6 months included',
      proPackage: 'Pro (5 Cards)',
      onQuote: 'On quote',
      smallTeams: 'Small teams',
      enterprisePackage: 'Enterprise',
      volumeOrders: 'Volume orders',
      matteBlack: 'Matte Black',
      matteWhite: 'Matte White',
      brandedOption: 'With TAGTOP logo',
      unbrandedOption: 'Without TAGTOP logo',
      uploadLogo: 'Upload your company logo (High-res PNG, SVG, or vector PDF)',
      fileChosen: 'File:',
      chooseFile: 'Choose a file',
      selectProfile: 'Select the digital profile to link with this card',
      chipEncodingNote: 'The NFC chip will be pre-encoded by TAGTOP to directly open this profile.',
      woodenStandTitle: 'Natural Solid Wood Desk Stand',
      comingSoon: 'Coming Soon',
      woodenStandNotice: 'The handcrafted wooden stand is currently in production. It is unavailable for purchase at launch and excluded from order totals.',
      cityLabel: 'City in Morocco',
      cityPlaceholder: 'e.g., Casablanca, Rabat, Marrakech...',
      addressLabel: 'Full street delivery address',
      addressPlaceholder: 'Neighborhood, street, building no...',
      phoneLabel: 'Recipient contact phone (+212)',
      phonePlaceholder: '+212 6...',
      fullNameLabel: 'Recipient full name',
      namePlaceholder: 'e.g., Yassine Bennani',
      codNotice: 'Cash on delivery (COD) upon receiving your package.',
      proofNoticeDesc: 'Our founder prepares your layout proof for WhatsApp confirmation before any card is printed.',
      submitOrder: 'Confirm Order (Cash on Delivery)',
      orderSuccessTitle: 'Order Received Successfully',
      orderSuccessDesc: 'Your request has been logged. TAGTOP will contact you via WhatsApp for final design proof approval.',
      orderNumberLabel: 'Order number:',
      amountDueLabel: 'Amount due on delivery (COD):',
      linkedProfileLabel: 'Linked profile:',
      deliveryAddressLabel: 'Delivery address:',
      nextStepProofTitle: 'Next Step - Layout Proof (BAT):',
      nextStepProofDesc: 'The TAGTOP founder will prepare your print layout and contact you on WhatsApp for approval before production begins.',
      accessDashboardBtn: 'Go to Customer Portal',
      configureAnotherBtn: 'Configure Another Card',
      livePreviewTitle: 'Live Card Preview',
      summaryCardPVC: 'NFC PVC Card',
      summaryFinish: 'Physical branding',
      summaryStand: 'Wooden stand',
      summaryStandExcluded: 'Not included (Coming soon)',
      summaryPaymentMode: 'Payment method',
      summaryCOD: 'Cash on delivery (COD)',
      summaryTotalDue: 'Total due on receipt',
      timelineReminder: 'Included digital presence timeline:',
      stage1Reminder: '1. First 6 months:',
      stage1Included: 'Included (0 MAD)',
      stage2Reminder: '2. Next 6 months:',
      stage2Manual: '99 MAD (manual transfer)',
      stage3Reminder: '3. Subsequent annual periods:',
      stage3Annual: '199 MAD / year',
    },
    profile: {
      saveContactPrompt: 'Save contact to phone',
      productsTitle: 'Services & Products',
      servicesTitle: 'Featured Offerings',
      documentsTitle: 'Documents & Catalogs',
      videosTitle: 'Video Introduction',
      leadFormTitle: 'Share Your Details',
      leadFormSubtitle: 'Exchange your details directly with us for future collaboration.',
      nameField: 'Full Name',
      phoneField: 'Phone Number',
      emailField: 'Email Address',
      companyField: 'Company or Occupation',
      notesField: 'Inquiry or project details',
      consentField: 'I agree to receive occasional updates or special offers from this business (optional)',
      submitLead: 'Send My Details',
      leadSuccess: 'Your details have been sent successfully!',
      leadSuccessDesc: 'Your details have been recorded successfully.',
      expiredTitle: 'Profile Temporarily Unavailable',
      expiredMessage: 'This TAGTOP profile is currently unavailable. Please contact the owner through their primary business channels.',
      digitalFooter: 'Powered by TAGTOP Morocco NFC Technology',
      expiredModeBadge: 'Mode: Expired Profile (Discreet)',
      viewActiveProfileBtn: 'View active profile',
      networkFooter: 'TAGTOP · NFC Business Card Network in Morocco',
      styleLabel: 'Theme:',
      testExpiredBtn: 'Test expired view',
      graceWarningText: '14-day grace period active until',
      morocco: 'Morocco',
      callAction: 'Call',
      emailAction: 'Send Email',
      websiteAction: 'Visit Website',
      shareAction: 'Share Profile',
      copiedToast: 'Link copied!',
      indicativePrices: 'Guide prices',
      simulatedDownload: 'Simulated download:',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'contact@example.ma',
      companyPlaceholder: 'Your company',
      notesPlaceholder: 'Project or inquiry details...',
      digitalFooterNetwork: 'NFC Business Cards & Connected Profiles in Morocco',
    },
    dashboard: {
      customerTitle: 'TAGTOP Customer Portal',
      founderTitle: 'Founder Admin Console',
      overview: 'Overview',
      profiles: 'My Profiles',
      cardsOrders: 'Cards & Orders',
      leads: 'Collected Leads',
      analytics: 'Visitor Analytics',
      subscription: 'Subscription & Renewal',
      settings: 'Settings & PWA',
      customers: 'Customers & Profiles',
      nfcRegistry: 'NFC Card Registry',
      transfers: 'Transfer Verification',
      graceSuspension: 'Grace & Suspension',
      configuration: 'System Settings',
    },
    about: {
      missionTag: 'Our Mission in Morocco',
      missionTitle: 'Redefining the first impression for Moroccan entrepreneurs',
      p1: 'TAGTOP was born from a clear observation: traditional paper business cards end up forgotten or discarded, while every in-person business encounter is a valuable opportunity.',
      p2: 'We engineered a premium hardware and software solution tailored to the needs of professionals in Morocco: tactile matte PVC cards paired with a dynamic digital profile, accessible instantly without an app and strictly respectful of contact consent.',
      designedInMorocco: 'Designed in Morocco',
      cities: 'Casablanca & Across Morocco',
      craftsmanship: 'Craftsmanship & Quality Control',
      proofValidated: 'Every proof manually verified',
      founderCommitment: 'Founder Commitment',
      founderQuoteTitle: 'A direct, personal relationship with every client',
      founderQuote: '“At TAGTOP, we never delegate your brand identity to an automated algorithm. Before printing any NFC card, I personally inspect your logo quality, prepare your design proof, and send it directly to you on WhatsApp. You only pay for your card on delivery after inspecting your package.”',
      founderTeam: 'The TAGTOP Founding Team',
      founderSub: 'Morocco · Enterprise & Creators Division',
      dedicatedSupport: 'Dedicated Support',
    },
    faq: {
      tag: 'Frequently Asked Questions',
      title: 'Everything you need to know about TAGTOP',
      subtitle: 'Clear answers to guide your transition to contactless business networking.',
      q1: 'Are all smartphones compatible with TAGTOP cards?',
      a1: 'All recent iPhones (iPhone XR, XS, 11, 12, 13, 14, 15, 16, and newer) read NFC cards natively without any configuration. The vast majority of modern Android smartphones are also equipped with NFC. No app download is required for your contact.',
      q2: 'What is the free private preview?',
      a2: 'Before ordering your physical card, you can create an account and configure your complete profile (bio, services, catalog, links, form). This preview remains strictly private and visible only to you. It will only be published online and linked to an NFC card after order confirmation.',
      q3: 'How does cash on delivery (COD) work?',
      a3: 'For your physical Starter card order, you pay the exact amount (249 MAD with TAGTOP logo or 349 MAD without TAGTOP logo) in cash directly to the courier upon in-person delivery of your parcel.',
      q4: 'How are renewals handled after the initial 6 months included?',
      a4: 'Renewals (99 MAD for 6 months, then 199 MAD per year) are settled via manual bank transfer to our Moroccan bank account (CIH Bank). You send your transfer confirmation via WhatsApp to our founder who manually verifies and extends your period.',
      q5: 'What happens if I forget to renew on time (Grace Period)?',
      a5: 'TAGTOP provides a 14-day grace period. During these 14 days, your card and public profile remain fully active and functional, with a discreet reminder in your customer portal. If no transfer is confirmed after 14 days, the public profile shows a discreet temporary unavailable message, while keeping all your private content safely preserved.',
      q6: 'Can I update my profile after receiving my card?',
      a6: 'Yes, anytime and without limits through your TAGTOP Customer Portal. The link encoded on your NFC card directs to your live dynamic profile, without ever needing to reprint a new card.',
    },
    legal: {
      backToSite: 'Back to main site',
      disclaimerTitle: 'Standard document for legal review:',
      disclaimerText: 'This notice is a template prepared for final legal review and compliance with Moroccan Law No. 09-08 on the protection of personal data.',
      termsTitle: 'Terms of Sale & Service',
      privacyTitle: 'Privacy Policy & Personal Data',
      termsS1Title: '1. Scope & Services',
      termsS1Text: 'These Terms govern the sale of contactless NFC physical cards marketed under the TAGTOP brand in Morocco, as well as access to the associated digital professional profile hosting service.',
      termsS2Title: '2. Ordering & Visual Proof (BAT)',
      termsS2Text: 'Every card order with custom artwork entails the generation of an electronic layout proof submitted to the client via WhatsApp or web interface. Physical manufacturing only begins after express client approval of the proof.',
      termsS3Title: '3. Cash on Delivery & Renewals',
      termsS3Text: 'Physical Starter cards (249 MAD with TAGTOP logo or 349 MAD without TAGTOP logo) are payable in Moroccan Dirhams (MAD) in cash upon delivery (Cash on Delivery). The initial six (6) months hosting period is included. Subsequent renewals (99 MAD for 6 months, then 199 MAD annually) are paid via manual bank transfer verified by the founder.',
      termsS4Title: '4. Grace Period & Suspension',
      termsS4Text: 'Upon expiration of the subscription period, a fourteen (14) calendar day grace period is granted during which the profile remains active. Past this deadline without regularization, the public profile is discreetly suspended without disclosing billing details.',
      privacyS1Title: '1. Professional Data Collection',
      privacyS1Text: 'TAGTOP only collects data strictly necessary for physical card configuration and digital professional profile hosting (name, title, company, contact numbers, web links).',
      privacyS2Title: '2. Strict Consent Separation (Leads vs Direct Contact)',
      privacyS2Text: 'A simple NFC card tap never collects visitor information automatically. Only voluntary submission of the contact form transmits details. Promotional updates require a separate, non-pre-checked consent box.',
      privacyS3Title: '3. Moroccan Law 09-08 Compliance',
      privacyS3Text: 'In compliance with Moroccan law, users hold the right to access, rectify, and object to processing of their personal data by contacting TAGTOP customer support.',
    },
    demoPage: {
      backHome: 'Back to home',
      badge: 'Official Interactive Demo',
      note: 'Moroccan demonstration mock data',
      title: 'NFC Profile Visitor Experience',
      orderCta: 'Order my NFC card',
      businessExamples: 'Industry Examples:',
      demoLeadAlert: 'Demo: Lead received for',
    },
    quoteModal: {
      submittedTitle: 'Quote Request Submitted',
      submittedDesc: 'The TAGTOP founder will review your request and get in touch shortly with a customized proposal.',
      title: 'Request a Tailored Quote',
      subtitle: 'Custom pricing for teams and volume orders in Morocco.',
      tierBadgePro: 'Pro Plan · Custom Quote',
      tierBadgeEnterprise: 'Enterprise Plan · Custom Quote',
      nameLabel: 'Your Name *',
      phoneLabel: 'Phone (+212) *',
      emailLabel: 'Work Email *',
      companyLabel: 'Company / Organization',
      quantityLabel: 'Estimated number of cards',
      notesLabel: 'Specific requirements / Customization',
      notesPlaceholder: 'e.g., Corporate branding, separate profiles...',
      submitBtn: 'Submit Quote Request',
      close: 'Close',
    },
    nfcCard: {
      cardLabel: 'TAGTOP NFC Card',
      holderLabel: 'Card Holder',
      secureChip: 'MOROCCO · SECURE CHIP',
      backInstructions: 'Tap this card against any compatible smartphone to instantly open the professional profile. No app required.',
      poweredBy: 'POWERED BY',
      bespokeCard: 'BESPOKE PRIVATE CARD',
      madeForMorocco: 'MADE FOR MOROCCO',
      flipFront: 'View front',
      flipBack: 'Flip card (back)',
      tiltHint: 'Tilt with mouse',
      sampleBusinessTitle: 'Architecture & Scenography',
      nfcTap: 'NFC Tap',
      nfcIdLabel: 'NFC ID',
      isoStandard: 'ISO/IEC 14443-A',
      matteBlack: 'Matte Black',
      matteWhite: 'Matte White',
    },
    customerDashboard: {
      ownerSpace: 'Owner Portal',
      accountLabel: 'Account:',
      orderNewCard: 'Order a new card',
      graceBannerTitle: '14-day grace period active for',
      graceBannerDesc: 'Your profile remains public and NFC-accessible. Renewal deadline:',
      graceBannerAction: 'Renew by bank transfer (99 MAD)',
      previewBannerTitle: 'This profile is currently in FREE PRIVATE PREVIEW',
      previewBannerDesc: 'Visible only to you. To publish this profile and link it to an NFC chip, a physical card order is required.',
      previewBannerAction: 'Order Card to Publish',
      profileStatus: 'Profile Status',
      expiryLabel: 'Expiry:',
      anonymousViews: 'Anonymous Views',
      tapsAndScans: 'NFC taps & QR scans in Morocco',
      collectedLeads: 'Collected Leads',
      formsSubmittedWithConsent: 'Forms submitted with consent',
      timelineTitle: 'Standard Subscription Timeline',
      stage1Title: '1. First 6 months',
      stage1Value: 'Included with card',
      stage1ActiveUntil: 'Status: Active until',
      stage2Title: '2. Next 6 months',
      stage2Value: '99 MAD',
      stage2Manual: 'Manual bank transfer',
      stage3Title: '3. Annual periods',
      stage3Value: '199 MAD / year',
      stage3Continuity: 'Continuous hosting & unlimited updates',
      recentLeadsTitle: 'Recent Leads from Form',
      viewAllLeads: 'View all leads',
      individual: 'Individual',
      openWhatsApp: 'Open WhatsApp',
      call: 'Call',
      editorTitle: 'Digital Profile Editor:',
      editorSubtitle: 'Instant updates synchronized with your NFC card.',
      editBtn: 'Edit',
      previewBtn: 'Live Preview',
      savedToast: 'Changes saved successfully!',
      templateLabel: 'Template Style',
      displayNameLabel: 'Display Name',
      jobTitleLabel: 'Job Title',
      companyLabel: 'Company',
      cityLabel: 'City in Morocco',
      bioLabel: 'Bio / Summary',
      phoneLabel: 'Mobile Phone',
      whatsappLabel: 'WhatsApp',
      emailLabel: 'Work Email',
      websiteLabel: 'Website',
      brandingNoticeTitle: 'TAGTOP Digital Branding:',
      brandingNoticeDesc: 'Removing TAGTOP branding from digital profiles is an advanced plan tier distinct from physical unbranded cards. Not configured at launch.',
      myCardsOrdersTitle: 'My Cards & Orders',
      myCardsOrdersSubtitle: 'Production tracking, layout proof review (BAT), and encoding.',
      newOrderBtn: 'New Order',
      stepReceived: '1. Received',
      stepProofReview: '2. Proof Review',
      stepEncodingFab: '3. Encoding & Fab',
      stepDelivered: '4. Delivered (COD)',
      proofReadyTitle: 'Design Proof (BAT) Ready for Approval',
      proofReadyDesc: 'Your layout proof has been prepared by the founder. Please approve or submit requested modifications.',
      approveProofBtn: 'Approve Design Proof (BAT)',
      requestProofChangeBtn: 'Request Changes',
      proofRemarksPrompt: 'Enter your remarks or desired modifications for the founder:',
      proofRemarksSentAlert: 'Your remarks have been sent to the founder for proof revisions.',
      linkedProfile: 'Linked profile:',
      paymentLabel: 'Payment:',
      paidOnDelivery: 'Paid on delivery',
      dueOnDelivery: 'Due on delivery',
      leadsTitle: 'Received Voluntary Leads',
      leadsSubtitle: 'Contact details shared voluntarily through your NFC profile.',
      searchPlaceholder: 'Search contact...',
      colName: 'Name & Company',
      colPhone: 'Phone',
      colEmail: 'Email',
      colDate: 'Date',
      colPromo: 'Promo Opt-in',
      colContact: 'Contact',
      optInYes: 'Yes (Consented)',
      optInNo: 'No',
      analyticsNoteTitle: 'Visitor Analytics:',
      analyticsNoteDesc: 'Representative Moroccan mock data. A "Save Contact" event represents vCard download, without guarantee of permanent phone book save.',
      metricTaps: 'Taps & Profile Views',
      metricWhatsApp: 'WhatsApp Clicks',
      metricVCard: 'vCard Downloads',
      metricForms: 'Submitted Forms',
      subscriptionTitle: 'Subscription & Manual Renewal',
      subscriptionSubtitle: 'In Morocco, TAGTOP renewals are settled via bank transfer verified manually by the founder.',
      renewalSubmittedToast: 'Your transfer receipt has been sent to the founder for verification. Access will be extended upon approval.',
      bankDetailsTitle: 'Official TAGTOP Bank Details',
      claimTransferTitle: 'Submit Bank Transfer Receipt',
      renewalPeriodLabel: 'Renewal Period',
      option6Months: 'Stage 2: 6 additional months (99 MAD)',
      optionAnnual: 'Stage 3: 1 year renewal (199 MAD)',
      receiptRefLabel: 'Transfer reference or receipt number CIH / AWB',
      receiptPlaceholder: 'e.g., CIH-VIR-20261026-9042',
      submitVerificationBtn: 'Submit for Verification',
      confirmWhatsAppBtn: 'Confirm on WhatsApp',
      settingsTitle: 'Settings & Web App (PWA)',
      settingsSubtitle: 'Account configuration and web app installation guidelines.',
      pwaTitle: 'Install TAGTOP on your home screen (PWA)',
      pwaDesc: 'TAGTOP works as a Progressive Web App (PWA) without requiring App Store or Google Play downloads.',
      pwaIphone: 'On iPhone (Safari): Tap the share icon then "Add to Home Screen".',
      pwaAndroid: 'On Android (Chrome): Tap the menu (three dots) then "Install app".',
      renewal6MonthsLabel: '6-Month Extension Renewal (99 MAD)',
      renewalAnnualLabel: 'Annual Renewal (199 MAD)',
      pendingManualVerification: 'Pending manual verification by founder.',
      orderStatusReceived: 'Received',
      orderStatusArtworkReview: 'Artwork Review (BAT)',
      orderStatusCustomerApproved: 'Approved by Customer',
      orderStatusProduction: 'In Production',
      orderStatusLinked: 'Chip Linked',
      orderStatusShipped: 'Shipped',
      orderStatusDelivered: 'Delivered',
    },
    founderDashboard: {
      adminBadge: 'Single Administrator Access',
      founderTitle: 'TAGTOP Founder',
      viewCustomerPortal: 'View Customer Portal',
      tabOverview: 'Overview',
      tabCustomers: 'Customers & Profiles',
      tabOrders: 'Orders & Proofs',
      tabNfcRegistry: 'NFC Chip Registry',
      tabTransfers: 'Bank Transfers',
      tabGrace: 'Grace Period & Suspension',
      tabConfiguration: 'Configuration & Pricing',
      ordersToProcess: 'Orders to Process',
      pendingProofs: 'Pending Proofs',
      activeNfcCards: 'Active NFC Cards',
      encoded100: '100% Encoded',
      transfersToVerify: 'Transfers to Verify',
      whatsAppReceipts: 'WhatsApp Receipts',
      inGracePeriod: 'In Grace Period',
      max14Days: '14 days max',
      prioritiesTitle: 'Founder Management Priorities',
      proofsWaitingDesc: 'proof(s) awaiting artwork sign-off.',
      reviewProofsBtn: 'Review Design Proofs',
      transfersWaitingDesc: 'bank transfer receipt(s) awaiting verification.',
      verifyTransfersBtn: 'Verify Transfers',
      customersTitle: 'Registered Customers & Profiles',
      profilesManaged: 'profiles managed',
      colHolder: 'Holder & Company',
      colCity: 'City',
      colAccessStatus: 'Access Status',
      colExpiry: 'Expiry',
      colLinkedCards: 'Linked Cards',
      colChangeStatus: 'Change Status',
      ordersTitle: 'Orders & Proof Management (BAT)',
      ordersSubtitle: 'Production control, visual proof setup, COD delivery tracking.',
      codCollected: 'COD Collected',
      codPending: 'COD Pending',
      cardFinish: 'Card finish:',
      linkedProfile: 'Linked profile:',
      orderStage: 'Order stage:',
      codPayment: 'COD Payment:',
      paymentConfirmed: 'Payment confirmed',
      markCollected: 'Mark as collected',
      registryTitle: 'Official NFC Cards & Chips Registry',
      registrySubtitle: 'Physical hardware identifier (UID) tracking linked to TAGTOP profiles.',
      colHardwareUid: 'Hardware UID',
      colSerialNumber: 'Serial Number',
      colFinish: 'Finish',
      colProfile: 'Linked Profile',
      colChipStatus: 'Chip Status',
      transfersTitle: 'Manual Bank Transfers Verification',
      transfersSubtitle: 'Verify renewal receipts before extending profile access.',
      amountReceived: 'Amount received:',
      concernedProfile: 'Target profile:',
      approveAndExtend: 'Approve & Extend Access',
      reject: 'Reject',
      rejectPrompt: 'Transfer rejection reason:',
      approvedNotes: 'Transfer verified by founder',
      graceTitle: 'Grace Period (14 Days) & Suspension',
      graceSubtitle: 'Monitoring expired profiles. Discreet suspension without leaking private data.',
      restoreAccess: 'Restore Access',
      discreetlySuspend: 'Discreetly Suspend',
      settingsTitle: 'System Settings & TAGTOP Pricing',
      settingsSubtitle: 'Configuration of confirmed pricing and launch accessory status.',
      savedToast: 'Settings saved successfully!',
      starterBrandedLabel: 'Starter with TAGTOP logo (MAD)',
      fixedAt249: 'Fixed at 249 MAD',
      starterUnbrandedLabel: 'Starter without TAGTOP logo (MAD)',
      fixedAt349: 'Fixed at 349 MAD',
      renewal6MonthsLabel: '6-Month Renewal (MAD)',
      fixedAt99: 'Fixed at 99 MAD',
      renewalAnnualLabel: 'Annual Renewal (MAD)',
      fixedAt199: 'Fixed at 199 MAD',
      woodenStandCheckbox: 'Enable solid wood stand sales (Currently disabled at launch)',
      woodenStandHelp: 'While unchecked, the stand displays as "Coming Soon" and cannot be charged.',
      supportWhatsAppLabel: 'Official WhatsApp number for bank transfer confirmations',
      updateSettingsBtn: 'Update Settings',
      finishBlack: 'PVC Black',
      finishWhite: 'PVC White',
      withLogo: 'With TAGTOP logo',
      withoutLogo: 'Without TAGTOP logo',
      statusActive: 'Active',
      statusInTransit: 'In transit',
      statusPending: 'Pending',
      statusApproved: 'Approved',
      statusRejected: 'Rejected',
      orderStep1: '1. Received',
      orderStep2: '2. Artwork Review',
      orderStep3: '3. Proof Approved',
      orderStep4: '4. In Production',
      orderStep5: '5. Chip Linked',
      orderStep6: '6. Shipped',
      orderStep7: '7. Delivered',
    },
    app: {
      proofModificationSentAlert: 'Your remarks have been sent to the founder for proof revisions.',
      backToSite: '← Back to TAGTOP website',
      livePreviewOf: 'Live preview of profile',
    },
    footer: {
      mission: 'Exceptional NFC business cards and digital professional profiles for entrepreneurs and businesses in Morocco.',
      cities: 'Casablanca · Rabat · Marrakech · Tangier · Fez · Agadir',
      navTitle: 'Navigation',
      spacesTitle: 'Portals & Solutions',
      cardConfigurator: 'Card Configurator',
      liveDemo: 'Live Public Profile Demo',
      paymentTitle: 'Payment & Trust',
      paymentDesc: 'Physical cards delivered with Cash on Delivery across Morocco. Access renewals verified via secure bank transfer.',
      copyright: 'All rights reserved. Made for Morocco.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      cashOnDelivery: 'Cash On Delivery (COD)',
      cihBank: 'CIH Bank Transfer',
      ntagCertified: 'NTAG Certified',
    },
  },
};
