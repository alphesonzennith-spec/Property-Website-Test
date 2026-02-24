interface ResultItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ResultsPanelProps {
  title: string;
  results: ResultItem[];
}

export function ResultsPanel({ title, results }: ResultsPanelProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{result.label}</span>
            <span
              className={
                result.highlight
                  ? 'text-2xl font-bold text-emerald-600'
                  : 'text-lg font-semibold text-gray-900'
              }
            >
              {result.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
