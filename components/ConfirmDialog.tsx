"use client";

import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger"
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      icon: "text-red-400"
    },
    warning: {
      confirmBtn: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      icon: "text-yellow-400"
    },
    info: {
      confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      icon: "text-blue-400"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl border border-blue-900 shadow-lg w-96 max-w-[90vw]">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-blue-400">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg 
                     hover:bg-gray-600 transition-colors duration-300
                     focus:ring-2 focus:ring-gray-500 focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors duration-300
                       focus:ring-2 focus:outline-none ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 