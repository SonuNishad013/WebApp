import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader, CheckCircle, X, AlertCircle, Plus } from 'lucide-react';
import axios from 'axios';
import { formatFileSize } from '../utils/helpers';

const JPGToPDF = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Conversion options
  const [pageSize, setPageSize] = useState('letter');
  const [quality, setQuality] = useState(85);
  const [autoRotate, setAutoRotate] = useState(true);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' || 
      file.type === 'image/png'
    );

    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      setError('');
      setSuccess(false);
    } else {
      setError('Please select valid JPG or PNG files');
    }
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please select at least one image file');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('pageSize', pageSize);
    formData.append('quality', quality.toString());
    formData.append('autoRotate', autoRotate.toString());

    try {
      const response = await axios.post(
        'http://localhost:5000/api/image/jpg-to-pdf',
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
      link.setAttribute('download', 'images.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setProgress(100);

      // Reset after success
      setTimeout(() => {
        setFiles([]);
        setSuccess(false);
        setProgress(0);
      }, 3000);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err.response?.data?.error || 'Failed to convert images. Please try again.');
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
        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <FileText className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">JPG to PDF</h2>
          <p className="text-gray-400 text-sm">Convert images to a single PDF document</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-teal-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-teal-200 text-sm">
            Upload multiple images to create a multi-page PDF. Images will be arranged in the order you add them.
          </p>
        </div>
      </div>

      {/* Conversion Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Page Size
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-teal-500"
          >
            <option value="letter">Letter (8.5" × 11")</option>
            <option value="a4">A4 (210mm × 297mm)</option>
            <option value="legal">Legal (8.5" × 14")</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image Quality: {quality}%
          </label>
          <input
            type="range"
            min="50"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Smaller PDF</span>
            <span>Larger PDF</span>
          </div>
        </div>
      </div>

      {/* Auto-rotate Option */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="auto-rotate"
          checked={autoRotate}
          onChange={(e) => setAutoRotate(e.target.checked)}
          className="w-5 h-5 rounded border-dark-border bg-dark-surface text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
        />
        <label htmlFor="auto-rotate" className="text-sm text-gray-300 cursor-pointer">
          Auto-rotate images based on EXIF orientation
        </label>
      </div>

      {/* File Upload */}
      <div>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="block w-full p-8 border-2 border-dashed border-dark-border rounded-xl cursor-pointer hover:border-teal-500 transition-all bg-dark-surface/50"
        >
          <div className="flex flex-col items-center space-y-2">
            <Plus className="text-teal-400" size={32} />
            <p className="text-white font-semibold">Click to add images</p>
            <p className="text-gray-400 text-sm">JPG and PNG files (multiple allowed)</p>
          </div>
        </label>

        {/* Selected Files */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">{files.length} image(s) selected</p>
              <button
                onClick={() => setFiles([])}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="p-3 bg-dark-surface border border-dark-border rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-teal-400 font-mono text-sm">{index + 1}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{file.name}</p>
                      <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
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
            <div>
              <p className="text-red-200 text-sm">{error}</p>
              {error && (
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-300 text-xs mt-1 underline"
                >
                  Dismiss
                </button>
              )}
            </div>
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
            <p className="text-green-200 font-semibold">PDF created successfully!</p>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Creating PDF from images...</span>
            <span className="text-teal-400 font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={files.length === 0 || loading}
        className={`
          w-full py-4 rounded-xl font-semibold text-white text-lg
          transition-all duration-300 flex items-center justify-center space-x-2
          ${files.length === 0 || loading
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-teal-500/50'
          }
        `}
      >
        {loading ? (
          <>
            <Loader className="animate-spin" size={20} />
            <span>Creating PDF...</span>
          </>
        ) : (
          <>
            <FileText size={20} />
            <span>Create PDF</span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export default JPGToPDF;
