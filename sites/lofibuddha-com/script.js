/**
 * 🧘 Bodhi i18n Translation Engine
 * Lazy-loads translations, detects browser language, persists preference.
 * Supports: EN, NL, ES, DE, FR, HI
 * v1.0 — aibuddha.net + lofibuddha.com
 */
(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────
  const SUPPORTED = ['en', 'nl', 'es', 'de', 'fr', 'hi'];
  const STORAGE_KEY = 'bodhi-lang';

  // ─── TRANSLATIONS ──────────────────────────────
  const T = {
    en: {},
    nl: {},
    es: {},
    de: {},
    fr: {},
    hi: {}
  };

  // Helper: add translation key across languages
  function add(key, en, nl, es, de, fr, hi) {
    T.en[key] = en;
    T.nl[key] = nl || en;
    T.es[key] = es || en;
    T.de[key] = de || en;
    T.fr[key] = fr || en;
    T.hi[key] = hi || en;
  }

  // ═══════════════ NAVIGATION ═══════════════
  add('nav-philosophy', 'Philosophy', 'Filosofie', 'Filosofía', 'Philosophie', 'Philosophie', 'दर्शन');
  add('nav-lofi', 'Lofi Radio', 'Lofi Radio', 'Radio Lofi', 'Lofi Radio', 'Radio Lofi', 'लोफाई रेडियो');
  add('nav-chat', 'Talk to Buddha', 'Praat met Boeddha', 'Habla con Buda', 'Sprich mit Buddha', 'Parler à Bouddha', 'बुद्ध से बात करें');
  add('nav-meditate', 'Meditation', 'Meditatie', 'Meditación', 'Meditation', 'Méditation', 'ध्यान');
  add('nav-pricing', 'Pricing', 'Prijzen', 'Precios', 'Preise', 'Tarifs', 'मूल्य');
  add('nav-try', 'Try Now', 'Probeer Nu', 'Probar Ahora', 'Jetzt testen', 'Essayer', 'आज़माएं');

  // ═══════════════ HERO ═══════════════
  add('hero-tagline', 'Bringing Wisdom to the Digital Age', 'Wijsheid naar het Digitale Tijdperk');
  add('hero-title', 'Find your inner peace with <span>AI Buddha</span>', 'Vind je innerlijke rust met <span>AI Buddha</span>');
  add('hero-desc', 'Your personal AI companion for meditation, mindfulness, and ancient wisdom — available anytime through chat.',
    'Jouw persoonlijke AI metgezel voor meditatie, mindfulness en eeuwenoude wijsheid — altijd beschikbaar via chat.');
  add('hero-cta-chat', 'Start Chatting', 'Begin Gesprek', 'Iniciar Chat', 'Chat starten', 'Démarrer', 'चैट शुरू करें');
  add('hero-cta-meditate', 'Begin Meditation', 'Start Meditatie', 'Comenzar Meditación', 'Meditation beginnen', 'Méditer', 'ध्यान शुरू करें');

  // ═══════════════ FEATURES ═══════════════
  add('features-label', 'Why AI Buddha?', 'Waarom AI Buddha?');
  add('features-title', 'Ancient Wisdom Meets Cutting-edge Tech', 'Eeuwenoude Wijsheid Ontmoet Moderne Tech');
  add('features-desc', 'AI Buddha combines the timeless teachings of Buddhist philosophy with modern AI to guide you toward peace of mind.',
    'AI Buddha combineert de tijdloze lessen van boeddhistische filosofie met moderne AI om je naar gemoedsrust te leiden.');
  add('feat1-title', 'Instant Calm & Guidance', 'Directe Rust & Begeleiding');
  add('feat1-desc', 'Receive personalized wisdom, meditations, and mindfulness exercises tailored to your state of mind.',
    'Ontvang gepersonaliseerde wijsheid, meditaties en mindfulness oefeningen afgestemd op jouw gemoedstoestand.');
  add('feat2-title', 'Digital Mindfulness', 'Digitale Mindfulness');
  add('feat2-desc', 'Learn to navigate the digital world with intention. Reduce screen anxiety through guided breathing and focus exercises.',
    'Leer bewust navigeren in de digitale wereld. Verminder schermstress met geleide ademhaling en focus oefeningen.');
  add('feat3-title', '100% Safe & Private', '100% Veilig & Privé');
  add('feat3-desc', 'Your conversations are anonymous and never stored. No accounts required — just open, breathe, and begin.',
    'Je gesprekken zijn anoniem en worden nooit opgeslagen. Geen account nodig — open, adem en begin.');

  // ═══════════════ LOFI ═══════════════
  add('lofi-label', 'Lofi Radio', 'Lofi Radio');
  add('lofi-title', 'Focus & Flow Music', 'Focus & Flow Muziek');
  add('lofi-desc', 'Curated lofi beats to help you focus, relax, and enter a state of flow. No ads, no interruptions.',
    'Zorgvuldig geselecteerde lofi beats om te focussen, ontspannen en in een flow te komen. Geen reclame, geen onderbrekingen.');
  add('lofi-sidebar-title', 'Now Playing', 'Nu aan het luisteren');
  add('lofi-live-title', 'Live Lofi Stream', 'Live Lofi Stream');
  add('lofi-live-desc', '24/7 lofi radio — always on, always calm.', '24/7 lofi radio — altijd aan, altijd rustig.');

  // ═══════════════ CHAT ═══════════════
  add('chat-label', 'Talk to Buddha', 'Praat met Boeddha');
  add('chat-title', 'Have a Conversation', 'Voer een Gesprek');
  add('chat-desc', 'Ask anything — from life advice to meditation techniques. AI Buddha responds with compassion and wisdom.',
    'Vraag alles — van levensadvies tot meditatietechnieken. AI Buddha antwoordt met compassie en wijsheid.');
  add('chat-greeting', 'Welcome, seeker of peace. How may I guide you today? 🧘',
    'Welkom, zoeker naar rust. Hoe kan ik je vandaag begeleiden? 🧘');
  add('chat-placeholder', 'Type your message...', 'Typ je bericht...');
  add('chat-status', 'AI Buddha is listening...', 'AI Buddha luistert...');
  add('chat-card1-title', 'Daily Guidance', 'Dagelijkse Begeleiding');
  add('chat-card1-prompt', 'Give me a mindfulness tip for today', 'Geef me een mindfulness tip voor vandaag');
  add('chat-card2-title', 'Stress Relief', 'Stress Verlichting');
  add('chat-card2-prompt', 'I\'m feeling overwhelmed, help me calm down', 'Ik voel me overweldigd, help me kalmeren');
  add('chat-card3-title', 'Sleep Better', 'Beter Slapen');
  add('chat-card3-prompt', 'Guide me through a bedtime meditation', 'Begeleid me door een meditatie voor het slapengaan');

  // ═══════════════ MEDITATION ═══════════════
  add('meditate-label', 'Meditation', 'Meditatie');
  add('meditate-title', 'Timed Meditation', 'Getimede Meditatie');
  add('meditate-desc', 'Set a timer and let AI Buddha guide you through a calming breath meditation. All processing happens locally in your browser.',
    'Stel een timer in en laat AI Buddha je door een kalmerende ademhalingsmeditatie leiden. Alles gebeurt lokaal in je browser.');
  add('meditate-min', 'min', 'min');
  add('meditate-btn-start', 'Start Meditation', 'Start Meditatie');
  add('meditate-btn-stop', 'Stop', 'Stop');
  add('meditate-bullet1-title', 'Guided Breathing', 'Geleide Ademhaling');
  add('meditate-bullet1-desc', 'Follow the rhythm of your breath with visual cues', 'Volg het ritme van je ademhaling met visuele aanwijzingen');
  add('meditate-bullet2-title', 'Ambient Sounds', 'Omgevingsgeluiden');
  add('meditate-bullet2-desc', 'Optional nature sounds to deepen your practice', 'Optionele natuurgeluiden om je beoefening te verdiepen');
  add('meditate-info-title', 'How It Works', 'Hoe Het Werkt');
  add('meditate-info-desc', 'The meditation timer runs entirely in your browser. No data is sent anywhere. Simply set your desired duration and begin.',
    'De meditatietimer draait volledig in je browser. Er wordt geen data verzonden. Stel gewoon je gewenste duur in en begin.');
  add('breath-inhale', 'Breathe in...', 'Adem in...');
  // 'breath-exhale' not used in current pages

  // ═══════════════ PRICING ═══════════════
  add('price-label', 'Pricing', 'Prijzen');
  add('price-title', 'Choose Your Path', 'Kies Je Pad');
  add('price-desc', 'Every journey begins with a single step. Start free, upgrade when you\'re ready.',
    'Elke reis begint met een enkele stap. Begin gratis, upgrade wanneer je er klaar voor bent.');
  add('price-free-name', 'Seeker', 'Zoeker');
  add('price-free-period', 'Free forever', 'Gratis voor altijd');
  add('price-free-desc', 'Basic chat access, 5-min meditation timer, and daily wisdom quotes.',
    'Basis chat toegang, 5-min meditatietimer, en dagelijkse wijsheid quotes.');
  add('price-mid-name', 'Monk', 'Monnik');
  add('price-mid-period', '/month', '/maand');
  add('price-mid-desc', 'Unlimited chat, 30-min meditation timer, guided sessions, and ad-free lofi radio.',
    'Onbeperkte chat, 30-min meditatietimer, geleide sessies, en reclamevrije lofi radio.');
  add('price-high-name', 'Enlightened', 'Verlicht');
  add('price-high-period', '/month', '/maand');
  add('price-high-desc', 'Everything in Monk + personal guidance plans, priority support, and early access to new features.',
    'Alles in Monnik + persoonlijke begeleidingsplannen, prioriteit support, en vroege toegang tot nieuwe functies.');
  add('price-popular-badge', 'Most Popular', 'Meest Gekozen');
  add('price-btn-free', 'Start Free', 'Gratis Beginnen');
  add('price-btn-mid', 'Choose Monk Path', 'Kies Monnik Pad');
  add('price-btn-high', 'Choose Enlightened Path', 'Kies Verlicht Pad');
  add('feat-timer-basic', '5-min meditation timer', '5-min meditatietimer');
  add('feat-timer-all', '30-min meditation timer', '30-min meditatietimer');
  add('feat-chats-limit', '10 chats/day', '10 chats/dag');
  add('feat-chats-unlimit', 'Unlimited chats', 'Onbeperkte chats');
  add('feat-quotes', 'Daily wisdom quotes', 'Dagelijkse wijsheid quotes');
  add('feat-reflection', 'Guided reflection sessions', 'Geleide reflectiesessies');
  add('feat-history', 'Chat history', 'Chat geschiedenis');
  add('feat-sutras', 'Access to digital sutras', 'Toegang tot digitale sutras');
  add('feat-early', 'Early access to features', 'Vroege toegang tot functies');
  add('feat-support', 'Direct support from developers', 'Directe ondersteuning van ontwikkelaars');
  add('feat-premium-all', 'Everything in Seeker, plus:', 'Alles in Zoeker, plus:');

  // ═══════════════ QUOTE ═══════════════
  add('quote-text', '"Peace comes from within. Do not seek it without."', '"Rust komt van binnen. Zoek het niet buiten jezelf."');
  add('quote-author', '— Buddha', '— Boeddha');

  // ═══════════════ FOOTER ═══════════════
  add('footer-desc', 'Ancient wisdom and modern mindfulness combined to bring calm to the digital age.',
    'Eeuwenoude wijsheid en moderne mindfulness gecombineerd om rust te brengen in het digitale tijdperk.');
  add('footer-brand-nav', 'Navigation', 'Navigatie');
  add('footer-brand-legal', 'Legal', 'Juridisch');
  add('footer-brand-contact', 'Contact', 'Contact');
  add('footer-privacy', 'Privacy Policy', 'Privacybeleid');
  add('footer-terms', 'Terms & Conditions', 'Algemene Voorwaarden');
  add('footer-disclaimer', 'Disclaimer', 'Disclaimer');
  add('footer-rights', 'All rights reserved.', 'Alle rechten voorbehouden.');

  // ═══════════════ LEGAL: SHARED ═══════════════
  add('legal-updated', 'Last updated: June 2026', 'Laatst bijgewerkt: juni 2026');
  add('legal-back', '← Back to Home', '← Terug naar Home');

  // ═══════════════ LEGAL: PRIVACY POLICY ═══════════════
  add('legal-privacy-title', 'Privacy Policy — AI Buddha', 'Privacybeleid — AI Buddha');
  add('legal-privacy-h1', 'Privacy Policy', 'Privacybeleid');
  add('legal-privacy-notice', '🧘 At <strong>AI Buddha</strong>, your peace of mind includes how your data is handled. We collect minimal data and never sell or share it.',
    '🧘 Bij <strong>AI Buddha</strong> hoort jouw gemoedsrust ook bij hoe we met je data omgaan. We verzamelen minimale data en verkopen of delen deze nooit.');
  add('legal-privacy-s1', '1. Information We Collect', '1. Informatie Die We Verzamelen');
  add('legal-privacy-s1a', '1.1 Chat Conversations', '1.1 Chatgesprekken');
  add('legal-privacy-s1a-p', 'Your conversations with AI Buddha are processed in real-time to generate responses. Messages are <strong>anonymized</strong> and <strong>not permanently stored</strong>. We do not retain chat history on our servers.',
    'Je gesprekken met AI Buddha worden real-time verwerkt om antwoorden te genereren. Berichten zijn <strong>geanomiseerd</strong> en worden <strong>niet permanent opgeslagen</strong>. We bewaren geen chatgeschiedenis op onze servers.');
  add('legal-privacy-s1b', '1.2 Meditation & Timer Data', '1.2 Meditatie & Timer Data');
  add('legal-privacy-s1b-p', 'The meditation timer runs <strong>entirely in your browser</strong>. Duration preferences are stored locally in localStorage and never sent to our servers. No personal health data is collected.',
    'De meditatietimer draait <strong>volledig in je browser</strong>. Tijdsvoorkeuren worden lokaal opgeslagen in localStorage en nooit naar onze servers gestuurd. Er wordt geen persoonlijke gezondheidsdata verzameld.');
  add('legal-privacy-s1c', '1.3 Usage Analytics', '1.3 Gebruiksanalyse');
  add('legal-privacy-s1c-p', 'We collect <strong>anonymous</strong> usage data: pages visited, features used, time spent. This helps us improve the experience. No personal identifiers are included.',
    'We verzamelen <strong>anonieme</strong> gebruiksdata: bezochte pagina\'s, gebruikte functies, tijdsduur. Dit helpt ons de ervaring te verbeteren. Er zijn geen persoonlijke identificatiegegevens in opgenomen.');
  add('legal-privacy-s1d', '1.4 Language Preferences', '1.4 Taalvoorkeuren');
  add('legal-privacy-s1d-p', 'Your language preference is stored in your browser\'s localStorage. This is purely for your convenience and is never transmitted.',
    'Je taalvoorkeur wordt opgeslagen in de localStorage van je browser. Dit is puur voor je gemak en wordt nooit verzonden.');
  add('legal-privacy-s1e', '1.5 Lofi Radio', '1.5 Lofi Radio');
  add('legal-privacy-s1e-p', 'The lofi radio player streams from a public CDN. We do not track individual listening habits.',
    'De lofi radio speler streamt vanaf een publieke CDN. We volgen geen individuele luistergewoonten.');
  add('legal-privacy-s2', '2. How We Use Your Data', '2. Hoe We Je Data Gebruiken');
  add('legal-privacy-s2-1', 'To generate AI responses in real-time', 'Om AI-antwoorden in real-time te genereren');
  add('legal-privacy-s2-2', 'To improve the AI Buddha experience through anonymous analytics', 'Om de AI Buddha ervaring te verbeteren via anonieme analyses');
  add('legal-privacy-s2-3', 'To remember your language and theme preferences', 'Om je taal- en themavoorkeuren te onthouden');
  add('legal-privacy-s2-4', 'We do NOT use your data for advertising, profiling, or selling to third parties', 'We gebruiken je data NIET voor advertenties, profilering of verkoop aan derden');
  add('legal-privacy-s3', '3. Cookies & Local Storage', '3. Cookies & Lokale Opslag');
  add('legal-privacy-s3-p', 'AI Buddha uses <strong>no tracking cookies</strong>. We only use localStorage (browser storage) to save your language preference, theme choice, and meditation timer settings. This data never leaves your device.',
    'AI Buddha gebruikt <strong>geen tracking cookies</strong>. We gebruiken alleen localStorage (browseropslag) om je taalvoorkeur, themakeuze en meditatietimerinstellingen op te slaan. Deze data verlaat nooit je apparaat.');
  add('legal-privacy-s4', '4. Third-Party Services', '4. Diensten van Derden');
  add('legal-privacy-s4-p', 'The AI chat feature uses the DeepSeek API to generate responses. Messages sent to DeepSeek are processed according to their privacy policy. The lofi radio player uses YouTube\'s embedded player which may set its own cookies.',
    'De AI-chatfunctie gebruikt de DeepSeek API om antwoorden te genereren. Berichten die naar DeepSeek worden gestuurd, worden verwerkt volgens hun privacybeleid. De lofi radio speler gebruikt YouTube\'s ingebedde speler die eigen cookies kan plaatsen.');
  add('legal-privacy-s5', '5. Your Rights', '5. Jouw Rechten');
  add('legal-privacy-s5-1', 'Access any personal data we hold (virtually none)', 'Toegang tot persoonlijke data die we bewaren (vrijwel niets)');
  add('legal-privacy-s5-2', 'Request deletion of any stored data', 'Verwijdering aanvragen van opgeslagen data');
  add('legal-privacy-s5-3', 'Opt out of anonymous analytics', 'Afmelden voor anonieme analyses');
  add('legal-privacy-s5-4', 'Use the site without any data collection by disabling JavaScript', 'De site gebruiken zonder dataverzameling door JavaScript uit te schakelen');
  add('legal-privacy-s5-5', 'Contact us at privacy@aibuddha.net for any privacy concerns', 'Neem contact op via privacy@aibuddha.net voor privacyvragen');
  add('legal-privacy-s6', '6. Data Security', '6. Gegevensbeveiliging');
  add('legal-privacy-s6-p', 'We implement industry-standard security measures. Since we store virtually no personal data, the risk of data breaches affecting you is minimal.',
    'We implementeren industriestandaard beveiligingsmaatregelen. Omdat we vrijwel geen persoonlijke data opslaan, is het risico op datalekken voor jou minimaal.');
  add('legal-privacy-s7', '7. Children\'s Privacy', '7. Privacy van Kinderen');
  add('legal-privacy-s7-p', 'AI Buddha is not directed at children under 13. We do not knowingly collect data from anyone under 13.',
    'AI Buddha is niet gericht op kinderen onder de 13. We verzamelen niet bewust data van iemand onder de 13.');
  add('legal-privacy-s8', '8. Changes to This Policy', '8. Wijzigingen in Dit Beleid');
  add('legal-privacy-s8-p', 'We may update this privacy policy from time to time. Changes will be posted on this page with an updated date.',
    'We kunnen dit privacybeleid van tijd tot tijd bijwerken. Wijzigingen worden op deze pagina geplaatst met een bijgewerkte datum.');
  add('legal-privacy-no-sell', 'We do not sell your personal data.', 'We verkopen je persoonlijke data niet.');

  // ═══════════════ LEGAL: TERMS ═══════════════
  add('legal-terms-title', 'Terms & Conditions — AI Buddha', 'Algemene Voorwaarden — AI Buddha');
  add('legal-terms-h1', 'Terms & Conditions', 'Algemene Voorwaarden');
  add('legal-terms-intro', 'By using AI Buddha, you agree to these terms. Please read them carefully.',
    'Door AI Buddha te gebruiken, ga je akkoord met deze voorwaarden. Lees ze zorgvuldig.');
  add('legal-terms-s1', '1. Service Description', '1. Beschrijving van de Dienst');
  add('legal-terms-s1-p', 'AI Buddha provides AI-powered chat conversations, guided meditations, lofi radio streaming, and mindfulness content. The service is for <strong>entertainment and personal development purposes only</strong>.',
    'AI Buddha biedt AI-gestuurde chatgesprekken, geleide meditaties, lofi radio streaming en mindfulness content. De dienst is <strong>alleen voor entertainment en persoonlijke ontwikkeling</strong>.');
  add('legal-terms-s2', '2. Account & Usage', '2. Account & Gebruik');
  add('legal-terms-s2-p', 'No account is required for basic features. Premium features may require registration. You are responsible for maintaining the confidentiality of your account.',
    'Er is geen account nodig voor basisfuncties. Premium functies kunnen registratie vereisen. Je bent verantwoordelijk voor het vertrouwelijk houden van je account.');
  add('legal-terms-s3', '3. Acceptable Use', '3. Acceptabel Gebruik');
  add('legal-terms-s3-1', 'Do not use the service for illegal activities', 'Gebruik de dienst niet voor illegale activiteiten');
  add('legal-terms-s3-2', 'Do not attempt to exploit, hack, or disrupt the service', 'Probeer de dienst niet te misbruiken, hacken of verstoren');
  add('legal-terms-s3-3', 'Do not upload malicious content or spam', 'Upload geen kwaadaardige content of spam');
  add('legal-terms-s3-4', 'Respect the peaceful nature of the platform', 'Respecteer het vreedzame karakter van het platform');
  add('legal-terms-s4', '4. Intellectual Property', '4. Intellectueel Eigendom');
  add('legal-terms-s4-p', 'All content, design, and code on AI Buddha is owned by us. The AI Buddha name, logo, and branding are trademarks. The lofi music streams are sourced from royalty-free or properly licensed providers.',
    'Alle content, design en code op AI Buddha is ons eigendom. De naam, het logo en de branding van AI Buddha zijn handelsmerken. De lofi muziekstreams zijn afkomstig van royalty-vrije of correct gelicentieerde aanbieders.');
  add('legal-terms-s5', '5. AI Disclaimer', '5. AI Disclaimer');
  add('legal-terms-s5-p', 'AI Buddha uses artificial intelligence to generate responses. While we strive for accuracy and helpfulness, AI-generated content may occasionally be incorrect or inappropriate. <strong>Always use your own judgment.</strong>',
    'AI Buddha gebruikt kunstmatige intelligentie om antwoorden te genereren. Hoewel we streven naar nauwkeurigheid en behulpzaamheid, kan AI-gegenereerde content soms onjuist of ongepast zijn. <strong>Gebruik altijd je eigen oordeel.</strong>');
  add('legal-terms-s6', '6. Payments & Subscriptions', '6. Betalingen & Abonnementen');
  add('legal-terms-s6-p', 'Premium subscriptions are processed securely through Stripe. Subscriptions auto-renew unless cancelled. Refund requests are handled on a case-by-case basis within 14 days of purchase.',
    'Premium abonnementen worden veilig verwerkt via Stripe. Abonnementen worden automatisch verlengd tenzij geannuleerd. Terugbetalingsverzoeken worden per geval behandeld binnen 14 dagen na aankoop.');
  add('legal-terms-s7', '7. Limitation of Liability', '7. Beperking van Aansprakelijkheid');
  add('legal-terms-s7-p', 'AI Buddha is provided "as is" without warranties. We are not liable for any damages arising from the use of the service. This includes but is not limited to emotional distress, data loss, or technical issues.',
    'AI Buddha wordt geleverd "zoals het is" zonder garanties. We zijn niet aansprakelijk voor schade voortvloeiend uit het gebruik van de dienst. Dit omvat maar is niet beperkt tot emotionele stress, gegevensverlies of technische problemen.');
  add('legal-terms-s8', '8. Termination', '8. Beëindiging');
  add('legal-terms-s8-p', 'We reserve the right to terminate or suspend access to the service at any time, without notice, for any reason including violation of these terms.',
    'We behouden het recht om de toegang tot de dienst op elk moment te beëindigen of op te schorten, zonder kennisgeving, om welke reden dan ook, inclusief schending van deze voorwaarden.');
  add('legal-terms-s9', '9. Changes to Terms', '9. Wijzigingen in Voorwaarden');
  add('legal-terms-s9-p', 'We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.',
    'We kunnen deze voorwaarden op elk moment bijwerken. Voortgezet gebruik van de dienst na wijzigingen betekent aanvaarding van de nieuwe voorwaarden.');
  add('legal-terms-s10', '10. Contact', '10. Contact');
  add('legal-terms-s10-p', 'For questions about these terms: <a href="mailto:legal@aibuddha.net">legal@aibuddha.net</a>',
    'Voor vragen over deze voorwaarden: <a href="mailto:legal@aibuddha.net">legal@aibuddha.net</a>');

  // ═══════════════ LEGAL: DISCLAIMER ═══════════════
  add('legal-disclaimer-title', 'Disclaimer — AI Buddha', 'Disclaimer — AI Buddha');
  add('legal-disclaimer-h1', 'Disclaimer', 'Disclaimer');
  add('legal-disclaimer-warning', '⚠️ <strong>Important:</strong> Please read this disclaimer carefully before using AI Buddha.',
    '⚠️ <strong>Belangrijk:</strong> Lees deze disclaimer zorgvuldig voordat je AI Buddha gebruikt.');
  add('legal-disclaimer-s1', '1. Not Medical Advice', '1. Geen Medisch Advies');
  add('legal-disclaimer-s1-p', 'AI Buddha is <strong>not a healthcare provider</strong>. The content, chat responses, and meditation guidance are for informational and entertainment purposes only. They do not constitute medical advice, diagnosis, or treatment. <strong>Always consult a qualified healthcare professional</strong> for mental health concerns.',
    'AI Buddha is <strong>geen zorgverlener</strong>. De content, chatantwoorden en meditatiebegeleiding zijn alleen voor informatieve en entertainmentdoeleinden. Ze vormen geen medisch advies, diagnose of behandeling. <strong>Raadpleeg altijd een gekwalificeerde zorgverlener</strong> voor mentale gezondheidskwesties.');
  add('legal-disclaimer-s2', '2. AI Limitations', '2. Beperkingen van AI');
  add('legal-disclaimer-s2-p', 'AI Buddha is powered by artificial intelligence. AI has inherent limitations:',
    'AI Buddha wordt aangedreven door kunstmatige intelligentie. AI heeft inherente beperkingen:');
  add('legal-disclaimer-s2-1', 'Responses may be inaccurate or incomplete', 'Antwoorden kunnen onnauwkeurig of onvolledig zijn');
  add('legal-disclaimer-s2-2', 'AI cannot understand human emotions in the way a therapist can', 'AI kan menselijke emoties niet begrijpen zoals een therapeut dat kan');
  add('legal-disclaimer-s2-3', 'The AI does not have lived experience or true consciousness', 'De AI heeft geen geleefde ervaring of echt bewustzijn');
  add('legal-disclaimer-s2-4', 'Always verify important information independently', 'Verifieer belangrijke informatie altijd onafhankelijk');
  add('legal-disclaimer-s2-closing', 'Use AI Buddha as a supplement to — not a replacement for — professional guidance.',
    'Gebruik AI Buddha als aanvulling op — niet als vervanging van — professionele begeleiding.');
  add('legal-disclaimer-s3', '3. Meditation & Mindfulness', '3. Meditatie & Mindfulness');
  add('legal-disclaimer-s3-p', 'Meditation and breathing exercises are generally safe but may not be suitable for everyone. If you experience discomfort, dizziness, or emotional distress during any exercise, <strong>stop immediately</strong> and consult a professional.',
    'Meditatie en ademhalingsoefeningen zijn over het algemeen veilig maar mogelijk niet voor iedereen geschikt. Als je ongemak, duizeligheid of emotionele stress ervaart tijdens een oefening, <strong>stop dan onmiddellijk</strong> en raadpleeg een professional.');
  add('legal-disclaimer-s4', '4. Lofi Music & Audio', '4. Lofi Muziek & Audio');
  add('legal-disclaimer-s4-p', 'The lofi radio streams are sourced from public platforms (YouTube). We do not host or own the music. If you are a copyright holder and have concerns, please contact us at legal@aibuddha.net.',
    'De lofi radio streams zijn afkomstig van publieke platforms (YouTube). We hosten of bezitten de muziek niet. Als je een auteursrechthebbende bent en zorgen hebt, neem dan contact op via legal@aibuddha.net.');
  add('legal-disclaimer-s5', '5. Spiritual Content', '5. Spirituele Content');
  add('legal-disclaimer-s5-p', 'AI Buddha draws inspiration from Buddhist philosophy and various mindfulness traditions. This content is presented in a secular, educational context. It is not intended to promote or denigrate any specific religion.',
    'AI Buddha put inspiratie uit boeddhistische filosofie en verschillende mindfulnesstradities. Deze content wordt gepresenteerd in een seculiere, educatieve context. Het is niet bedoeld om een specifieke religie te promoten of te kleineren.');
  add('legal-disclaimer-s6', '6. Technical Reliability', '6. Technische Betrouwbaarheid');
  add('legal-disclaimer-s6-p', 'We strive for 99.9% uptime but cannot guarantee uninterrupted service. AI Buddha may be unavailable during maintenance, updates, or unforeseen technical issues.',
    'We streven naar 99,9% uptime maar kunnen ononderbroken dienstverlening niet garanderen. AI Buddha kan niet beschikbaar zijn tijdens onderhoud, updates of onvoorziene technische problemen.');
  add('legal-disclaimer-s7', '7. Crisis Resources', '7. Crisisbronnen');
  add('legal-disclaimer-s7-p', 'If you are in crisis or having thoughts of self-harm, <strong>AI Buddha is not equipped to help</strong>. Please reach out to these resources immediately:',
    'Als je in crisis bent of gedachten hebt over zelfbeschadiging, <strong>is AI Buddha niet toegerust om te helpen</strong>. Neem onmiddellijk contact op met deze bronnen:');
  add('legal-disclaimer-crisis-nl', 'Netherlands:', 'Nederland:');
  add('legal-disclaimer-crisis-nl-num', '113 Zelfmoordpreventie — Call 113 or 0800-0113', '113 Zelfmoordpreventie — Bel 113 of 0800-0113');
  add('legal-disclaimer-crisis-eu', 'Europe:', 'Europa:');
  add('legal-disclaimer-crisis-eu-num', 'EU Emergency — Call 112', 'EU Noodgeval — Bel 112');
  add('legal-disclaimer-crisis-us', 'United States:', 'Verenigde Staten:');
  add('legal-disclaimer-crisis-us-num', '988 Suicide & Crisis Lifeline — Call or text 988', '988 Suicide & Crisis Lifeline — Bel of sms 988');
  add('legal-disclaimer-crisis-int', 'International:', 'Internationaal:');
  add('legal-disclaimer-crisis-int-link', 'Find a helpline in your country at <a href="https://findahelpline.com" target="_blank">findahelpline.com</a>',
    'Vind een hulplijn in jouw land op <a href="https://findahelpline.com" target="_blank">findahelpline.com</a>');

  // ─── LANGUAGE DETECTION ─────────────────────
  function detectLang() {
    // 1. Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    // 2. Check browser language
    const browser = (navigator.language || 'en').split('-')[0].toLowerCase();
    if (SUPPORTED.includes(browser)) return browser;

    // 3. Default
    return 'en';
  }

  // ─── APPLY TRANSLATIONS ────────────────────
  function applyLang(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Update all elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (T[lang] && T[lang][key]) {
        el.innerHTML = T[lang][key];
      } else if (T.en[key]) {
        el.innerHTML = T.en[key];
      }
    });

    // Update language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', btnLang === lang);
    });

    // Update mobile menu language buttons too
    document.querySelectorAll('.mobile-lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', btnLang === lang);
    });

    // Dispatch event for any other scripts listening
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  // ─── INIT ───────────────────────────────────
  const currentLang = detectLang();

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyLang(currentLang));
  } else {
    applyLang(currentLang);
  }

  // Expose globally for language switcher buttons
  window.bodhiSetLang = function(lang) {
    if (SUPPORTED.includes(lang)) {
      applyLang(lang);
      // Update the lang button text
      var btn = document.getElementById('lang-btn-text');
      if (btn) {
        var flags = { en: '🇬🇧 EN', nl: '🇳🇱 NL', es: '🇪🇸 ES', de: '🇩🇪 DE', fr: '🇫🇷 FR', hi: '🇮🇳 HI' };
        btn.textContent = flags[lang] || lang.toUpperCase();
      }
    }
  };

  window.bodhiGetLang = function() {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  };

  // Close language dropdown when clicking outside
  document.addEventListener('click', function(e) {
    var dd = document.getElementById('lang-dropdown');
    var btn = document.getElementById('lang-btn');
    if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
      dd.classList.remove('open');
    }
  });

})();
