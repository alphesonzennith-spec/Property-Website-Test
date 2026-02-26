import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Current mock property images
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // OneMap static map images (LocationTab)
      {
        protocol: 'https',
        hostname: 'www.onemap.gov.sg',
      },
      // Supabase Storage (all project subdomains)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Google OAuth profile pictures (Auth.js / next-auth)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Mock agent/user avatars
      {
        protocol: 'https',
        hostname: 'pravatar.cc',
      },
      // Picsum placeholder photos (forward-compat)
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
