'use client';

import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const simpleLinks = [
  { label: 'NEW LAUNCHES', href: '/residential/buy?type=new-launches' },
  { label: 'DIRECTORY', href: '/directory' },
  { label: 'NEWS', href: '/news' },
];

const resourcesLinks = [
  { label: 'Knowledge & Learning', description: 'Guides, rules, and AI scenarios', href: '/learn' },
  { label: 'Calculators', description: 'M-Value, Stamp Duty, TDSR & more', href: '/resources/calculators' },
];

const residentialLinks = [
  { label: 'Buy', description: 'Browse properties for sale', href: '/residential/buy' },
  { label: 'Rent', description: 'Find rental properties', href: '/residential/rent' },
  { label: 'Sell / List', description: 'List your property', href: '/list-property' },
];

const commercialLinks = [
  { label: 'Buy', description: 'Commercial properties for sale', href: '/commercial/buy' },
  { label: 'Rent', description: 'Commercial spaces for rent', href: '/commercial/rent' },
  { label: 'Sell / List', description: 'List your commercial property', href: '/list-property?type=commercial' },
];

export function NavMenu() {
  return (
    <NavigationMenu viewport={false} className="hidden lg:flex self-stretch h-full">
      <NavigationMenuList className="gap-1 h-full items-stretch">
        {/* RESIDENTIAL dropdown */}
        <NavigationMenuItem className="flex items-stretch">
          <NavigationMenuTrigger
            className={cn(
              'h-full bg-transparent rounded-none px-4 text-sm font-medium text-gray-600',
              'hover:text-[#1E293B] hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:text-[#1E293B]',
              'transition-colors'
            )}
          >
            RESIDENTIAL
          </NavigationMenuTrigger>
          <NavigationMenuContent className="md:left-1/2 md:-translate-x-1/2">
            <ul className="w-[220px] p-2">
              {residentialLinks.map((item) => (
                <li key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className="flex flex-col gap-0.5 rounded-md px-3 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-[#1E293B] group-hover:text-emerald-600">
                        {item.label}
                      </span>
                      <span className="text-xs text-gray-400">{item.description}</span>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* COMMERCIAL dropdown */}
        <NavigationMenuItem className="flex items-stretch">
          <NavigationMenuTrigger
            className={cn(
              'h-full bg-transparent rounded-none px-4 text-sm font-medium text-gray-600',
              'hover:text-[#1E293B] hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:text-[#1E293B]',
              'transition-colors'
            )}
          >
            COMMERCIAL
          </NavigationMenuTrigger>
          <NavigationMenuContent className="md:left-1/2 md:-translate-x-1/2">
            <ul className="w-[220px] p-2">
              {commercialLinks.map((item) => (
                <li key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className="flex flex-col gap-0.5 rounded-md px-3 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-[#1E293B] group-hover:text-emerald-600">
                        {item.label}
                      </span>
                      <span className="text-xs text-gray-400">{item.description}</span>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Simple links */}
        {simpleLinks.map((link) => (
          <NavigationMenuItem key={link.href} className="flex items-stretch">
            <NavigationMenuLink asChild>
              <Link
                href={link.href}
                className={cn(
                  'flex items-center px-4 text-sm font-medium text-gray-600 hover:text-[#1E293B] hover:bg-gray-100 transition-colors'
                )}
              >
                {link.label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}

        {/* RESOURCES dropdown */}
        <NavigationMenuItem className="flex items-stretch">
          <NavigationMenuTrigger
            className={cn(
              'h-full bg-transparent rounded-none px-4 text-sm font-medium text-gray-600',
              'hover:text-[#1E293B] hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:text-[#1E293B]',
              'transition-colors'
            )}
          >
            RESOURCES
          </NavigationMenuTrigger>
          <NavigationMenuContent className="md:left-1/2 md:-translate-x-1/2">
            <ul className="w-[280px] p-2">
              {resourcesLinks.map((item) => (
                <li key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className="flex flex-col gap-0.5 rounded-md px-3 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-[#1E293B] group-hover:text-emerald-600">
                        {item.label}
                      </span>
                      <span className="text-xs text-gray-400">{item.description}</span>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/* DISTRICTS data — preserved for future use in district browsing pages */
/*
const DISTRICTS = [
  { code: 'D01', name: 'Raffles Place / Marina' },
  { code: 'D02', name: 'Chinatown / Tanjong Pagar' },
  { code: 'D03', name: 'Alexandra / Commonwealth' },
  { code: 'D04', name: 'Harbourfront / Telok Blangah' },
  { code: 'D05', name: 'Buona Vista / West Coast' },
  { code: 'D06', name: 'City Hall / Clarke Quay' },
  { code: 'D07', name: 'Beach Road / Bugis' },
  { code: 'D08', name: 'Farrer Park / Serangoon Rd' },
  { code: 'D09', name: 'Orchard / River Valley' },
  { code: 'D10', name: 'Bukit Timah / Holland' },
  { code: 'D11', name: 'Newton / Novena' },
  { code: 'D12', name: 'Balestier / Toa Payoh' },
  { code: 'D13', name: 'Macpherson / Potong Pasir' },
  { code: 'D14', name: 'Geylang / Paya Lebar' },
  { code: 'D15', name: 'East Coast / Katong' },
  { code: 'D16', name: 'Bedok / Upper East Coast' },
  { code: 'D17', name: 'Loyang / Changi' },
  { code: 'D18', name: 'Tampines / Pasir Ris' },
  { code: 'D19', name: 'Hougang / Punggol' },
  { code: 'D20', name: 'Ang Mo Kio / Bishan' },
  { code: 'D21', name: 'Clementi / Upper Bukit Timah' },
  { code: 'D22', name: 'Jurong / Boon Lay' },
  { code: 'D23', name: 'Bukit Batok / Bukit Panjang' },
  { code: 'D24', name: 'Choa Chu Kang / Yew Tee' },
  { code: 'D25', name: 'Kranji / Woodlands' },
  { code: 'D26', name: 'Upper Thomson / Mandai' },
  { code: 'D27', name: 'Sembawang / Yishun' },
  { code: 'D28', name: 'Seletar / Yio Chu Kang' },
];
*/
