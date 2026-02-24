import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator, FileText, DollarSign, TrendingUp, Home, Coins, MapPin, ReceiptText } from 'lucide-react';

interface CalculatorNavProps {
  active: 'tdsr' | 'msr' | 'stamp-duty' | 'affordability' | 'mortgage' | 'cpf-optimizer' | 'property-value' | 'total-cost';
}

const NAV_ITEMS = [
  { id: 'tdsr', href: '/resources/calculators/tdsr', label: 'TDSR', Icon: Calculator },
  { id: 'msr', href: '/resources/calculators/msr', label: 'MSR', Icon: TrendingUp },
  { id: 'stamp-duty', href: '/resources/calculators/stamp-duty', label: 'Stamp Duty', Icon: FileText },
  { id: 'mortgage', href: '/resources/calculators/mortgage', label: 'Mortgage', Icon: Home },
  { id: 'affordability', href: '/resources/calculators/affordability', label: 'Affordability', Icon: DollarSign },
  { id: 'cpf-optimizer', href: '/resources/calculators/cpf-optimizer', label: 'CPF Optimizer', Icon: Coins },
  { id: 'property-value', href: '/resources/calculators/property-value', label: 'Property Value', Icon: MapPin },
  { id: 'total-cost', href: '/resources/calculators/total-cost', label: 'Total Cost', Icon: ReceiptText },
] as const;

export function CalculatorNav({ active }: CalculatorNavProps) {
  return (
    <div className="flex gap-2 mb-8 w-full">
      {NAV_ITEMS.map(({ id, href, label, Icon }) => {
        const isActive = active === id;
        return (
          <Link key={id} href={href} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className={`w-full h-auto py-2.5 gap-2 transition-all duration-200 shadow-sm ${isActive
                ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800 hover:border-emerald-800'
                : 'text-gray-600 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-semibold">{label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
