import { PropertySearchPage } from '@/components/search/PropertySearchPage';
import { ListingType } from '@/types';

export const metadata = {
  title: 'Residential Properties for Rent | Space Realty',
  description: 'Search verified residential property listings for rent in Singapore with AI-powered search',
};

export default function ResidentialRentPage() {
  return <PropertySearchPage listingType={ListingType.Rent} />;
}
