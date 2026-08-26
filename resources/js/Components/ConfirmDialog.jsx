import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Lock, Unlock, CheckCircle2, Info } from 'lucide-react';

/**
 * ConfirmDialog — Pengganti window.confirm() bergaya SIMITRA
 *
 * Props:
 *  - isOpen       : boolean
 *  - onConfirm    : () => void
 *  - onCancel / onClose : () => void
 *  - title        : string
 *  - message      : string
 *  - confirmText  : string
 *  - cancelText   : string  (default: "Batal")
 *  - variant / type : "danger" | "warning" | "info" | "success" | "lock" | "unlock"  (default: "danger")
 *  - icon         : LucideIcon component (optional custom icon)
 */
export default function ConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    onClose,
    title,
    message,
    confirmText,
    cancelText = 'Batal',
    variant,
    type,
    icon: CustomIcon,
}) {
    const handleClose = onCancel || onClose;

    // Tutup saat tekan Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') handleClose?.();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    const activeVariant = variant || type || 'danger';

    const variantConfig = {
        danger: {
            iconBg: 'bg-red-500/15 border border-red-500/30',
            iconColor: 'text-red-400',
            confirmBg: 'bg-red-600 hover:bg-red-500 shadow-red-900/30',
            ring: 'ring-red-500/20',
            topAccent: 'bg-gradient-to-r from-transparent via-red-500 to-transparent',
            Icon: Trash2,
            defaultTitle: 'Konfirmasi Hapus',
            defaultMessage: 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
            defaultConfirmText: 'Ya, Hapus',
        },
        warning: {
            iconBg: 'bg-amber-500/15 border border-amber-500/30',
            iconColor: 'text-amber-400',
            confirmBg: 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30',
            ring: 'ring-amber-500/20',
            topAccent: 'bg-gradient-to-r from-transparent via-amber-500 to-transparent',
            Icon: AlertTriangle,
            defaultTitle: 'Konfirmasi',
            defaultMessage: 'Apakah Anda yakin ingin melanjutkan?',
            defaultConfirmText: 'Ya, Lanjutkan',
        },
        info: {
            iconBg: 'bg-blue-500/15 border border-blue-500/30',
            iconColor: 'text-blue-400',
            confirmBg: 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30',
            ring: 'ring-blue-500/20',
            topAccent: 'bg-gradient-to-r from-transparent via-blue-500 to-transparent',
            Icon: Info,
            defaultTitle: 'Informasi',
            defaultMessage: 'Apakah Anda yakin ingin melanjutkan?',
            defaultConfirmText: 'Ya, Mengerti',
        },
        success: {
            iconBg: 'bg-emerald-500/15 border border-emerald-500/30',
            iconColor: 'text-emerald-400',
            confirmBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30',
            ring: 'ring-emerald-500/20',
            topAccent: 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent',
            Icon: CheckCircle2,
            defaultTitle: 'Konfirmasi',
            defaultMessage: 'Apakah Anda yakin ingin melanjutkan?',
            defaultConfirmText: 'Ya, Lanjutkan',
        },
        lock: {
            iconBg: 'bg-amber-500/15 border border-amber-500/30',
            iconColor: 'text-amber-400',
            confirmBg: 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30',
            ring: 'ring-amber-500/20',
            topAccent: 'bg-gradient-to-r from-transparent via-amber-500 to-transparent',
            Icon: Lock,
            defaultTitle: 'Kunci Periode',
            defaultMessage: 'Apakah Anda yakin ingin mengunci periode pengisian?',
            defaultConfirmText: 'Ya, Kunci Periode',
        },
        unlock: {
            iconBg: 'bg-emerald-500/15 border border-emerald-500/30',
            iconColor: 'text-emerald-400',
            confirmBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30',
            ring: 'ring-emerald-500/20',
            topAccent: 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent',
            Icon: Unlock,
            defaultTitle: 'Buka Kunci Periode',
            defaultMessage: 'Apakah Anda yakin ingin membuka kunci periode pengisian?',
            defaultConfirmText: 'Ya, Buka Kunci',
        },
    };

    const cfg = variantConfig[activeVariant] || variantConfig.danger;
    const Icon = CustomIcon || cfg.Icon;
    const finalTitle = title || cfg.defaultTitle;
    const finalMessage = message || cfg.defaultMessage;
    const finalConfirmText = confirmText || cfg.defaultConfirmText;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="confirm-dialog-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Dialog Panel */}
            <div
                className="relative w-full max-w-sm bg-[#1a2435] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    animation: 'confirmDialogIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
            >
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${cfg.topAccent}`} />

                <div className="p-6">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-700/60 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cfg.iconBg}`}>
                        <Icon size={22} className={cfg.iconColor} />
                    </div>

                    {/* Content */}
                    <h3
                        id="confirm-dialog-title"
                        className="text-base font-bold text-white mb-2 leading-snug pr-6"
                    >
                        {finalTitle}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {finalMessage}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700/50 bg-gray-900/30">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/60 hover:bg-gray-600/60 border border-gray-600/50 rounded-xl transition-all duration-150 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-150 shadow-lg cursor-pointer flex items-center gap-2 ${cfg.confirmBg}`}
                    >
                        <Icon size={14} />
                        {finalConfirmText}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes confirmDialogIn {
                    from { opacity: 0; transform: scale(0.85) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
