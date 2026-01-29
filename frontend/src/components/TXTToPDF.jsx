import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader, CheckCircle, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { formatFileSize } from '../utils/helpers';

const TXTToPDF = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Conversion options
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Courier New');
  const [lineSpacing, setLineSpacing] = useState(1.15);
  const [margin, setMargin] = useState(1.0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
        setError('');
        setSuccess(false);
      } else {
        setError('Please select a valid TXT file');
        setFile(null);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a TXT file first');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fontSize', fontSize.toString());
    formData.append('fontFamily', fontFamily);
    formData.append('lineSpacing', lineSpacing.toString());
    formData.append('margin', margin.toString());

    try {
      const response = await axios.post(
        'http://localhost:5000/api/security/txt-to-pdf',
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
      link.setAttribute('download', `${file.name.replace(/\.txt$/i, '')}.pdf`);
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
      setError(err.response?.data?.error || 'Failed to convert TXT to PDF. Please try again.');
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
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
          <FileText className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">TXT to PDF</h2>
          <p className="text-gray-400 text-sm">Convert plain text files to PDF</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-indigo-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-indigo-200 text-sm">
            Your text file will be converted to a properly formatted PDF with customizable styling.
          </p>
        </div>
      </div>

      {/* Format Settings */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
            >
              <option value="Courier New">Courier New (Monospace)</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Font Size: {fontSize}pt
            </label>
            <input
              type="range"
              min="8"
              max="24"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>8pt</span>
              <span>16pt</span>
              <span>24pt</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Line Spacing: {lineSpacing.toFixed(2)}
            </label>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.05"
              value={lineSpacing}
              onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Single</span>
              <span>1.5</span>
              <span>Double</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Margin: {margin.toFixed(1)} inch
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5"</span>
              <span>1.0"</span>
              <span>2.0"</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Select TXT File
        </label>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
            file
              ? 'border-indigo-500/50 bg-indigo-500/5'
              : 'border-gray-700 hover:border-indigo-500/50 bg-gray-800/30'
          }`}
        >
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <Upload className={`mx-auto mb-4 ${file ? 'text-indigo-400' : 'text-gray-400'}`} size={48} />
            {file ? (
              <div className="space-y-2">
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-300">Click to upload or drag and drop</p>
                <p className="text-gray-500 text-sm">TXT files only</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/50 rounded-lg p-4"
        >
          <div className="flex items-start space-x-2">
            <X className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Success Display */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-500/10 border border-indigo-500/50 rounded-lg p-4"
        >
          <div className="flex items-start space-x-2">
            <CheckCircle className="text-indigo-400 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-indigo-200 text-sm">Conversion successful! Download started.</p>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Converting to PDF...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      )}

      {/* Convert Button */}
      <motion.button
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        onClick={handleConvert}
        disabled={loading || !file}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          loading || !file
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/50'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center space-x-2">
            <Loader className="animate-spin" size={20} />
            <span>Converting...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <FileText size={20} />
            <span>Convert to PDF</span>
          </span>
        )}
      </motion.button>
    </motion.div>
  );
};

export default TXTToPDF;
