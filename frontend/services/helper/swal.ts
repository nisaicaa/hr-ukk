import Swal from 'sweetalert2';

export const showSuccess = (title: string, message?: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonColor: '#059669', // emerald-600
  });
};

export const showError = (title: string, message?: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonColor: '#059669',
  });
};

export const showConfirm = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#059669',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal'
  });
};

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: icon,
      title: title
    });
};
