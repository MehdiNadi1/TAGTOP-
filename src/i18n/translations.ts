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
  };
  howItWorks: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  features: {
    title: string;
    subtitle: string;
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
    matteBlack: string;
    matteWhite: string;
    brandedTitle: string;
    brandedDesc: string;
    unbrandedTitle: string;
    unbrandedDesc: string;
    woodenStandTitle: string;
    woodenStandStatus: string;
    woodenStandDesc: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    starterTitle: string;
    starterBrandedBadge: string;
    starterUnbrandedBadge: string;
    proTitle: string;
    proDesc: string;
    proQuote: string;
    enterpriseTitle: string;
    enterpriseDesc: string;
    enterpriseQuote: string;
    timelineTitle: string;
    stage1Title: string;
    stage1Desc: string;
    stage2Title: string;
    stage2Desc: string;
    stage3Title: string;
    stage3Desc: string;
    renewalNotice: string;
  };
  configurator: {
    title: string;
    stepTier: string;
    stepColor: string;
    stepBranding: string;
    stepArtwork: string;
    stepProfile: string;
    stepAccessory: string;
    stepDelivery: string;
    stepSummary: string;
    stepProofNotice: string;
    uploadLogo: string;
    selectProfile: string;
    cityLabel: string;
    addressLabel: string;
    phoneLabel: string;
    fullNameLabel: string;
    codNotice: string;
    proofNoticeDesc: string;
    submitOrder: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
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
    expiredTitle: string;
    expiredMessage: string;
    digitalFooter: string;
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
    },
    howItWorks: {
      title: 'Une transition fluide du digital au physique',
      subtitle: 'Concevez votre profil en toute sérénité, commandez votre carte physique et recevez-la prête à l’emploi partout au Maroc.',
      step1Title: '01. Aperçu privé gratuit',
      step1Desc: 'Créez votre profil en ligne, ajoutez vos informations professionnelles, services et coordonnées. Cet aperçu reste strictement privé jusqu’à confirmation.',
      step2Title: '02. Choix & personnalisation de la carte',
      step2Desc: 'Sélectionnez votre finition PVC noire ou blanche, avec ou sans logo TAGTOP. Téléversez votre logo d’entreprise pour un rendu exclusif.',
      step3Title: '03. Validation du bon à tirer & encodage',
      step3Desc: 'Le fondateur TAGTOP prépare le visuel d’impression, vous soumet le BAT pour approbation finale, puis encode la puce avec votre profil dédié.',
      step4Title: '04. Réception prête à l’emploi',
      step4Desc: 'Livraison en paiement à la livraison (COD) partout au Maroc. Votre carte fonctionne immédiatement dès le premier contact physique.',
    },
    features: {
      title: 'Pensé pour les professionnels exigeants au Maroc',
      subtitle: 'Une technologie sans friction au service de votre image de marque et de votre développement commercial.',
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
      matteBlack: 'Noir Mat Profond',
      matteWhite: 'Blanc Mat Épuré',
      brandedTitle: 'Carte avec logo TAGTOP',
      brandedDesc: 'Comporte le discret logo TAGTOP au dos. Tarif accessible et avantageux pour les créateurs indépendants.',
      unbrandedTitle: 'Carte 100% Personnalisée',
      unbrandedDesc: 'Sans aucun marquage TAGTOP sur la carte physique. Seul le visuel de votre entreprise est imprimé.',
      woodenStandTitle: 'Support de bureau en bois massif',
      woodenStandStatus: 'Bientôt disponible',
      woodenStandDesc: 'Accessoire de comptoir ou de bureau élégant. Actuellement en cours de fabrication artisanale, disponible prochainement.',
    },
    pricing: {
      title: 'Tarification claire et sans surprise',
      subtitle: 'Un investissement physique initial comprenant votre première période de présence digitale.',
      starterTitle: 'Formule Starter',
      starterBrandedBadge: '249 MAD (Avec logo TAGTOP)',
      starterUnbrandedBadge: '349 MAD (Sans logo TAGTOP)',
      proTitle: 'Formule Pro (Pack 5 cartes)',
      proDesc: 'Pour les cabinets, associés et petites équipes gérées par un seul compte propriétaire.',
      proQuote: 'Sur devis',
      enterpriseTitle: 'Formule Entreprise',
      enterpriseDesc: 'Commandes en volume pour organisations, réseaux et grandes structures au Maroc.',
      enterpriseQuote: 'Sur devis',
      timelineTitle: 'Calendrier de présence digitale inclus & renouvellements',
      stage1Title: 'Étape 1 : 6 premiers mois inclus',
      stage1Desc: 'Inclus avec l’achat de votre carte physique Starter. Aucun frais additionnel pour démarrer.',
      stage2Title: 'Étape 2 : 6 mois suivants',
      stage2Desc: '99 MAD pour prolonger votre profil actif pendant 6 mois supplémentaires (règlement manuel par virement).',
      stage3Title: 'Étape 3 : Périodes annuelles ultérieures',
      stage3Desc: '199 MAD par an pour maintenir votre profil accessible en continu et bénéficier de toutes les mises à jour.',
      renewalNotice: 'Renouvellement manuel par virement bancaire vérifié par le fondateur via WhatsApp. Pas de prélèvement automatique.',
    },
    configurator: {
      title: 'Configurateur de Carte NFC TAGTOP',
      stepTier: '1. Formule',
      stepColor: '2. Couleur PVC',
      stepBranding: '3. Marquage',
      stepArtwork: '4. Logo & Design',
      stepProfile: '5. Profil associé',
      stepAccessory: '6. Accessoire',
      stepDelivery: '7. Coordonnées & Livraison',
      stepSummary: '8. Récapitulatif',
      stepProofNotice: '9. Validation & BAT',
      uploadLogo: 'Téléverser le logo de votre entreprise (PNG, SVG, PDF haute résolution)',
      selectProfile: 'Sélectionnez le profil digital qui sera associé à cette carte',
      cityLabel: 'Ville au Maroc',
      addressLabel: 'Adresse de livraison complète',
      phoneLabel: 'Numéro de téléphone marocain (+212)',
      fullNameLabel: 'Nom complet du destinataire',
      codNotice: 'Paiement à la livraison (Cash on Delivery) lors de la réception de votre colis physique.',
      proofNoticeDesc: 'Notre fondateur prépare votre bon à tirer (BAT). L’impression ne démarre qu’après votre accord explicite sur WhatsApp.',
      submitOrder: 'Confirmer la commande (Paiement à la livraison)',
      orderSuccessTitle: 'Commande enregistrée avec succès',
      orderSuccessDesc: 'Votre demande a été transmise à l’équipe TAGTOP. Nous vous contacterons pour valider votre maquette avant impression.',
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
      expiredTitle: 'Profil temporairement indisponible',
      expiredMessage: 'Ce profil TAGTOP n’est pas accessible actuellement. Veuillez contacter directement le titulaire pour toute demande.',
      digitalFooter: 'Propulsé par la technologie NFC TAGTOP Maroc',
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
  },
  ar: {
    common: {
      brandName: 'تاج توب',
      brandTagline: 'بطاقات العمل الذكية بتقنية NFC والملفات التعريفية الرقمية في المغرب',
      currency: 'درهم',
      language: 'اللغة',
      clientArea: 'فضاء الزبون',
      founderAdmin: 'إدارة المنصة',
      viewSite: 'العودة للموقع',
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
    },
    howItWorks: {
      title: 'تجربة انسيابية من العالم الرقمي إلى الواقعي',
      subtitle: 'صمم ملفك الشخصي بكل ثقة، واطلب بطاقتك لتصلك جاهزة للاستخدام في جميع مدن المغرب.',
      step1Title: '01. معاينة خاصة مجانية',
      step1Desc: 'أنشئ ملفك الرقمي، وأضف خدماتك وبيانات التواصل. تظل هذه المعاينة سرية وخاصة بك فقط حتى تأكيد طلبك.',
      step2Title: '02. اختيار البطاقة وتخصيصها',
      step2Desc: 'اختر اللون الأسود أو الأبيض غير اللامع، بشعار TAGTOP أو بهويتك البصرية الحصرية 100%.',
      step3Title: '03. مراجعة النموذج الأولي والبرمجة',
      step3Desc: 'يقوم مؤسس TAGTOP بإعداد التصوير الطباعي وإرساله لك عبر واتساب للموافقة، ثم برمجة شريحة NFC بملفك الخاص.',
      step4Title: '04. استلام بطاقة جاهزة للعمل',
      step4Desc: 'توصيل مع الدفع عند الاستلام في كل أنحاء المغرب. تعمل بطاقتك بمجرد لمسها لأي هاتف حديث.',
    },
    features: {
      title: 'مصممة خصيصاً لرواد الأعمال والمهنيين في المغرب',
      subtitle: 'تقنية عصرية لتعزيز مكانة علامتك التجارية وتسهيل عقد الصفقات واللقاءات.',
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
      matteBlack: 'أسود مطفي كلاسيكي',
      matteWhite: 'أبيض مطفي نقي',
      brandedTitle: 'بطاقة مع شعار TAGTOP',
      brandedDesc: 'تحتوي على شعار TAGTOP الأنيق في ظهر البطاقة. خيار اقتصادي ومثالي لأصحاب المشاريع المستقلة.',
      unbrandedTitle: 'بطاقة مخصصة بالكامل 100%',
      unbrandedDesc: 'خالية تماماً من أي علامة لـ TAGTOP على البطاقة المادية. تظهر فقط هويتك وشعارك الخاص.',
      woodenStandTitle: 'حامل مكتبي خشبي طبيعي',
      woodenStandStatus: 'قريباً',
      woodenStandDesc: 'إكسسوار مكتبي مصنوع يدوياً من الخشب الطبيعي. قيد التجهيز وسيتوفر للشراء قريباً.',
    },
    pricing: {
      title: 'أسعار واضحة ومحددة بكل شفافية',
      subtitle: 'استثمار مادي لبطاقتك يتضمن فترة حضورك الرقمي الأولى دون أي رسوم خفية.',
      starterTitle: 'باقة ستارتـر (Starter)',
      starterBrandedBadge: '249 درهم (مع شعار TAGTOP)',
      starterUnbrandedBadge: '349 درهم (بدون شعار TAGTOP)',
      proTitle: 'باقة المحترفين Pro (حزمة 5 بطاقات)',
      proDesc: 'للفرق الصغيرة والمكاتب المشتركة المدارة بواسطة صاحب عمل واحد.',
      proQuote: 'طلب عرض أسعار',
      enterpriseTitle: 'باقة المؤسسات Enterprise',
      enterpriseDesc: 'للطلبات الكبيرة والشركات والهيئات في جميع أنحاء المملكة.',
      enterpriseQuote: 'طلب عرض أسعار',
      timelineTitle: 'جدول الحضور الرقمي المتضمن والتجديد',
      stage1Title: 'المرحلة 1: أول 6 أشهر متضمنة مجاناً',
      stage1Desc: 'متضمنة مع ثمن البطاقة المادية. لا توجد أي تكلفة إضافية للبدء.',
      stage2Title: 'المرحلة 2: الـ 6 أشهر التالية',
      stage2Desc: '99 درهم فقط لتمديد تفعيل الملف الرقمي لـ 6 أشهر إضافية (تحويل بنكي يدوي).',
      stage3Title: 'المرحلة 3: الفترات السنوية اللاحقة',
      stage3Desc: '199 درهم سنوياً للاستمرار في الخدمة والتمتع بكافة التحديثات والميزات.',
      renewalNotice: 'تجديد يدوي عبر تحويل بنكي يتم التحقق منه بواسطة المؤسس عبر واتساب. لا يوجد اقتطاع بنكي تلقائي.',
    },
    configurator: {
      title: 'مخصص بطاقة NFC الذكية من TAGTOP',
      stepTier: '1. نوع الباقة',
      stepColor: '2. لون البطاقة',
      stepBranding: '3. نمط الهوية',
      stepArtwork: '4. الشعار والتصميم',
      stepProfile: '5. الملف المرتبط',
      stepAccessory: '6. إكسسوار إضافي',
      stepDelivery: '7. معلومات التوصيل',
      stepSummary: '8. ملخص الطلب',
      stepProofNotice: '9. مراجعة النموذج والطباعة',
      uploadLogo: 'ارفع شعار شركتك (بصيغة PNG أو SVG أو PDF عالي الدقة)',
      selectProfile: 'اختر الملف الرقمي الذي سيتم ربطه بهذه البطاقة',
      cityLabel: 'المدينة في المغرب',
      addressLabel: 'عنوان التوصيل بالتفصيل',
      phoneLabel: 'رقم الهاتف للتواصل والتسليم (+212)',
      fullNameLabel: 'الاسم الكامل للمستلم',
      codNotice: 'الدفع نقداً عند الاستلام (COD) عند وصول البطاقة إلى عنوانك.',
      proofNoticeDesc: 'يقوم المؤسس بإعداد مسودة الطباعة وإرسالها لك. لن تبدأ الطباعة إلا بعد موافقتك الصريحة عبر واتساب.',
      submitOrder: 'تأكيد الطلب (الدفع عند الاستلام)',
      orderSuccessTitle: 'تم تسجيل طلبك بنجاح',
      orderSuccessDesc: 'سيتواصل معك فريق TAGTOP عبر واتساب لمراجعة التصميم النهائي قبل الطباعة.',
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
      expiredTitle: 'الملف غير متوفر حالياً',
      expiredMessage: 'هذا الملف الشخصي غير متاح حالياً. يرجى التواصل مع صاحبه عبر قنواته الرسمية.',
      digitalFooter: 'مدعوم بتقنية بطاقات TAGTOP الذكية بالمغرب',
    },
    dashboard: {
      customerTitle: 'لوحة تحكم الزبون TAGTOP',
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
    },
    howItWorks: {
      title: 'Seamless bridge from digital to physical networking',
      subtitle: 'Build your profile in peace, customize your physical card, and receive it ready to tap anywhere in Morocco.',
      step1Title: '01. Free Private Preview',
      step1Desc: 'Set up your online profile with services, bio, and contact channels. It remains strictly private to you until order approval.',
      step2Title: '02. Card Choice & Customization',
      step2Desc: 'Choose matte black or white PVC, branded with TAGTOP or 100% bespoke with only your company artwork.',
      step3Title: '03. Proof Review & Chip Linking',
      step3Desc: 'The TAGTOP founder prepares your visual proof for WhatsApp sign-off, then securely links your NFC chip to your profile.',
      step4Title: '04. Arrives Ready to Use',
      step4Desc: 'Cash on delivery across Morocco. Your card works immediately on arrival with no tedious client self-activation.',
    },
    features: {
      title: 'Engineered for discerning Moroccan business leaders',
      subtitle: 'Frictionless contactless technology designed to elevate your brand prestige and convert introductions into deals.',
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
      matteBlack: 'Deep Matte Black',
      matteWhite: 'Clean Matte White',
      brandedTitle: 'Card with TAGTOP Logo',
      brandedDesc: 'Includes discreet TAGTOP hallmark on the reverse. Most accessible pricing for solopreneurs.',
      unbrandedTitle: '100% Bespoke Unbranded Card',
      unbrandedDesc: 'Zero TAGTOP markings on the physical card. Exclusively highlights your enterprise identity.',
      woodenStandTitle: 'Natural Solid Wood Desk Stand',
      woodenStandStatus: 'Coming Soon',
      woodenStandDesc: 'Handcrafted natural timber desktop holder. Currently in artisan production, available soon.',
    },
    pricing: {
      title: 'Transparent, predictable pricing',
      subtitle: 'A single hardware purchase that includes your qualifying initial digital presence.',
      starterTitle: 'Starter Card',
      starterBrandedBadge: '249 MAD (With TAGTOP logo)',
      starterUnbrandedBadge: '349 MAD (Without TAGTOP logo)',
      proTitle: 'Pro Bundle (5 Cards)',
      proDesc: 'For partnerships, clinics, and small teams managed by a single owner account.',
      proQuote: 'Request a quote',
      enterpriseTitle: 'Enterprise Volume',
      enterpriseDesc: 'Volume orders for organizations, hotel chains, and corporate divisions in Morocco.',
      enterpriseQuote: 'Request a quote',
      timelineTitle: 'Confirmed 3-stage access & renewal schedule',
      stage1Title: 'Stage 1: First 6 Months Included',
      stage1Desc: 'Included with your physical Starter card. Zero extra cost to get up and running.',
      stage2Title: 'Stage 2: Next 6 Months',
      stage2Desc: '99 MAD for your next 6 months of active hosting (manual bank transfer verified by founder).',
      stage3Title: 'Stage 3: Subsequent Annual Periods',
      stage3Desc: '199 MAD per year to retain active public visibility and uninterrupted profile features.',
      renewalNotice: 'Manual renewal verified by founder via WhatsApp. No recurring card charges or surprise billing.',
    },
    configurator: {
      title: 'TAGTOP NFC Card Configurator',
      stepTier: '1. Package',
      stepColor: '2. Card Color',
      stepBranding: '3. Physical Branding',
      stepArtwork: '4. Logo & Design',
      stepProfile: '5. Linked Profile',
      stepAccessory: '6. Accessory',
      stepDelivery: '7. Moroccan Delivery',
      stepSummary: '8. Itemized Summary',
      stepProofNotice: '9. Proof Approval Policy',
      uploadLogo: 'Upload your company logo (High-res PNG, SVG, or vector PDF)',
      selectProfile: 'Select the digital profile to link with this card',
      cityLabel: 'City in Morocco',
      addressLabel: 'Full street delivery address',
      phoneLabel: 'Recipient contact phone (+212)',
      fullNameLabel: 'Recipient full name',
      codNotice: 'Cash on delivery (COD) upon receiving your package.',
      proofNoticeDesc: 'Our founder prepares your layout proof for WhatsApp confirmation before any card is printed.',
      submitOrder: 'Confirm Order (Cash on Delivery)',
      orderSuccessTitle: 'Order Received Successfully',
      orderSuccessDesc: 'Your request has been logged. TAGTOP will contact you via WhatsApp for final design proof approval.',
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
      expiredTitle: 'Profile Temporarily Unavailable',
      expiredMessage: 'This TAGTOP profile is currently unavailable. Please contact the owner through their primary business channels.',
      digitalFooter: 'Powered by TAGTOP Morocco NFC Technology',
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
  },
};
