export const handleError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || 'Terjadi kesalahan pada server';
  } else if (error.request) {
    // Request made but no response
    return 'Tidak dapat terhubung ke server';
  } else {
    // Something else happened
    return error.message || 'Terjadi kesalahan';
  }
};
