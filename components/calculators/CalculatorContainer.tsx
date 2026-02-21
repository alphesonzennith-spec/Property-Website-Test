import { ReactNode } from 'react';

interface CalculatorContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function CalculatorContainer({ title, subtitle, children }: CalculatorContainerProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
