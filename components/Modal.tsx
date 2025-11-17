'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-stone-50 border border-stone-300 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-stone-50 border-b border-stone-300 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-medium text-stone-900 tracking-tight pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900 transition-colors p-1 flex-shrink-0"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
