import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  helperText,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239]">
        {label}
      </label>
      <input
        className={`w-full px-3.5 py-2.5 bg-[#F7EFE7] border text-sm text-[#3E3239] focus:outline-none transition-colors ${
          error
            ? 'border-red-600 focus:border-red-700'
            : 'border-[#C7A9A3] focus:border-[#3E3239]'
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-[11px] text-[#9E8189]">{helperText}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      )}
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
    <div className="space-y-1">
      <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239]">
        {label}
      </label>
      <textarea
        rows={rows}
        className={`w-full px-3.5 py-2.5 bg-[#F7EFE7] border text-sm text-[#3E3239] focus:outline-none transition-colors ${
          error
            ? 'border-red-600 focus:border-red-700'
            : 'border-[#C7A9A3] focus:border-[#3E3239]'
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-[11px] text-[#9E8189]">{helperText}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormSelect({
  label,
  error,
  children,
  className = '',
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239]">
        {label}
      </label>
      <select
        className={`w-full px-3.5 py-2.5 bg-[#F7EFE7] border text-sm text-[#3E3239] focus:outline-none transition-colors ${
          error
            ? 'border-red-600 focus:border-red-700'
            : 'border-[#C7A9A3] focus:border-[#3E3239]'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
