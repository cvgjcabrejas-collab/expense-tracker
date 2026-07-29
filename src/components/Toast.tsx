'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-success/10 text-success border border-success/20',
    error: 'bg-danger/10 text-danger border border-danger/20',
    info: 'bg-primary/10 text-primary border border-primary/20',
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 px-4 py-3 rounded-lg flex items-center gap-3 animate-slide-in max-w-sm',
        styles[type]
      )}
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
