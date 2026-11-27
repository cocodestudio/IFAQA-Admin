'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const inputBase =
  'w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-ifaqa-plum placeholder:text-[#5A6962]/60 focus:outline-none focus:ring-2 focus:ring-ifaqa-plum/15 transition-colors';

export function FormInput({
  label,
  error,
  helperText,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-ifaqa-plum">{label}</label>
      <input
        className={`${inputBase} ${
          error
            ? 'border-red-500 focus:border-red-600'
            : 'border-ifaqa-plum/15 focus:border-ifaqa-plum'
        } ${className}`}
        {...props}
      />
      {helperText && !error && <p className="text-xs text-[#5A6962]">{helperText}</p>}
      {error && <p className="text-xs text-red-700 font-medium">{error}</p>}
    </div>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormTextarea({
  label,
  error,
  helperText,
  className = '',
  rows = 4,
  ...props
}: FormTextareaProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-ifaqa-plum">{label}</label>
      <textarea
        rows={rows}
        className={`${inputBase} ${
          error
            ? 'border-red-500 focus:border-red-600'
            : 'border-ifaqa-plum/15 focus:border-ifaqa-plum'
        } ${className}`}
        {...props}
      />
      {helperText && !error && <p className="text-xs text-[#5A6962]">{helperText}</p>}
      {error && <p className="text-xs text-red-700 font-medium">{error}</p>}
    </div>
  );
}

export interface SelectOptionItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps {
  label?: string;
  error?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  surface?: 'white' | 'linen';
  compact?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
  options?: SelectOptionItem[];
}

function extractOptions(children: React.ReactNode): SelectOptionItem[] {
  const result: SelectOptionItem[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === 'option') {
      const props = child.props as {
        value?: string | number;
        disabled?: boolean;
        children?: React.ReactNode;
      };
      const val =
        props.value !== undefined
          ? String(props.value)
          : typeof props.children === 'string'
          ? props.children
          : '';
      const labelText = React.Children.toArray(props.children)
        .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
        .join('')
        .trim();
      result.push({
        value: val,
        label: labelText || val,
        disabled: !!props.disabled,
      });
    } else if (child.props && (child.props as any).children) {
      result.push(...extractOptions((child.props as any).children));
    }
  });
  return result;
}

export function FormSelect({
  label,
  error,
  value,
  defaultValue,
  onChange,
  disabled = false,
  className = '',
  surface = 'white',
  compact = false,
  placeholder = 'Select an option',
  children,
  options: propOptions,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  const [internalVal, setInternalVal] = useState(
    defaultValue !== undefined ? String(defaultValue) : ''
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => (propOptions && propOptions.length > 0 ? propOptions : extractOptions(children)),
    [propOptions, children]
  );

  const currentValue = value !== undefined ? String(value) : internalVal;
  const activeOption = items.find((opt) => opt.value === currentValue) || items[0];

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const handleSelect = (opt: SelectOptionItem) => {
    if (opt.disabled) return;
    if (value === undefined) {
      setInternalVal(opt.value);
    }
    if (onChange) {
      const syntheticEvent = {
        target: { value: opt.value },
        currentTarget: { value: opt.value },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setOpen(false);
  };

  const bgClass = surface === 'linen' ? 'bg-ifaqa-linen hover:bg-white' : 'bg-white';
  const heightClass = compact ? 'h-10 py-2' : 'min-h-[42px] py-2.5';

  return (
    <div ref={containerRef} className={`relative ${label ? 'space-y-1.5' : ''}`}>
      {label && <label className="block text-xs font-medium text-ifaqa-plum">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full px-3.5 rounded-lg border text-left text-sm flex items-center justify-between gap-2 transition-colors focus:outline-none ${heightClass} ${bgClass} ${
          error
            ? 'border-red-500 focus:border-red-600'
            : open
            ? 'border-ifaqa-plum ring-2 ring-ifaqa-plum/15 bg-white'
            : 'border-ifaqa-plum/15 hover:border-ifaqa-plum/30 focus:border-ifaqa-plum'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        <span className="truncate text-ifaqa-plum">
          {activeOption ? activeOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#5A6962] shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180 text-ifaqa-plum' : ''
          }`}
          strokeWidth={1.6}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-1.5 z-50 bg-white rounded-xl border border-ifaqa-plum/15 shadow-luxury-lifted p-1.5 max-h-60 overflow-y-auto admin-enter"
        >
          {items.map((opt) => {
            const isSelected = opt.value === currentValue;
            return (
              <button
                key={`${opt.value}-${opt.label}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt)}
                className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                  opt.disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : isSelected
                    ? 'bg-ifaqa-cashmere text-ifaqa-plum font-medium'
                    : 'text-[#3E524A] hover:bg-ifaqa-linen hover:text-ifaqa-plum'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#165A45] shrink-0" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-700 font-medium">{error}</p>}
    </div>
  );
}
