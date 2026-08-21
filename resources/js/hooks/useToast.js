import { useState, useCallback } from 'react';

let toastCounter = 0;

/**
 * useToast — Hook untuk mengelola notifikasi toast
 *
 * Returns:
 *  - toasts      : array of toast objects
 *  - toast       : { success, error, warning, info }  — fungsi untuk menampilkan toast
 *  - removeToast : (id) => void
 *
 * Contoh penggunaan:
 *   const { toasts, toast, removeToast } = useToast();
 *   toast.success('Data berhasil disimpan!');
 *   toast.error('Terjadi kesalahan!');
 *   <ToastContainer toasts={toasts} onRemove={removeToast} />
 */
export default function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message, duration = 4000) => {
        const id = ++toastCounter;
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (msg, duration) => addToast('success', msg, duration),
        error:   (msg, duration) => addToast('error',   msg, duration),
        warning: (msg, duration) => addToast('warning', msg, duration),
        info:    (msg, duration) => addToast('info',    msg, duration),
    };

    return { toasts, toast, removeToast };
}
