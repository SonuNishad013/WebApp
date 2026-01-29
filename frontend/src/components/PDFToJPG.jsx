import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Loader, CheckCircle, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { formatFileSize } from '../utils/helpers';

const PDFToJPG = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Conversion options
  const [dpi, setDpi] = useState(150);
  const [quality, setQuality] = useState(90);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
        setSuccess(false);
      } else {
        setError('Please select a valid PDF file');
        setFile(null);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('dpi', dpi.toString());
    formData.append('quality', quality.toString());

    try {
      const response = await axios.post(
        'http://localhost:5000/api/image/pdf-to-jpg',
        formData,
        {
          responseType: 'blob',
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          },
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Determine file extension based on content type
      const contentType = response.headers['content-type'];
      const extension = contentType === 'application/zip' ? 'zip' : 'jpg';
      
      link.setAttribute('download', `${file.name.replace('.pdf', '')}_images.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setProgress(100);

      // Reset after success
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        setProgress(0);
      }, 3000);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err.response?.data?.error || 'Failed to convert PDF. Please try again.');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
          <Image className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">PDF to JPG</h2>
          <p className="text-gray-400 text-sm">Convert PDF pages to high-quality JPG images</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-amber-200 text-sm">
            Each page will be converted to a separate JPG image. Multi-page PDFs will be delivered as a ZIP file.
          </p>
        </div>
      </div>

      {/* Conversion Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image Quality
          </label>
          <select
            value={dpi}
            onChange={(e) => setDpi(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            <option value={72}>Screen (72 DPI) - Smaller files</option>
            <option value={150}>Standard (150 DPI) - Balanced</option>
            <option value={300}>High (300 DPI) - Best quality</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            JPEG Quality: {quality}%
          </label>
          <input
            type="range"
            min="50"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Smaller</span>
            <span>Larger</span>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="block w-full p-8 border-2 border-dashed border-dark-border rounded-xl cursor-pointer hover:border-amber-500 transition-all bg-dark-surface/50"
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className="text-amber-400" size={32} />
            <p className="text-white font-semibold">Click to upload PDF</p>
            <p className="text-gray-400 text-sm">PDF files only</p>
          </div>
        </label>

        {file && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-dark-surface border border-dark-border rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-400" size={20} />
            <p className="text-green-200 font-semibold">Images generated successfully!</p>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Converting pages to images...</span>
            <span className="text-amber-400 font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!file || loading}
        className={`
          w-full py-4 rounded-xl font-semibold text-white text-lg
          transition-all duration-300 flex items-center justify-center space-x-2
          ${!file || loading
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-amber-500/50'
          }
        `}
      >
        {loading ? (
          <>
            <Loader className="animate-spin" size={20} />
            <span>Converting...</span>
          </>
        ) : (
          <>
            <Image size={20} />
            <span>Convert to JPG</span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export default PDFToJPG;
