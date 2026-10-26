import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  subtitle?: string;
  badge?: string;
}

export interface CustomSelectProps {
  label?: string;
  labelClassName?: string;
  triggerClassName?: string;
  menuClassName?: string;
  required?: boolean;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  prefixLabel?: string;
  dropdownAlign?: 'left' | 'right' | 'full';
  compact?: boolean;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  labelClassName,
  triggerClassName,
  menuClassName,
  required = false,
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  className = "",
  icon,
  prefixLabel,
  dropdownAlign = 'full',
  compact = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Si hay poco espacio abajo (< 250px) y más espacio arriba, abrir hacia arriba
      if (spaceBelow < 250 && rect.top > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clases por defecto para el botón disparador (Trigger) siguiendo el diseño de Imagen 1
  const defaultTriggerClass = compact
    ? `w-full bg-white dark:bg-[#0c121e] border rounded-full px-3 sm:px-3.5 py-1.5 flex items-center justify-between text-left transition-all shadow-xs cursor-pointer text-xs sm:text-sm ${isOpen
      ? 'border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20'
      : 'border-sky-500 hover:border-sky-400 dark:border-sky-400/90'
    }`
    : `w-full bg-white dark:bg-[#0c121e] border rounded-full px-3.5 sm:px-4 py-1.5 flex items-center justify-between text-left transition-all shadow-xs cursor-pointer text-xs sm:text-sm ${isOpen
      ? 'border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20'
      : 'border-sky-500 hover:border-sky-400 dark:border-sky-400/90'
    }`;

  // Posicionamiento horizontal del menú flotante
  const alignClass = dropdownAlign === 'right'
    ? 'right-0 min-w-full w-max max-w-xs sm:max-w-sm'
    : dropdownAlign === 'left'
      ? 'left-0 min-w-full w-max max-w-xs sm:max-w-sm'
      : 'left-0 right-0 w-full';

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-20'} ${className}`} ref={containerRef}>
      {label && (
        <label className={labelClassName || "block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 sm:mb-1.5"}>
          {label} {required && !label.includes('*') && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}

      {/* Botón Trigger Estilo Imagen 1 (Cápsula redondeada y borde celeste) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`${triggerClassName || defaultTriggerClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center min-w-0 pr-1.5 flex-1">
          {icon && <span className="mr-1.5 flex-shrink-0">{icon}</span>}
          {prefixLabel && (
            <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1.5 flex-shrink-0">
              {prefixLabel}
            </span>
          )}
          {selectedOption ? (
            <span className="truncate font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 truncate text-xs sm:text-sm">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex-shrink-0 text-slate-600 dark:text-slate-300 ml-1">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          )}
        </div>
      </button>

      {/* Menú Flotante Idéntico a Imagen 2 */}
      {isOpen && (
        <div
          className={`absolute ${openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} z-50 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 sm:p-2 max-h-72 sm:max-h-80 overflow-y-auto space-y-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${alignClass} ${menuClassName || ''}`}
        >
          {options.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">No hay opciones disponibles</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              const sub = option.sublabel || option.subtitle;
              const hasSublabel = Boolean(sub);

              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer transition-all flex items-center justify-between ${hasSublabel ? 'p-2.5 sm:p-3 rounded-2xl' : 'px-3 py-2 rounded-xl text-xs sm:text-sm'
                    } ${isSelected
                      ? 'bg-[#1a4066] text-white shadow-md'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className={`font-bold ${hasSublabel ? 'uppercase text-[11px] sm:text-xs tracking-wide' : 'text-xs font-semibold'} truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                      {option.label}
                    </div>
                    {sub && (
                      <div className={`text-[10px] sm:text-[11px] font-medium mt-0.5 truncate ${isSelected ? 'text-sky-200' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                        {sub}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="flex-shrink-0 ml-1.5">
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
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

export default CustomSelect;
