import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputRowProps {
  label: string;
  mainValue: number | '';
  jointValue: number | '';
  onMainChange: (value: number) => void;
  onJointChange: (value: number) => void;
  jointDisabled?: boolean;
  helpText?: string;
  mainPlaceholder?: string;
  jointPlaceholder?: string;
}

export function InputRow({
  label,
  mainValue,
  jointValue,
  onMainChange,
  onJointChange,
  jointDisabled = false,
  helpText,
  mainPlaceholder = '0',
  jointPlaceholder = '0',
}: InputRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-4">
        <label className="w-48 text-sm font-medium text-gray-900 pt-3 flex-shrink-0">
          {label}
        </label>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main applicant */}
          <div>
            <Label htmlFor={`${label}-main`} className="text-xs text-gray-600 mb-1 block">
              Main applicant
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                S$
              </span>
              <Input
                id={`${label}-main`}
                type="number"
                min="0"
                max="10000000"
                placeholder={mainPlaceholder}
                value={mainValue}
                onChange={(e) => onMainChange(e.target.value === '' ? 0 : Number(e.target.value))}
                className="h-11 pl-9 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Joint applicant */}
          <div>
            <Label htmlFor={`${label}-joint`} className="text-xs text-gray-600 mb-1 block">
              Joint applicant
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                S$
              </span>
              <Input
                id={`${label}-joint`}
                type="number"
                min="0"
                max="10000000"
                placeholder={jointPlaceholder}
                value={jointValue}
                onChange={(e) => onJointChange(e.target.value === '' ? 0 : Number(e.target.value))}
                disabled={jointDisabled}
                className="h-11 pl-9 border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {helpText && (
        <div className="flex">
          <div className="w-48 flex-shrink-0" />
          <p className="flex-1 text-xs text-gray-500 mt-1">{helpText}</p>
        </div>
      )}
    </div>
  );
}
