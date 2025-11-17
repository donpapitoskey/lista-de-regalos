'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 text-sm sm:text-base bg-stone-100 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-1 focus:ring-stone-600 transition-colors ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
}
