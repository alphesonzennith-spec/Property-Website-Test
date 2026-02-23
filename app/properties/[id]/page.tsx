import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { mockProperties } from '@/lib/mock/properties';
import { ImageGallery } from '@/components/properties/ImageGallery';
import { PropertyHeader } from '@/components/properties/PropertyHeader';
import { SpecificationBar } from '@/components/properties/SpecificationBar';
import { PropertyTabs } from '@/components/properties/PropertyTabs';
import { VerificationCard } from '@/components/properties/VerificationCard';
import { ListingSourceCard } from '@/components/properties/ListingSourceCard';
import { ContactForm } from '@/components/properties/ContactForm';
import { MortgageEstimatorWidget } from '@/components/properties/MortgageEstimatorWidget';

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate static params for top 30 properties
export async function generateStaticParams() {
  // In production, fetch property IDs from API
  return mockProperties.slice(0, 30).map((property) => ({
    id: property.id,
  }));
}

// Fetch property data (server component)
async function getProperty(id: string) {
  // In production, fetch from tRPC API or database
  // For now, use mock data
  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return null;
  }

  return property;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const property = await getProperty(resolvedParams.id);

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];

  return {
    title: `${property.propertyType} in ${property.district} - ${property.address} | Space Realty`,
    description: property.aiGeneratedDescription || `${property.bedrooms} bed, ${property.bathrooms} bath ${property.propertyType} for ${property.listingType.toLowerCase()} at $${property.price.toLocaleString()}. ${property.floorAreaSqft} sqft in ${property.address}.`,
    openGraph: {
      title: `${property.propertyType} in ${property.district} - $${property.price.toLocaleString()}`,
      description: property.aiGeneratedDescription || `${property.bedrooms} bed, ${property.bathrooms} bath property for ${property.listingType.toLowerCase()}`,
      images: primaryImage ? [primaryImage.url] : [],
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const resolvedParams = await params;
  const property = await getProperty(resolvedParams.id);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/residential/buy">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Button>
          </Link>
        </div>

        {/* Main 65/35 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (65%) - lg:col-span-2 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={property.images} />

            {/* Property Header */}
            <PropertyHeader property={property} />

            {/* Specification Bar */}
            <SpecificationBar property={property} />

            {/* Property Tabs */}
            <PropertyTabs property={property} />
          </div>

          {/* Sidebar (35%) - lg:col-span-1 */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Verification Card */}
              <VerificationCard property={property} />

              {/* Listing Source Card */}
              <ListingSourceCard property={property} />

              {/* Contact Form */}
              <ContactForm propertyId={property.id} />

              {/* Mortgage Estimator Widget */}
              <MortgageEstimatorWidget propertyPrice={property.price} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
