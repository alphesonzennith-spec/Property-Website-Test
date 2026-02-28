/**
 * strings.ts — Alzen Realty Content Constants
 *
 * Every user-facing static string in the application lives here.
 * Dynamic values (prices, counts, user names) are NOT stored here — only
 * copy that would be copy-edited by a content or legal team.
 *
 * Usage:
 *   import { STRINGS } from '@/lib/content/strings';
 *   <h1>{STRINGS.homepage.hero.headline}</h1>
 *
 * Naming conventions:
 *   STRINGS.<section>.<subsection?>.<key>
 *
 * LEGAL NOTE:
 *   All disclaimer strings are marked with // LEGAL — changes require review.
 *   The canonical calculator disclaimer is STRINGS.calculators.disclaimers.general.
 *   All component-level disclaimers should reference this constant.
 *
 * BRAND NOTE:
 *   Brand name is STRINGS.brand.name ("ALZEN") + STRINGS.brand.suffix ("Realty").
 *   Do not hardcode "Space Realty" anywhere — that is the old name.
 *   not-found.tsx still uses the old name and must be updated.
 */

// ─── Brand ───────────────────────────────────────────────────────────────────

export const STRINGS = {
  brand: {
    name: 'ALZEN',
    suffix: 'Realty',
    full: 'ALZEN Realty',
    legalName: 'ALZEN Realty Pte Ltd',
    tagline: 'Be In Control of Your Assets',
    platformDescription:
      "Singapore's AI-native property platform. Full lifecycle coverage from research to ownership.",
    /** LEGAL — appears in footer and must be kept accurate */
    ceaLicence: 'CEA Licence: L1234567H',
    email: 'hello@alzenrealty.sg',
    phone: '+65 6123 4567',
    supportEmail: 'support@alzenrealty.sg',
  },

  // ─── Navigation ────────────────────────────────────────────────────────────

  navigation: {
    residential: 'RESIDENTIAL',
    commercial: 'COMMERCIAL',
    resources: 'RESOURCES',
    directory: 'DIRECTORY',
    news: 'NEWS',
    newLaunches: 'NEW LAUNCHES',

    buy: 'Buy',
    buyDescription: 'Browse properties for sale',
    rent: 'Rent',
    rentDescription: 'Find rental properties',
    sellList: 'Sell / List',
    sellListDescription: 'List your property',

    commercialBuy: 'Buy',
    commercialBuyDescription: 'Commercial properties for sale',
    commercialRent: 'Rent',
    commercialRentDescription: 'Commercial spaces for rent',
    commercialList: 'List',
    commercialListDescription: 'List your commercial property',

    knowledge: 'Knowledge & Learning',
    knowledgeDescription: 'Guides, rules, and AI scenarios',
    calculators: 'Calculators',
    calculatorsDescription: 'M-Value, Stamp Duty, TDSR & more',

    login: 'Login',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    dashboard: 'Dashboard',
    analyticalDashboard: 'Analytical Dashboard',
    familyDashboard: 'Family Dashboard',
    myProfile: 'My Profile',
    myListings: 'My Listings',
    verified: 'Verified',
    singpassVerified: 'Singpass Verified',

    // Footer columns
    footer: {
      aboutUs: 'About ALZEN Realty',
      howItWorks: 'How It Works',
      careers: 'Careers',
      press: 'Press',
      buyProperty: 'Buy a Property',
      rentProperty: 'Rent a Property',
      newLaunches: 'New Launches',
      propertyGuides: 'Property Guides',
      listProperty: 'List Your Property',
      findAgent: 'Find an Agent',
      marketNews: 'Market News',
      stampDutyCalc: 'Stamp Duty Calculator',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
      ceaCompliance: 'CEA Compliance',
      singpassVerifiedPlatform: 'Singpass Verified Platform',
    },
  },

  // ─── Homepage ──────────────────────────────────────────────────────────────

  homepage: {
    hero: {
      badge: "Singapore's #1 Verified Platform",
      headline: 'Find Your Perfect Home in Singapore',
      subheadline:
        'AI-powered insights, Singpass verified listings, family portfolio planning — all in one platform built for Singapore.',
      statSingpassVerified: 'Singpass Verified',
      statAiPowered: 'AI-Powered',
      stat1Label: '50,000+ Listings',
      stat2Label: '12,000+ Transactions',
    },

    stats: {
      transactions: { label1: 'Transactions', label2: 'Completed' },
      listings: { label1: 'Verified', label2: 'Listings' },
      users: { label1: 'Singpass', label2: 'Verified Users' },
      volume: { label1: 'Transaction', label2: 'Volume (2024)' },
    },

    whyChooseUs: {
      heading: 'Why Singapore Trusts ALZEN Realty',
      subheading: 'Built on transparency, powered by AI, and secured by Singpass.',

      zeroScam: {
        title: 'Zero Scam Guarantee',
        description:
          'Every listing owner verified via Singpass MyInfo. No ghost listings, no agent impersonation — only real, authenticated properties.',
        stat: '0 Fraud Cases Reported',
      },
      aiFirst: {
        title: 'AI-First Intelligence',
        description:
          '5 specialized AI agents analyzing 200,000+ data points daily to give you the edge — whether you\'re buying, renting, or investing.',
        stat: '98% Prediction Accuracy',
      },
      transparency: {
        title: 'Full Market Transparency',
        description:
          'Access to URA, HDB and CEA data integrated directly into every listing. Make decisions backed by official government data.',
        stat: '100% Data-Backed Insights',
      },
    },

    featuredListings: {
      heading: 'Featured Properties',
      badge: 'Verified Listings',
      subheading: 'Hand-picked properties with full Singpass verification',
      viewAll: 'View all listings →',
    },

    marketSnapshot: {
      heading: 'Singapore Market Snapshot',
      liveData: 'Live data',
      chartTitle: 'Price Index 2024 — HDB Resale vs Private Residential',
      hdbResaleLabel: 'HDB Resale Index',
      privateResLabel: 'Private Residential Index',
      recentTransactions: 'Recent Transactions',
      emptyTransactions: 'No recent transactions available.',
      viewAll: 'View all transactions →',
    },

    calculatorCta: {
      heading: 'Plan Your Finances',
      subheading: 'Singapore-specific calculators powered by AI — free for all users.',
      stampDuty: {
        title: 'Stamp Duty (BSD/ABSD)',
        description: 'Calculate your stamp duty instantly — buyer, seller, or additional buyer.',
        cta: 'Calculate Now →',
      },
      tdsr: {
        title: 'TDSR / MSR Check',
        description: 'Know your loan eligibility before you make an offer. Know your exact numbers.',
        cta: 'Check Eligibility →',
      },
      affordability: {
        title: 'Affordability Planner',
        description: 'Find your ideal property budget based on income, CPF, and expenses.',
        cta: 'Plan Budget →',
      },
    },

    learningPreview: {
      heading: 'Property Education Hub',
      subheading:
        'Learn everything about Singapore property — from HDB basics to investment strategies.',
      viewAll: 'View all modules →',
      tagEli5: 'ELI5',
      minRead: 'min read',
      completed: 'completed',
      startLearning: 'Start Learning',
    },

    aiTeam: {
      heading: 'Meet Your AI Team',
      subheading: 'Specialized AI agents working 24/7 for your property journey',
      prev: 'Previous',
      next: 'Next',
      onlineStatus: 'Online',

      aria: {
        name: 'Aria',
        role: 'Your AI Property Advisor',
        description:
          'Finds properties matching your exact requirements, lifestyle, and budget with AI-powered precision.',
        cta: 'Chat with Aria →',
      },
      rex: {
        name: 'Rex',
        role: 'Research & Analytics AI',
        description:
          'Deep dives into market trends, price history, district analysis and investment potential.',
        cta: 'Explore Data →',
      },
      vera: {
        name: 'Vera',
        role: 'Legal & Compliance AI',
        description:
          'Reviews OTP documents, calculates stamp duty, and checks legal compliance so you transact safely.',
        cta: 'Ask Vera →',
      },
      feng: {
        name: 'Feng',
        role: 'Feng Shui & Astrology AI',
        description:
          'Ba Zi compatibility readings, property orientation analysis, and lucky unit number guidance.',
        cta: 'Get Reading →',
      },
    },
  },

  // ─── Search ────────────────────────────────────────────────────────────────

  search: {
    // AI Search Bar
    aiSearchPlaceholder: "Try: '3 bedroom condo in Bedok under 2M'",
    aiSearchButton: 'AI Search',
    aiUnderstood: 'AI understood:',
    aiSearchError: 'Failed to parse query. Please try again.',

    // Hero Search (homepage quick search)
    heroSearchBuy: 'BUY',
    heroSearchRent: 'RENT',
    heroSearchPlaceholder: 'Search by property name, street or district...',
    heroSearchButton: 'Search',
    heroOptionalFilters: 'Optional filters:',
    heroDistrictLabel: 'District',
    heroPropertyTypeLabel: 'Property Type',
    heroPriceRangeLabel: 'Price Range',
    heroClearAll: 'Clear all',

    // Filter Sidebar
    filtersHeading: 'Filters',
    resetAll: 'Reset All',
    filterPriceRange: 'Price Range (SGD)',
    filterPriceMin: 'Min',
    filterPriceMax: 'Max',
    filterPricePlaceholderMin: '0',
    filterPricePlaceholderMax: 'No limit',
    filterPropertyType: 'Property Type',
    filterBedrooms: 'Bedrooms',
    filterBathroomsLabel: 'Bathrooms',
    filterFloorArea: 'Floor Area (sqft)',
    filterFurnishing: 'Furnishing',
    filterTenure: 'Tenure',
    filterListingSource: 'Listing Source',
    filterLocation: 'Location',
    filterDistrict: 'District',
    filterDistrictPlaceholder: 'e.g., D01, D16',
    filterHdbTown: 'HDB Town',
    filterHdbTownPlaceholder: 'e.g., Bedok, Bishan',
    filterQualityScore: 'Quality Score',
    filterOwnerVerification: 'Owner Verification',
    filterSingpassOnly: 'Singpass Verified Only',

    // Filter option labels
    optionAny: 'Any',
    optionOwnerDirect: 'Owner Direct',
    optionAgentListed: 'Agent Listed',
    optionUnfurnished: 'Unfurnished',
    optionPartialFurnished: 'Partially Furnished',
    optionFullyFurnished: 'Fully Furnished',
    optionFreehold: 'Freehold',
    optionLeasehold99: '99-year Leasehold',
    optionLeasehold999: '999-year Leasehold',
    optionHdb: 'HDB',
    optionCondo: 'Condo',
    optionLanded: 'Landed',
    optionEC: 'Executive Condo',

    // Sort options
    sortLabel: 'Sort by:',
    sortQualityScore: 'Quality Score',
    sortNewest: 'Newest',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortPsfAsc: 'PSF: Low to High',
    sortPsfDesc: 'PSF: High to Low',
    sortMostViewed: 'Most Viewed',

    // View toggle
    mapView: 'Map View',
    listView: 'List View',

    // Results count template: use with `data.total`
    // e.g. `${data.total} ${STRINGS.search.resultsSuffix}`
    resultsSuffix: 'properties found',

    // Empty state
    emptyHeading: 'No properties found',
    emptySubheading: 'Try adjusting your filters or search query.',
    emptyResetButton: 'Reset all filters',

    // Error state
    errorTitle: 'Error loading properties',
    errorDescription: 'Failed to load property listings. Please try again later.',

    // Pagination
    paginationPrevious: 'Previous',
    paginationNext: 'Next',
    // template: `Page ${page} of ${totalPages}`

    // Comparison
    compare: 'Compare',
    comparingCount: 'Comparing', // followed by "2/3" dynamically
    clearAll: 'Clear All',
    compareProperties: 'Compare Properties',
    compareLimit: 'You can only compare up to 3 properties at a time.',

    // Map placeholder
    mapPlaceholderHeading: 'Map View Coming Soon',
    mapPlaceholderSubheading:
      'Interactive property map will be displayed here with cluster markers and filtering',
  },

  // ─── Property Card ─────────────────────────────────────────────────────────

  propertyCard: {
    // Verification badge tooltips
    verifiedLabel: 'Verified',
    docsVerifiedLabel: 'Docs Verified',
    ownerVerifiedLabel: 'Owner Verified',
    unverifiedLabel: 'Unverified',

    // Badge labels
    featuredLabel: 'Featured Listing',
    ownerDirectBadge: 'Owner Direct Listing',

    // Listing type chips
    saleChip: 'Sale',
    rentChip: 'Rent',

    // Spec labels
    specBed: 'Bed',
    specBath: 'Bath',

    // Tenure chips
    tenureFreehold: 'Freehold',
    tenure99: '99 Yr',
    tenure999: '999 Yr',
    tenure30: '30 Yr',

    // Furnishing chips
    fullyFurnished: 'Fully Furnished',
    partFurnished: 'Part Furnished',

    // Footer
    listedByAgent: 'Agent',
    ownerDirect: 'Owner Direct',

    // Aria labels
    saveProperty: 'Save property',
    qualityScoreAriaLabel: 'Listing quality score:', // followed by "{score}/100"
  },

  // ─── Property Detail ───────────────────────────────────────────────────────

  propertyDetail: {
    // Tab names
    tabOverview: 'Overview',
    tabLocation: 'Location',
    tabPriceHistory: 'Price History',
    tabSimilar: 'Similar Properties',
    tabCalculators: 'Calculators',

    // Listing source card
    listingSourceHeading: 'Listing Source',
    sourceOwnerDirect: 'Owner Direct',
    sourceOwnerDirectDesc: 'Listed directly by the property owner',
    sourceCeaAgent: 'CEA Agent',
    sourceCeaAgentDesc: 'Listed by a registered CEA agent',
    sourceDeveloper: 'Developer',
    sourceDeveloperDesc: 'Listed by the property developer',
    sourcePlatform: 'Platform',
    sourcePlatformDesc: 'Listed via our platform',
    sourceUnknown: 'Unknown',
    sourceUnknownDesc: 'Listing source not specified',
    sourceAgentIdLabel: 'Agent ID',
    sourceOwnerIdLabel: 'Owner ID',
    sourceTotalViewsLabel: 'Total Views',

    // Verification card
    verificationCardHeading: 'Verification Status',
    verificationLevelLabel: 'Verification Level',
    ownershipDocLabel: 'Ownership Document',
    viewTitleDeed: 'View Title Deed',
    legalDocsLabel: 'Legal Documents', // followed by "(n)"
    documentN: 'Document', // followed by " {n+1}"
    verificationFullyVerified:
      'This property has been fully verified through Singpass MyInfo and legal documentation.',
    verificationLegalDocs: 'Legal documents have been verified for this property.',
    verificationOwnership: 'Property ownership has been verified.',
    verificationUnverified: 'This listing has not yet been verified.',

    // Mortgage estimator
    mortgageHeading: 'Mortgage Estimator',
    mortgageMonthlyLabel: 'Estimated Monthly Payment',
    mortgageMonthlySubLabel: 'per month', // combined with tenure dynamically
    mortgageDownPaymentLabel: 'Down Payment',
    mortgageTenureLabel: 'Loan Tenure',
    mortgageInterestLabel: 'Interest Rate (% p.a.)',
    mortgageLoanAmountLabel: 'Loan Amount',
    mortgageTotalInterestLabel: 'Total Interest',
    mortgageTotalPaymentLabel: 'Total Payment',

    // Calculators tab
    calculatorsTabHeading: 'Property Calculators',
    calculatorsTabDescription:
      'Use these calculators to estimate financing options, stamp duty costs, and affordability for this property.',
    calculatorTabTdsr: 'TDSR & MSR',
    calculatorTabStampDuty: 'Stamp Duty',
    calculatorTabAffordability: 'Affordability',

    // Contact form
    contactHeading: 'Contact Owner',
    contactNameLabel: 'Your Name',
    contactNamePlaceholder: 'John Doe',
    contactEmailLabel: 'Email Address',
    contactEmailPlaceholder: 'john@example.com',
    contactPhoneLabel: 'Phone Number',
    contactPhonePlaceholder: '+65 1234 5678',
    contactMessageLabel: 'Message',
    contactMessagePlaceholder: "I'm interested in viewing this property...",
    contactSubmitButton: 'Send Message',
    contactSubmittingButton: 'Sending...',
    contactSuccessAlert: 'Message sent! The owner will contact you soon.',
    /** LEGAL — privacy notice on contact form submission */
    contactPrivacyNotice:
      'By submitting this form, you agree to be contacted regarding this property. Your information will not be shared with third parties.',
  },

  // ─── Calculators ───────────────────────────────────────────────────────────

  calculators: {
    // Nav labels (CalculatorNav component)
    navTdsr: 'TDSR & MSR',
    navStampDuty: 'Stamp Duty',
    navAffordability: 'Affordability',
    navMortgage: 'Mortgage',
    navCpfOptimizer: 'CPF Optimizer',
    navTotalCost: 'Total Cost',
    navPropertyValue: 'Property Value',

    // Page breadcrumbs
    breadcrumbCalculators: 'RESOURCES / CALCULATORS',

    // Shared input/output labels
    inputPropertyValue: 'Property Value (SGD)',
    inputLoanAmount: 'Loan Amount',
    inputInterestRate: 'Interest Rate (% p.a.)',
    inputLoanTenure: 'Loan Tenure',
    inputApplicationStatus: 'Application Status',
    inputSingle: 'Single',
    inputJoint: 'Joint',
    inputFixedIncome: 'Fixed income',
    inputVariableIncome: 'Variable income',
    inputMonthlyLoansDebts: 'Monthly loans & debts',
    inputFixedIncomeJoint: 'Joint fixed income',
    inputVariableIncomeJoint: 'Joint variable income',
    outputMonthlyRepayment: 'Monthly Repayment',
    outputTotalLoanAmount: 'Total Loan Amount',
    outputTotalInterest: 'Total Interest Paid',
    outputTotalPayment: 'Total Payment',
    outputInterestPct: 'Interest as % of Total',
    outputResults: 'Results',
    outputSummary: 'Summary',

    // TDSR page
    tdsrHeading: 'Total Debt Servicing Ratio (TDSR) Calculator',
    /** LEGAL — MAS regulatory footnote, must match MAS published guidelines */
    tdsrMasHaircut:
      'We apply a {pct}% haircut per MAS guidelines — only {rem}% counted',
    tdsrZeroIncomeHint: 'Enter your income above to see your TDSR results.',
    tdsrApplicableNote:
      'This is only applicable to HDB flats and Executive Condominiums (ECs).',

    // Mortgage page
    mortgageHeading: 'Mortgage Repayment Calculator',
    mortgageSubheading:
      'Estimate your monthly repayment, total interest paid, and view the full amortization breakdown.',
    mortgageAmortizationHeading: 'Amortization Overview',
    mortgageEmptyState:
      'Enter a property value above to see your amortization schedule.',

    // Affordability page
    affordabilityHeading: 'Affordability Calculator',
    /** LEGAL — MAS regulatory footnote */
    affordabilityMasFootnote:
      'TDSR and MSR limits sourced from MAS borrowing guidelines. LTV rules sourced from MAS property financing limits. All calculations are estimates for planning purposes only. Actual eligibility is subject to bank assessment.',
    affordabilityMatchingHeading: 'Matching Properties within Your Budget',
    affordabilityNoMatch: 'No matching properties found within this price range.',
    affordabilityVariableHaircut: '{pct}% haircut applied per MAS',

    // Disclaimer strings — LEGAL: all must be reviewed by legal team before changes
    disclaimers: {
      /**
       * LEGAL — General calculator disclaimer. Used in:
       *   - components/properties/tabs/CalculatorsTab.tsx
       * This is the canonical version. All other calculator pages should
       * align with or reference this text.
       */
      general:
        'These calculators provide estimates only and should not be considered as financial advice. Actual costs and loan eligibility may vary based on your personal circumstances, lender policies, and government regulations. Please consult a licensed financial advisor or mortgage specialist for accurate calculations.',

      /**
       * LEGAL — Short mortgage estimator disclaimer. Used in:
       *   - components/properties/MortgageEstimatorWidget.tsx
       */
      mortgageEstimator:
        'This is an estimate only. Actual loan terms may vary. Consult a financial advisor for accurate calculations.',

      /**
       * LEGAL — Total Cost calculator disclaimer. Used in:
       *   - app/resources/calculators/total-cost/page.tsx
       */
      totalCost:
        'This calculator does not constitute financial or tax advice. Consult a licensed adviser before making property decisions.',

      /**
       * LEGAL — CPF Optimizer disclaimer. Used in:
       *   - app/resources/calculators/cpf-optimizer/page.tsx
       * Note: CPF interest rates are interpolated dynamically — the static
       * portion of the disclaimer is here; the rates are appended in-component.
       */
      cpfOptimizer:
        'Results are estimates for illustrative purposes only. CPF OA and SA interest rates are sourced from CPF Board and subject to change. This calculator does not constitute financial advice. Consult a licensed financial advisor for personalised guidance.',

      /**
       * LEGAL — Property Value estimate disclaimer. Used in:
       *   - app/resources/calculators/property-value/page.tsx (prominent + data source)
       */
      propertyValueEstimate:
        'ESTIMATE ONLY — Based on comparable transactions. Not an official or certified property valuation.',
      propertyValueDataSource:
        'Estimates are based on comparable transaction data. Live integration will use URA and HDB public datasets. Not an official valuation.',

      /**
       * LEGAL — Ba Zi / Feng Shui AI reading disclaimer. Used in:
       *   - app/(dashboard)/profile/page.tsx
       */
      baziReading:
        'Ba Zi readings are generated by an AI model trained on traditional Chinese metaphysics principles. They are intended for cultural interest and entertainment purposes only, and should not replace professional financial or real estate advice. ALZEN Realty does not guarantee the accuracy of these readings.',

      /**
       * LEGAL — Total cost calculator note about estimates. Used in:
       *   - app/resources/calculators/total-cost/page.tsx
       */
      totalCostEstimateItems:
        'ESTIMATE items (maintenance fees, insurance, legal fees) are illustrative market ranges. Actual costs vary by property, developer, and service provider.',
    },
  },

  // ─── Authentication ────────────────────────────────────────────────────────

  auth: {
    loginHeading: 'Log In',
    signupHeading: 'Sign Up',
    breadcrumb: 'AUTHENTICATION',
    comingSoon: 'This section is coming soon.',
    backToHome: '← Back to Home',

    // Auth required page
    requiredHeading: 'Authentication Required',
    requiredSubheading:
      'Please sign in or create an account to access this exclusive dashboard feature.',
    requiredLoginButton: 'Log In to Your Account',
    requiredNewUser: 'New to Space Realty?',
    requiredCreateAccount: 'Create an Account',
    requiredReturnHome: 'Return to Homepage',

    // Account type selection (signup)
    accountTypeBuyer: "I'm a Buyer / Renter",
    accountTypeAgent: "I'm a Licensed Agent",

    // Agent-specific fields
    ceaRegistrationLabel: 'CEA Registration No.',
    ceaRegistrationPlaceholder: 'e.g. R123456A',

    // Singpass
    singpassVerified: 'Singpass Verified',
    singpassVerifying: 'Verifying...',
    singpassVerifyButton: 'Verify with Singpass',

    // Verification status card
    verificationStatusNotLoggedIn: 'Not Logged In',
    verificationStatusNotLoggedInDesc: 'Sign in to verify your identity',
    verificationStatusVerified: 'Singpass Verified ✓',
    verificationStatusRequired: 'Verification Required',
    verificationStatusRequiredDesc:
      'Verify with Singpass to list properties and contact sellers.',
    verificationStatusVerifyNow: 'Verify Now →',

    /**
     * LEGAL — Singpass explanation shown on verification prompts.
     * Singpass is a Singapore government identity platform.
     */
    singpassExplanation:
      'Singpass is Singapore\'s national digital identity system. Verification confirms you are a real, Singapore-registered individual. Your data is never stored on our servers.',

    // CEA licence note (agent listing page)
    ceaLicenceNote:
      'We will pre-fill the form with your CEA registration and the property details.',
    ceaListingRequirement:
      'List on behalf of your client. Requires CEA license check and uploaded owner consent form.',
    ceaLicensedBadge: 'CEA Licensed',
  },

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  dashboard: {
    // Insights / Analytics page
    insightsHeading: 'Market Intelligence Dashboard',
    insightsSubheading: 'Live Singapore property market data and AI-driven analysis.',
    insightsBreadcrumb: 'ANALYTICS / MARKET INTELLIGENCE',

    // WidgetGrid
    widgetManageGrid: 'Manage Grid',
    widgetDragHint: 'Widgets can be dragged and resized. Your layout is auto-saved.',
    widgetVisibleWidgets: 'Visible Widgets',

    // Widget names
    widgetPriceTrend: 'Price Trend',
    widgetPriceTrendUnit: 'psf',
    widgetVolume: 'Transaction Volume',
    widgetVolumeUnit: 'count',
    widgetHeatmap: 'Regional Heatmap',
    widgetHeatmapUnit: 'psf',
    widgetDistribution: 'Price Distribution',
    widgetDistributionUnit: 'volume',
    widgetYield: 'Rental Yields',
    widgetYieldUnit: '%',
    widgetTransactions: 'Notable Transactions',
    widgetTransactionsUnit: 'market',
    widgetAi: 'AI Market Insight',

    // Analytics tab section headers
    analyticsKpiHeading: 'Market Trends & Intelligence',
    analyticsRegionalHeading: 'Regional & Distribution Analysis',
    analyticsTransactionalHeading: 'Transaction History & Investment Metrics',

    // Analytics tab widget labels
    analyticsLongTermTrend: 'Long-term Price Trend',
    analyticsLongTermTrendUnit: 'SGD/PSF',
    analyticsAiAnalysis: 'AI Market Analysis',
    analyticsHeatmap: 'Geographic Heatmap',
    analyticsHeatmapUnit: 'avg psf',
    analyticsVolume: 'Volume Breakdown',
    analyticsVolumeUnit: 'count',
    analyticsPriceDistribution: 'Price Distribution',
    analyticsPriceDistributionUnit: 'volume',
    analyticsTransactions: 'Recent Market Transactions',
    analyticsTransactionsUnit: 'verified',
    analyticsYieldBenchmarks: 'Yield Benchmarks',
    analyticsYieldUnit: '% ann.',

    // Analytics KPI cards
    kpiMedianSalePrice: 'Median Sale Price',
    kpiAvgPsf: 'Avg PSF',
    kpiVolume: 'Volume (MoM)',
    kpiRentalYield: 'Rental Yield (Avg)',

    // Profile page
    profileBreadcrumb: 'DASHBOARD / PROFILE',
    profileBaziHeading: 'Ba Zi Reading',
    profileBaziGenerateButton: 'Generate Ba Zi Reading',
    profileBaziGeneratingButton: 'Generating Reading…',
    profileBaziDayMasterLabel: 'Your Day Master',

    // Transaction tabs
    profileTransactionPurchases: 'Purchases',
    profileTransactionRentals: 'Rentals',
    profileTransactionInvestments: 'Investments',
    profileTransactionEmptyPurchases: 'No purchases yet',
    profileTransactionEmptyRentals: 'No rentals yet',
    profileTransactionEmptyInvestments: 'No investments yet',

    // Family dashboard
    familyHeading: 'Family Property Dashboard',
    familyEmptyState: 'No family group found. Create or join a family group to get started.',
  },

  // ─── Errors ────────────────────────────────────────────────────────────────

  errors: {
    // 404 page
    notFound404: '404',
    notFoundHeading: "Looks like you're lost in space.",
    notFoundBody:
      "The property or page you're searching for has either been moved, sold, or doesn't exist on ALZEN Realty.",
    notFoundReturnHome: 'Return to Homepage',
    notFoundSearch: 'Search Properties',
    notFoundCopyright: `© ${new Date().getFullYear()} ALZEN Realty. Need help?`,
    notFoundContactSupport: 'Contact Support',

    // Property page error boundary
    propertyErrorHeading: 'Something went wrong',
    propertyErrorSubheading: 'We encountered an error while loading this property',
    propertyErrorTitle: 'Error Details',
    propertyErrorRetry: 'Try Again',
    propertyErrorBackToSearch: 'Back to Search',
    propertyErrorContactSupport: 'If this problem persists, please contact support',

    // Generic network / tRPC errors
    generic: 'Something went wrong. Please try again.',
    networkError: 'Unable to connect. Please check your internet connection.',
    notFoundGeneric: 'The requested resource could not be found.',

    // Results area tRPC error
    propertyListError: 'Failed to load property listings. Please try again later.',
    propertyListErrorTitle: 'Error loading properties',

    // Partial load (compare page)
    comparePartialLoadTitle: 'Some properties could not be loaded',
    comparePartialLoadDesc:
      'Showing {loaded} of {total} selected properties.',

    // AI search
    aiSearchError: 'Failed to parse query. Please try again.',
  },

  // ─── Directory ─────────────────────────────────────────────────────────────

  directory: {
    tabs: {
      agents: { label: 'Real Estate Agents', value: 'agents' },
      lawyers: { label: 'Lawyers', value: 'lawyers' },
      bankers: { label: 'Bankers', value: 'bankers' },
      aiAgents: { label: 'AI Agents', value: 'ai-agents' },
      all: { label: 'All Providers', value: 'all' },
    },
    searchPlaceholder: 'Search providers...',
  },
} as const;

// ─── Type helpers ─────────────────────────────────────────────────────────────

/** Convenience re-export for tree-shaking critical legal strings */
export const LEGAL_STRINGS = {
  calculatorGeneral: STRINGS.calculators.disclaimers.general,
  mortgageEstimator: STRINGS.calculators.disclaimers.mortgageEstimator,
  totalCost: STRINGS.calculators.disclaimers.totalCost,
  cpfOptimizer: STRINGS.calculators.disclaimers.cpfOptimizer,
  propertyValueEstimate: STRINGS.calculators.disclaimers.propertyValueEstimate,
  baziReading: STRINGS.calculators.disclaimers.baziReading,
  contactPrivacy: STRINGS.propertyDetail.contactPrivacyNotice,
  tdsrMasFootnote: STRINGS.calculators.affordabilityMasFootnote,
  singpassExplanation: STRINGS.auth.singpassExplanation,
  ceaLicence: STRINGS.brand.ceaLicence,
} as const;
