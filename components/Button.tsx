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
  
  const variantClasses = {
    primary: 'bg-poinsettia text-stone-50 hover:bg-poinsettia/90 border border-poinsettia/90',
    secondary: 'bg-forest text-stone-50 hover:bg-forest/90 border border-forest/90',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 border border-rose-700',
    ghost: 'bg-transparent text-stone-700 hover:bg-stone-200 border border-transparent hover:border-stone-300',
  };

  return (
    <button
      className={`${baseStyles} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
