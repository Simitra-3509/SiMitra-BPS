import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast — Notifikasi pop-up kecil bergaya SIMITRA
 *
 * Props:
 *  - toasts   : array of { id, type, message }
 *  - onRemove : (id) => void
 *
 * Tipe toast: "success" | "error" | "warning" | "info"
 */
function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        // Mount animation
        const t1 = setTimeout(() => setVisible(true), 10);
        // Auto dismiss
        const t2 = setTimeout(() => handleClose(), toast.duration || 4000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const handleClose = () => {
        setLeaving(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const config = {
        success: {
            icon: CheckCircle2,
            iconColor: 'text-emerald-400',
            borderColor: 'border-l-emerald-500',
            bgGlow: 'from-emerald-900/20',
        },
        error: {
            icon: XCircle,
            iconColor: 'text-red-400',
            borderColor: 'border-l-red-500',
            bgGlow: 'from-red-900/20',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-amber-400',
            borderColor: 'border-l-amber-500',
            bgGlow: 'from-amber-900/20',
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-400',
            borderColor: 'border-l-blue-500',
            bgGlow: 'from-blue-900/20',
        },
    };

    const cfg = config[toast.type] || config.info;
    const Icon = cfg.icon;

    return (
        <div
            className={`
                flex items-start gap-3 min-w-[300px] max-w-sm w-full
                bg-gradient-to-r ${cfg.bgGlow} to-[#1a2435]
                border border-gray-700/60 border-l-4 ${cfg.borderColor}
                rounded-xl shadow-2xl px-4 py-3.5
                transition-all duration-300 ease-out
                ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}
            `}
        >
            <Icon size={18} className={`${cfg.iconColor} mt-0.5 shrink-0`} />
            <p className="flex-1 text-sm text-gray-200 font-medium leading-snug">
                {toast.message}
            </p>
            <button
                onClick={handleClose}
                className="p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
                <X size={14} />
            </button>
        </div>
    );
}

/**
 * ToastContainer — Tempatkan di root layout agar muncul di seluruh halaman
 * Contoh penggunaan di AuthenticatedLayout:
 *   import { ToastContainer } from '@/Components/Toast';
 *   <ToastContainer toasts={toasts} onRemove={removeToast} />
 */
export function ToastContainer({ toasts = [], onRemove }) {
    if (!toasts.length) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-2 items-end pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
}

export default ToastContainer;
