import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  confirmText?: string;
  confirmColor?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children, loading, confirmText, confirmColor }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative rounded-lg shadow-xl border max-w-md w-full m-4 p-6 transition-all transform animate-fade-in-scale"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10" style={{ backgroundColor: confirmColor ? `${confirmColor}20` : '#ffedd5' }}>
            <AlertTriangle className="h-6 w-6" style={{ color: confirmColor || '#f97316' }} aria-hidden="true" />
          </div>
          <div className="ml-4 text-left flex-1">
            <h3 className="text-lg leading-6 font-semibold" style={{ color: 'var(--text-primary)' }} id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{children}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center flex items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: confirmColor || '#f97316' }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {confirmText || 'Continue'}
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50 transition-colors hover:brightness-95"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Modal;