import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

/**
 * Merge multiple PDF files
 */
export const mergePDFs = async (files, onProgress) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await api.post('/pdf/merge', formData, {
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return {
      success: true,
      blob: response.data,
      filename: 'merged.pdf',
    };
  } catch (error) {
    console.error('Merge error:', error);
    throw new Error(error.response?.data?.error || 'Failed to merge PDFs');
  }
};

/**
 * Split PDF into pages
 */
export const splitPDF = async (file, mode = 'individual', pageRanges = null, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);
  if (pageRanges) {
    formData.append('pageRanges', pageRanges);
  }

  try {
    const response = await api.post('/pdf/split', formData, {
      responseType: mode === 'range' ? 'blob' : 'json',
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    if (mode === 'range') {
      return {
        success: true,
        blob: response.data,
        filename: `split_${pageRanges}.pdf`,
      };
    } else {
      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error) {
    console.error('Split error:', error);
    throw new Error(error.response?.data?.error || 'Failed to split PDF');
  }
};

/**
 * Compress PDF
 */
export const compressPDF = async (file, quality = 'ebook', onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality);

  try {
    const response = await api.post('/pdf/compress', formData, {
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return {
      success: true,
      blob: response.data,
      filename: `compressed_${quality}.pdf`,
    };
  } catch (error) {
    console.error('Compress error:', error);
    throw new Error(error.response?.data?.error || 'Failed to compress PDF');
  }
};

/**
 * Check server health
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/pdf/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    return { success: false, error: error.message };
  }
};

export default api;
