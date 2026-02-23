'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';

export function NavActions() {
  const {
    isAuthenticated,
    legalName,
    email,
    isSingpassVerified,
    logout
  } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Compute initials safely from the legal component
  const avatarInitials = legalName ? legalName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  const firstName = legalName ? legalName.split(' ')[0] : 'User';

  // Mock notification count for UI sake
  const notificationCount = 3;

  return (
    <div className="hidden lg:flex items-center gap-3">
      {!isAuthenticated ? (
        <>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-[#1E293B] hover:bg-gray-100 text-xs h-8 px-3"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-[#1E293B] text-xs h-8 px-3 bg-transparent"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      ) : (
        <>
          {/* Notification bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-500 hover:text-[#1E293B] hover:bg-gray-100 h-8 w-8 rounded-full"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#f59e0b] text-[#0d2137] text-[9px] font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>

          {/* Dashboard button — moved to center-right area */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full px-4 h-8 text-xs gap-1.5 flex items-center"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard <ChevronDown className="w-3 h-3 text-white/50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="cursor-pointer font-medium">
                <Link href="/insights">Analytical Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer font-medium">
                <Link href="/family">Family Dashboard</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User avatar + dynamic verification area */}
          <div className="flex items-center relative">
            <DropdownMenu onOpenChange={setIsUserMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 text-gray-700 hover:text-[#1E293B] hover:bg-gray-100 h-9 px-2 rounded-full transition-all duration-300",
                    isSingpassVerified && "ring-[2px] ring-emerald-500 ring-offset-2 bg-emerald-50/10"
                  )}
                >
                  <Avatar className="h-6.5 w-6.5 border border-gray-200">
                    <AvatarFallback className="bg-emerald-600 text-white text-[10px] font-bold">
                      {avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold hidden xl:inline">{firstName}</span>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 opacity-50 transition-transform duration-300",
                    isUserMenuOpen && "rotate-180 opacity-100"
                  )} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-1.5"
                sideOffset={8}
              >
                <DropdownMenuLabel className="flex flex-col px-2 py-1.5">
                  <span className="text-xs font-bold text-gray-900">{legalName}</span>
                  <span className="text-[10px] text-gray-400 font-medium truncate">{email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer py-2 px-3 focus:bg-emerald-50 focus:text-emerald-700 rounded-md">
                  <Link href="/insights" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2 px-3 focus:bg-emerald-50 focus:text-emerald-700 rounded-md">
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2 px-3 focus:bg-emerald-50 focus:text-emerald-700 rounded-md">
                  <Link href="/profile/my-listings">My Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 cursor-pointer focus:bg-red-50 focus:text-red-600 rounded-md py-2 px-3"
                  onClick={logout}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dynamic "Verified" Badge appearing only when clicked/open - NOW ABSOLUTE TO PREVENT SHIFT */}
            {isSingpassVerified && isUserMenuOpen && (
              <div className="absolute left-full ml-3 flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full animate-in fade-in slide-in-from-left-3 duration-300 ease-out whitespace-nowrap whitespace-nowrap">
                <CheckCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                <span>Verified</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
