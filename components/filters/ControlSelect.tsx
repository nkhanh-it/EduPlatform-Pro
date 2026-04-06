import React from 'react';
import { ChevronDown } from 'lucide-react';

type ControlOption = {
  label: string;
  value: string;
};

interface ControlSelectProps {
  value: string;
  options: ControlOption[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const ControlSelect: React.FC<ControlSelectProps> = ({ value, options, onChange, label, className = '' }) => {
  return (
    <label className={`relative inline-flex min-w-[170px] items-center ${className}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition-all hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-card dark:text-slate-200"
      >
        {label && <option value="" disabled>{label}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-3 text-slate-400" />
    </label>
  );
};

export default ControlSelect;
