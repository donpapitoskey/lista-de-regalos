'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-3 sm:px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base';
  
  const variants = {
    primary: 'bg-stone-800 text-stone-50 hover:bg-stone-700 border border-stone-900',
    secondary: 'bg-stone-200 text-stone-900 hover:bg-stone-300 border border-stone-400',
    danger: 'bg-red-800 text-stone-50 hover:bg-red-700 border border-red-900',
    ghost: 'text-stone-700 hover:bg-stone-200 border border-transparent hover:border-stone-300',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
