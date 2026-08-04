'use client';
import { Hero } from '@/components/sections/Hero';
import { LiveStats } from '@/components/sections/LiveStats';
import { FeaturedTournaments } from '@/components/sections/FeaturedTournaments';
import { FeaturedPackages } from '@/components/sections/FeaturedPackages';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { Reviews } from '@/components/sections/Reviews';
import { FAQ } from '@/components/sections/FAQ';
import { ContactForm } from '@/components/sections/ContactForm';

export function LandingView() {
  return (
    <div>
      <Hero />
      <LiveStats />
      <FeaturedTournaments />
      <FeaturedPackages />
      <WhyChooseUs />
      <Reviews />
      <FAQ />
      <ContactForm />
    </div>
  );
}
