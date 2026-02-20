import { PropertySearchPage } from '@/components/search/PropertySearchPage';
import { ListingType } from '@/types';

export const metadata = {
  title: 'Commercial Properties for Sale | Space Realty',
  description: 'Search verified commercial property listings for sale in Singapore with AI-powered search',
};

export default function CommercialBuyPage() {
  return <PropertySearchPage listingType={ListingType.Sale} />;
}
