'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Building2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/lib/hooks/useAuth';

const residentialLinks = [
  { label: 'Buy', href: '/residential/buy' },
  { label: 'Rent', href: '/residential/rent' },
  { label: 'Sell / List', href: '/list-property' },
];

const commercialLinks = [
  { label: 'Buy', href: '/commercial/buy' },
  { label: 'Rent', href: '/commercial/rent' },
  { label: 'Sell / List', href: '/list-property?type=commercial' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const {
    isAuthenticated,
    legalName,
    isSingpassVerified,
    logout
  } = useAuth();

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-gray-600 hover:text-[#1E293B] hover:bg-gray-100 h-9 w-9"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <SheetContent
        side="left"
        className="w-[300px] bg-[#0d2137] border-r border-white/10 p-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b border-white/10">
          <SheetTitle className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[15px]">
              ALZEN<span className="text-[#f59e0b]">Realty</span>
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">Navigation menu</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2">
          <Accordion type="multiple" className="w-full">
            {/* RESIDENTIAL accordion */}
            <AccordionItem value="residential" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 hover:no-underline">
                RESIDENTIAL
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="px-2 pb-2">
                  {residentialLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="flex items-center px-4 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* COMMERCIAL accordion */}
            <AccordionItem value="commercial" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 hover:no-underline">
                COMMERCIAL
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="px-2 pb-2">
                  {commercialLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="flex items-center px-4 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Simple links */}
          {[
            { label: 'New Launches', href: '/residential/buy?type=new-launches' },
            { label: 'Directory', href: '/directory' },
            { label: 'News', href: '/news' },
            { label: 'Calculators', href: '/resources/calculators' },
            { label: 'Knowledge Base', href: '/learn' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="flex items-center px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Bottom auth section */}
        <div className="p-4 border-t border-white/10">
          {!isAuthenticated ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/5 border border-white/10"
              >
                <Link href="/login" onClick={close}>Login</Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 bg-transparent"
                asChild
              >
                <Link href="/signup" onClick={close}>
                  Sign Up
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {legalName ? legalName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{legalName || 'User'}</p>
                  {isSingpassVerified && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Singpass Verified
                    </p>
                  )}
                </div>
              </div>
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full"
                asChild
              >
                <Link href="/insights" onClick={close}>Analytical Dashboard</Link>
              </Button>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full"
                asChild
              >
                <Link href="/family" onClick={close}>Family Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-white/5"
                onClick={() => { logout(); close(); }}
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
