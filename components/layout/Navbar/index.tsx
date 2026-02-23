'use client';

import { NavLogo } from './NavLogo';
import { NavMenu } from './NavMenu';
import { NavActions } from './NavActions';
import { MobileNav } from './MobileNav';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full h-[64px] bg-gray-50 border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        <NavLogo />
        <NavMenu />
        <NavActions />
        <MobileNav />
      </div>
    </nav>
  );
}
