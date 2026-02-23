import Link from 'next/link';
import { Building2, Shield, Phone, Mail } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About Alzen Realty', href: '/about' },
    { label: 'How It Works', href: '/about#how-it-works' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  Buyers: [
    { label: 'Buy a Property', href: '/residential/buy' },
    { label: 'Rent a Property', href: '/residential/rent' },
    { label: 'New Launches', href: '/residential/buy?type=new-launches' },
    { label: 'Property Guides', href: '/resources' },
  ],
  Sellers: [
    { label: 'List Your Property', href: '/list-property' },
    { label: 'Find an Agent', href: '/directory/agents' },
    { label: 'Market News', href: '/news' },
    { label: 'Stamp Duty Calculator', href: '/resources/calculators/stamp-duty' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'CEA Compliance', href: '/cea' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-text text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">
                Alzen<span className="text-brand-primary">Realty</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Singapore&apos;s AI-native property platform. Full lifecycle coverage from research to
              ownership.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5 text-brand-primary" />
              <span>Singpass Verified Platform</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm text-white mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-brand-primary text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Alzen Realty Pte Ltd. All rights reserved. CEA Licence:
            L1234567H
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:hello@alzenrealty.sg"
              className="text-gray-400 hover:text-brand-primary text-xs flex items-center gap-1 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              hello@alzenrealty.sg
            </a>
            <a
              href="tel:+6561234567"
              className="text-gray-400 hover:text-brand-primary text-xs flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              +65 6123 4567
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
