import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface CustomSelectProps {
  label?: string;
  required?: boolean;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  required = false,
  options,
  value,
  onChange,
  placeholder = "Seleccionar una opción...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5">
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}

      {/* Caja de selección (Trigger) estilo Imagen 3 con rounded-2xl y tamaño responsive equilibrado */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white dark:bg-slate-900 border-2 rounded-2xl px-3.5 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between text-left transition-all shadow-xs ${
          isOpen
            ? 'border-sky-600 dark:border-sky-400 ring-2 ring-sky-500/20'
            : 'border-slate-800 dark:border-slate-300 hover:border-sky-500'
        }`}
      >
        <div className="flex-1 min-w-0 pr-2 sm:pr-3">
          {selectedOption ? (
            <div className="truncate font-bold text-slate-900 dark:text-white uppercase tracking-wide text-xs sm:text-sm">
              {selectedOption.label}
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">{placeholder}</span>
          )}
        </div>
        <div className="flex-shrink-0 text-slate-700 dark:text-slate-300">
          {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />}
        </div>
      </button>

      {/* Menú flotante (Dropdown) estilo Imagen 3 */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 sm:mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-1.5 sm:p-2 max-h-72 sm:max-h-80 overflow-y-auto space-y-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">No hay opciones disponibles</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1a4066] text-white shadow-md'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className={`font-bold uppercase text-[11px] sm:text-sm tracking-wide truncate ${
                      isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {option.label}
                    </div>
                    {option.sublabel && (
                      <div className={`text-[10px] sm:text-[11px] font-medium mt-0.5 truncate ${
                        isSelected ? 'text-sky-200' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {option.sublabel}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="flex-shrink-0 ml-2">
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
