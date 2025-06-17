"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  isVisible,
  message,
  type = "info",
  duration = 3000,
  onClose
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 300); // Animation duration
  };

  if (!isVisible && !isExiting) return null;

  const typeStyles = {
    success: {
      bg: "bg-green-900/90 border-green-500",
      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
      text: "text-green-100"
    },
    error: {
      bg: "bg-red-900/90 border-red-500",
      icon: <XCircle className="w-5 h-5 text-red-400" />,
      text: "text-red-100"
    },
    warning: {
      bg: "bg-yellow-900/90 border-yellow-500",
      icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
      text: "text-yellow-100"
    },
    info: {
      bg: "bg-blue-900/90 border-blue-500",
      icon: <AlertCircle className="w-5 h-5 text-blue-400" />,
      text: "text-blue-100"
    }
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          ${styles.bg} ${styles.text}
          border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]
          flex items-center gap-3 backdrop-blur-sm
          transition-all duration-300 ease-in-out
          ${isVisible && !isExiting 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 translate-x-full"
          }
        `}
      >
        {styles.icon}
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Hook for easy toast management
export function useToast() {
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isVisible: false,
    message: "",
    type: "info"
  });

  const showToast = (
    message: string, 
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
} 