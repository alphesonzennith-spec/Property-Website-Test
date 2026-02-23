'use client';

import { useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// --- Data ---
const BUY_PRICE_OPTIONS = [
  { value: 'under-500k', label: 'Under S$500K' },
  { value: '500k-1m', label: 'S$500K – S$1M' },
  { value: '1m-2m', label: 'S$1M – S$2M' },
  { value: '2m-5m', label: 'S$2M – S$5M' },
  { value: '5m-plus', label: 'S$5M+' },
];
const RENT_PRICE_OPTIONS = [
  { value: 'under-2k', label: 'Under S$2K/mo' },
  { value: '2k-4k', label: 'S$2K – S$4K/mo' },
  { value: '4k-8k', label: 'S$4K – S$8K/mo' },
  { value: '8k-plus', label: 'S$8K+/mo' },
];
const DISTRICT_OPTIONS = [
  { value: 'D01', label: 'D01 – Raffles Place / Marina' },
  { value: 'D02', label: 'D02 – Chinatown / Tg Pagar' },
  { value: 'D03', label: 'D03 – Alexandra / Commonwealth' },
  { value: 'D04', label: 'D04 – Harbourfront / Telok Blangah' },
  { value: 'D05', label: 'D05 – Buona Vista / West Coast' },
  { value: 'D06', label: 'D06 – City Hall / Clarke Quay' },
  { value: 'D07', label: 'D07 – Beach Road / Bugis' },
  { value: 'D08', label: 'D08 – Farrer Park / Serangoon Rd' },
  { value: 'D09', label: 'D09 – Orchard / River Valley' },
  { value: 'D10', label: 'D10 – Bukit Timah / Holland' },
  { value: 'D11', label: 'D11 – Newton / Novena' },
  { value: 'D12', label: 'D12 – Balestier / Toa Payoh' },
  { value: 'D13', label: 'D13 – Macpherson / Potong Pasir' },
  { value: 'D14', label: 'D14 – Geylang / Paya Lebar' },
  { value: 'D15', label: 'D15 – East Coast / Katong' },
  { value: 'D16', label: 'D16 – Bedok / Upper East Coast' },
  { value: 'D17', label: 'D17 – Loyang / Changi' },
  { value: 'D18', label: 'D18 – Tampines / Pasir Ris' },
  { value: 'D19', label: 'D19 – Hougang / Punggol' },
  { value: 'D20', label: 'D20 – Ang Mo Kio / Bishan' },
  { value: 'D21', label: 'D21 – Clementi / Upper Bukit Timah' },
  { value: 'D22', label: 'D22 – Jurong / Boon Lay' },
  { value: 'D23', label: 'D23 – Bukit Batok / Bukit Panjang' },
  { value: 'D24', label: 'D24 – Choa Chu Kang / Yew Tee' },
  { value: 'D25', label: 'D25 – Kranji / Woodlands' },
  { value: 'D26', label: 'D26 – Upper Thomson / Mandai' },
  { value: 'D27', label: 'D27 – Sembawang / Yishun' },
  { value: 'D28', label: 'D28 – Seletar / Yio Chu Kang' },
];
const PROPERTY_TYPE_OPTIONS = [
  { value: 'hdb', label: 'HDB' },
  { value: 'condo', label: 'Condo' },
  { value: 'landed', label: 'Landed' },
  { value: 'ec', label: 'Executive Condo (EC)' },
  { value: 'commercial', label: 'Commercial' },
];

// --- Multi-select Filter Component ---
interface MultiSelectProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}

function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectProps) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  const displayLabel =
    selected.length === 0
      ? label
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? label
        : `${selected.length} selected`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors min-w-[130px] justify-between"
        >
          <span className={selected.length > 0 ? 'text-[#1E293B] font-medium' : 'text-gray-400'}>
            {displayLabel}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-56 max-h-72 overflow-y-auto" align="start">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
              id={`filter-${opt.value}`}
            />
            <span className="text-sm text-gray-700 select-none">{opt.label}</span>
          </label>
        ))}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="w-full mt-1 pt-1 border-t border-gray-100 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 py-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

// --- Main Component ---
export function HeroSearch() {
  const [tab, setTab] = useState<'buy' | 'rent'>('buy');
  const [query, setQuery] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  const priceOptions = tab === 'buy' ? BUY_PRICE_OPTIONS : RENT_PRICE_OPTIONS;

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-md p-5">
      {/* Tab toggle */}
      <div className="flex gap-2 mb-4">
        {(['buy', 'rent'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setSelectedPrices([]); }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-[#F59E0B] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'buy' ? 'BUY' : 'RENT'}
          </button>
        ))}
      </div>

      {/* Primary search input */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by property name, street or district..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[#1E293B] text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-gray-50"
          />
        </div>
        <Button className="bg-[#F59E0B] hover:bg-amber-400 text-white font-semibold px-6 rounded-xl shadow-sm shrink-0">
          Search
        </Button>
      </div>

      {/* Optional filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400 font-medium shrink-0">Optional filters:</span>
        <MultiSelectFilter
          label="District"
          options={DISTRICT_OPTIONS}
          selected={selectedDistricts}
          onChange={setSelectedDistricts}
        />
        <MultiSelectFilter
          label="Property Type"
          options={PROPERTY_TYPE_OPTIONS}
          selected={selectedTypes}
          onChange={setSelectedTypes}
        />
        <MultiSelectFilter
          label="Price Range"
          options={priceOptions}
          selected={selectedPrices}
          onChange={setSelectedPrices}
        />
        {(selectedDistricts.length > 0 || selectedTypes.length > 0 || selectedPrices.length > 0) && (
          <button
            type="button"
            onClick={() => { setSelectedDistricts([]); setSelectedTypes([]); setSelectedPrices([]); }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}
