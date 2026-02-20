import { PropertySearchPage } from '@/components/search/PropertySearchPage';
import { ListingType } from '@/types';

export const metadata = {
  title: 'Properties for Sale | Space Realty',
  description: 'Search verified property listings for sale in Singapore with AI-powered search',
};

export default function BuyPage() {
  return <PropertySearchPage listingType={ListingType.Sale} />;
}
