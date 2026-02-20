import { PropertySearchPage } from '@/components/search/PropertySearchPage';
import { ListingType } from '@/types';

export const metadata = {
  title: 'Properties for Rent | Space Realty',
  description: 'Search verified property listings for rent in Singapore with AI-powered search',
};

export default function RentPage() {
  return <PropertySearchPage listingType={ListingType.Rent} />;
}
