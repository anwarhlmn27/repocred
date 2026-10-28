/**
 * Alert & Notification Utility for RepoCred
 * - Confirmation alert: SweetAlert2 modal dialog (confirmAlert)
 * - Notification alert: Toast notification in top-end (toastSuccess, toastError, toastWarning, toastInfo)
 */

/**
 * Get the Swal instance from window.Swal
 */
function getSwal() {
    if (typeof window !== 'undefined' && window.Swal) {
        return window.Swal;
    }
    return null;
}

/**
 * Menampilkan alert konfirmasi menggunakan SweetAlert2
 *
 * @param {Object} options
 * @param {string} [options.title] - Judul konfirmasi (default: 'Apakah Anda yakin?')
 * @param {string} [options.text] - Keterangan/deskripsi aksi
 * @param {string} [options.confirmButtonText] - Teks tombol konfirmasi (default: 'Ya, Lanjutkan')
 * @param {string} [options.cancelButtonText] - Teks tombol batal (default: 'Batal')
 * @param {'warning' | 'question' | 'info' | 'error' | 'success'} [options.icon] - Ikon SweetAlert
 * @param {string} [options.confirmButtonColor] - Warna tombol konfirmasi (default: '#4361ee')
 * @param {string} [options.cancelButtonColor] - Warna tombol batal (default: '#6c757d')
 * @returns {Promise<boolean>} - True jika user menekan tombol konfirmasi
 */
export async function confirmAlert({
    title = 'Apakah Anda yakin?',
    text = 'Tindakan ini tidak dapat dibatalkan.',
    confirmButtonText = 'Ya, Lanjutkan',
    cancelButtonText = 'Batal',
    icon = 'warning',
    confirmButtonColor = '#4361ee',
    cancelButtonColor = '#6c757d',
} = {}) {
    const swal = getSwal();
    if (swal) {
        const result = await swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonColor,
            cancelButtonColor,
            confirmButtonText,
            cancelButtonText,
            reverseButtons: true,
            focusCancel: true,
        });
        return result.isConfirmed;
    }

    // Fallback bila SweetAlert belum siap
    return window.confirm(text ? `${title}\n${text}` : title);
}

/**
 * Membuat instance toast SweetAlert2 yang konsisten
 */
function createToastInstance() {
    const swal = getSwal();
    if (!swal) return null;

    return swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', swal.stopTimer);
            toast.addEventListener('mouseleave', swal.resumeTimer);
        },
    });
}

/**
 * Menampilkan notifikasi Toast
 *
 * @param {string} message - Isi pesan notifikasi
 * @param {'success' | 'error' | 'warning' | 'info'} [type='success'] - Jenis notifikasi
 * @param {string} [title] - Judul toast (opsional)
 */
export function toastAlert(message, type = 'success', title = '') {
    if (!message) return;

    const toast = createToastInstance();
    if (toast) {
        const defaultTitle =
            type === 'success'
                ? 'Berhasil'
                : type === 'error'
                ? 'Terjadi Kesalahan'
                : type === 'warning'
                ? 'Perhatian'
                : 'Informasi';

        toast.fire({
            icon: type,
            title: title || defaultTitle,
            text: message,
        });
        return;
    }

    // Fallback toastr jika tersedia
    if (typeof window !== 'undefined' && window.toastr && window.toastr[type]) {
        window.toastr[type](message, title);
        return;
    }

    // Fallback dasar
    if (type === 'error') {
        console.error('[Toast Error]', message);
    } else {
        console.log(`[Toast ${type}]`, message);
    }
}

/**
 * Shorthand notifikasi sukses
 */
export function toastSuccess(message, title = 'Berhasil') {
    toastAlert(message, 'success', title);
}

/**
 * Shorthand notifikasi error / gagal
 */
export function toastError(message, title = 'Gagal') {
    toastAlert(message, 'error', title);
}

/**
 * Shorthand notifikasi peringatan / warning
 */
export function toastWarning(message, title = 'Perhatian') {
    toastAlert(message, 'warning', title);
}

/**
 * Shorthand notifikasi informasi
 */
export function toastInfo(message, title = 'Informasi') {
    toastAlert(message, 'info', title);
}

// Pasang ke window untuk kemudahan pemanggilan di mana pun jika diperlukan
if (typeof window !== 'undefined') {
    window.confirmAlert = confirmAlert;
    window.toastAlert = toastAlert;
    window.toastSuccess = toastSuccess;
    window.toastError = toastError;
    window.toastWarning = toastWarning;
    window.toastInfo = toastInfo;
}

