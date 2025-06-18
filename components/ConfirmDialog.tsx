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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-start mb-4">
          <h3 className="page-title">{title}</h3>
          <button
            onClick={onCancel}
            className="text-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-muted mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-3">
        <button
            onClick={onConfirm}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
} 