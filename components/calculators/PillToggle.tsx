interface PillToggleOption {
  value: string;
  label: string;
}

interface PillToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: PillToggleOption[];
}

export function PillToggle({ value, onChange, options }: PillToggleProps) {
  return (
    <div className="rounded-full border border-gray-300 p-1 inline-flex">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-6 py-2 rounded-full transition-all duration-200 text-sm font-medium
            ${value === option.value
              ? 'bg-emerald-600 text-white'
              : 'bg-transparent text-gray-700 hover:text-gray-900'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
