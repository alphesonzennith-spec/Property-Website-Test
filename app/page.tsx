import { HeroSection } from '@/components/home/HeroSection';
import { StatsBar } from '@/components/home/StatsBar';
import { AiTeamCarousel } from '@/components/home/AiTeamCarousel';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { MarketSnapshot } from '@/components/home/MarketSnapshot';
import { CalculatorCta } from '@/components/home/CalculatorCta';
import { LearningPreview } from '@/components/home/LearningPreview';

export default function HomePage() {
  return (
    <main className="bg-white">
      <HeroSection />
      <StatsBar />
      <AiTeamCarousel />
      <FeaturedListings />
      <WhyChooseUs />
      <MarketSnapshot />
      <CalculatorCta />
      <LearningPreview />
    </main>
  );
}
