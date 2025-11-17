'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';

interface DropdownProps {
  children: ReactNode;
}

export default function Dropdown({ children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
        aria-label="Opciones"
      >
        <MoreVertical size={18} className="sm:w-5 sm:h-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 sm:w-48 bg-stone-50 border border-stone-300 shadow-lg z-10">
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'default' | 'danger';
}

export function DropdownItem({ onClick, children, variant = 'default' }: DropdownItemProps) {
  const colorClass = variant === 'danger' ? 'text-red-700 hover:bg-red-50' : 'text-stone-700 hover:bg-stone-100';
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm transition-colors ${colorClass}`}
    >
      {children}
    </button>
  );
}
