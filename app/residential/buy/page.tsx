import { PropertySearchPage } from '@/components/search/PropertySearchPage';
import { ListingType } from '@/types';

export const metadata = {
  title: 'Residential Properties for Sale | Space Realty',
  description: 'Search verified residential property listings for sale in Singapore with AI-powered search',
};

export default function ResidentialBuyPage() {
  return <PropertySearchPage listingType={ListingType.Sale} />;
}
