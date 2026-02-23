export type NewsCategory = 'Policy' | 'Market Data' | 'New Launches' | 'Agent News' | 'Investment';

export interface NewsItem {
    id: string;
    headline: string;
    source: string;
    publishedDate: string; // ISO string format
    category: NewsCategory;
    summary: string;
    url: string;
    isSpaceRealtyAnalysis: boolean;
    imageUrl?: string;
}

export const mockNews: NewsItem[] = [
    {
        id: 'news-001',
        headline: 'MAS Keeps Monetary Policy Settings Unchanged in Q1 2026',
        source: 'The Business Times',
        publishedDate: '2026-02-18T08:00:00Z',
        category: 'Policy',
        summary: 'The Monetary Authority of Singapore has maintained its exchange rate policy band, citing stable inflation and growth prospects. Impact on mortgage rates remains muted.',
        url: 'https://www.businesstimes.com.sg/property/mas-keeps-monetary-policy-settings-unchanged-q1-2026',
        isSpaceRealtyAnalysis: false,
    },
    {
        id: 'news-002',
        headline: 'Deep Dive: How Unchanged MAS Policy Affects Future SIBOR Rates',
        source: 'Space Realty Insights',
        publishedDate: '2026-02-18T14:30:00Z',
        category: 'Investment',
        summary: 'Our AI model predicts a 0.2% drop in fixed mortgage rates over the next 6 months despite the unchanged MAS stance, presenting refinancing opportunities.',
        url: '/insights/news/deep-dive-mas-policy', // Mock URL
        isSpaceRealtyAnalysis: true,
    },
    {
        id: 'news-003',
        headline: 'HDB Resale Prices See Slight Dip in Outside Central Region',
        source: 'Channel NewsAsia',
        publishedDate: '2026-02-15T09:15:00Z',
        category: 'Market Data',
        summary: 'Data from January shows a 0.4% decline in HDB resale prices in Punggol and Sengkang, breaking a 4-month streak of modest gains.',
        url: 'https://www.channelnewsasia.com/singapore/hdb-resale-prices-dip-outside-central-region-january',
        isSpaceRealtyAnalysis: false,
    },
    {
        id: 'news-004',
        headline: 'New Launch Preview: The Sapphire @ Marina Bay',
        source: 'PropertyGuru',
        publishedDate: '2026-02-12T11:00:00Z',
        category: 'New Launches',
        summary: 'Developer previews for the highly anticipated luxury condo in District 1 begin next week. Indicative pricing starts at $2,800 psf.',
        url: 'https://www.propertyguru.com.sg/property-news/2026/02/sapphire-marina-bay-new-launch-preview',
        isSpaceRealtyAnalysis: false,
    },
    {
        id: 'news-005',
        headline: 'CEA Announces Stricter Guidelines for Property Listings',
        source: 'Council for Estate Agencies',
        publishedDate: '2026-02-10T10:00:00Z',
        category: 'Policy',
        summary: 'Starting April 2026, all property listings must include verified proof of ownership from the seller before being published on public portals.',
        url: 'https://www.cea.gov.sg/professionals/news-and-updates/announcements/stricter-guidelines-property-listings',
        isSpaceRealtyAnalysis: false,
    },
    {
        id: 'news-006',
        headline: 'Why CEA\'s New Guidelines Will Shrink Inventory by 15%',
        source: 'Space Realty Insights',
        publishedDate: '2026-02-11T16:45:00Z',
        category: 'Agent News',
        summary: 'An analysis of current duplicate listings suggests the new CEA verification rules will remove approximately 15% of "dummy" listings from major portals.',
        url: '/insights/news/cea-guidelines-impact',
        isSpaceRealtyAnalysis: true,
    },
    {
        id: 'news-007',
        headline: 'Top 5 Condos with Highest Capital Appreciation in 2025',
        source: 'Stacked Homes',
        publishedDate: '2026-02-08T07:30:00Z',
        category: 'Investment',
        summary: 'A retrospective look at last year\'s best performing private residential developments, highlighting surprising winners in District 19.',
        url: 'https://stackedhomes.com/editorial/top-5-condos-highest-capital-appreciation-2025',
        isSpaceRealtyAnalysis: false,
    },
    {
        id: 'news-008',
        headline: 'URA Flash Estimates: Private Home Prices Rise 0.8% in Q4 2025',
        source: 'Urban Redevelopment Authority',
        publishedDate: '2026-01-02T08:00:00Z',
        category: 'Market Data',
        summary: 'The final quarter of 2025 saw a marginal increase in private residential property prices, driven largely by new launches in the Rest of Central Region.',
        url: 'https://www.ura.gov.sg/Corporate/Media-Room/Media-Releases/pr26-01',
        isSpaceRealtyAnalysis: false,
    }
];
