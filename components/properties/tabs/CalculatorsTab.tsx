'use client';

import { useState } from 'react';
import { Property } from '@/types/property';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';

// Import calculator components from existing calculator pages
// Note: These would need to be refactored into reusable components
import { TDSRCalculatorSection } from './calculators/TDSRCalculatorSection';
import { StampDutyCalculatorSection } from './calculators/StampDutyCalculatorSection';
import { AffordabilityCalculatorSection } from './calculators/AffordabilityCalculatorSection';

interface CalculatorsTabProps {
  property: Property;
}

export function CalculatorsTab({ property }: CalculatorsTabProps) {
  const [activeCalculator, setActiveCalculator] = useState<'tdsr' | 'stamp-duty' | 'affordability'>('tdsr');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Property Calculators</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            Use these calculators to estimate financing options, stamp duty costs, and
            affordability for this property.
          </p>
        </CardContent>
      </Card>

      {/* Calculators */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeCalculator} onValueChange={(val) => setActiveCalculator(val as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="tdsr">TDSR & MSR</TabsTrigger>
              <TabsTrigger value="stamp-duty">Stamp Duty</TabsTrigger>
              <TabsTrigger value="affordability">Affordability</TabsTrigger>
            </TabsList>

            <TabsContent value="tdsr">
              <TDSRCalculatorSection propertyPrice={property.price} />
            </TabsContent>

            <TabsContent value="stamp-duty">
              <StampDutyCalculatorSection propertyPrice={property.price} />
            </TabsContent>

            <TabsContent value="affordability">
              <AffordabilityCalculatorSection propertyPrice={property.price} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> These calculators provide estimates only and should not be
            considered as financial advice. Actual costs and loan eligibility may vary based on your
            personal circumstances, lender policies, and government regulations. Please consult a
            licensed financial advisor or mortgage specialist for accurate calculations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
