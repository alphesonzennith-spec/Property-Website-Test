'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function NavLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <Building2 className="w-[18px] h-[18px] text-white" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-[15px] text-[#1E293B] tracking-tight">
          Alzen<span className="text-[#f59e0b]">Realty</span>
        </span>
        <span className="text-[9px] text-gray-400 tracking-widest uppercase mt-0.5">
          Be In Control of Your Assets
        </span>
      </div>
    </Link>
  );
}
