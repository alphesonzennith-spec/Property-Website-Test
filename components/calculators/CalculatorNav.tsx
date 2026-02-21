import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator, FileText, DollarSign } from 'lucide-react';

interface CalculatorNavProps {
  active: 'tdsr' | 'stamp-duty' | 'affordability';
}

export function CalculatorNav({ active }: CalculatorNavProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      <Link href="/resources/calculators/tdsr">
        <Button
          variant={active === 'tdsr' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          <Calculator className="w-4 h-4" />
          TDSR & MSR
        </Button>
      </Link>
      <Link href="/resources/calculators/stamp-duty">
        <Button
          variant={active === 'stamp-duty' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Stamp Duty
        </Button>
      </Link>
      <Link href="/resources/calculators/affordability">
        <Button
          variant={active === 'affordability' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          <DollarSign className="w-4 h-4" />
          Affordability
        </Button>
      </Link>
    </div>
  );
}
