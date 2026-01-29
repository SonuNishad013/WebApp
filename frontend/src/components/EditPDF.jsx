import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Edit3, Loader, CheckCircle, X, AlertCircle, RotateCw } from 'lucide-react';
import axios from 'axios';
import { formatFileSize } from '../utils/helpers';

const EditPDF = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Edit options
  const [operation, setOperation] = useState('rotate');
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState('');
  const [password, setPassword] = useState('');

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

  const handleEdit = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    // Validate inputs based on operation
    if (operation === 'remove-pages' && !pages) {
      setError('Please specify page ranges to keep (e.g., 1-3,5)');
      return;
    }

    if (operation === 'decrypt' && !password) {
      setError('Please enter the PDF password');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('operation', operation);
    
    if (operation === 'rotate') {
      formData.append('angle', angle.toString());
      if (pages) formData.append('pages', pages);
    } else if (operation === 'remove-pages') {
      formData.append('pages', pages);
    } else if (operation === 'decrypt') {
      formData.append('password', password);
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/image/edit-pdf',
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
      
      const operationNames = {
        rotate: 'rotated',
        'remove-pages': 'pages-removed',
        decrypt: 'decrypted',
      };
      
      link.setAttribute('download', `${file.name.replace('.pdf', '')}_${operationNames[operation]}.pdf`);
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
        setPages('');
        setPassword('');
      }, 3000);
    } catch (err) {
      console.error('Edit error:', err);
      setError(err.response?.data?.error || 'Failed to edit PDF. Please try again.');
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
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Edit3 className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Edit PDF</h2>
          <p className="text-gray-400 text-sm">Rotate pages, remove pages, or decrypt PDF</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-purple-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-purple-200 text-sm">
            Choose an operation: rotate pages, keep specific pages, or remove password protection.
          </p>
        </div>
      </div>

      {/* Operation Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Select Operation
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setOperation('rotate')}
            className={`p-4 rounded-lg border-2 transition-all ${
              operation === 'rotate'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-dark-border bg-dark-surface hover:border-purple-500/50'
            }`}
          >
            <RotateCw className={`mx-auto mb-2 ${operation === 'rotate' ? 'text-purple-400' : 'text-gray-400'}`} size={24} />
            <p className={`text-sm font-semibold ${operation === 'rotate' ? 'text-purple-300' : 'text-gray-300'}`}>
              Rotate Pages
            </p>
          </button>
          
          <button
            onClick={() => setOperation('remove-pages')}
            className={`p-4 rounded-lg border-2 transition-all ${
              operation === 'remove-pages'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-dark-border bg-dark-surface hover:border-purple-500/50'
            }`}
          >
            <Edit3 className={`mx-auto mb-2 ${operation === 'remove-pages' ? 'text-purple-400' : 'text-gray-400'}`} size={24} />
            <p className={`text-sm font-semibold ${operation === 'remove-pages' ? 'text-purple-300' : 'text-gray-300'}`}>
              Keep Pages
            </p>
          </button>
          
          <button
            onClick={() => setOperation('decrypt')}
            className={`p-4 rounded-lg border-2 transition-all ${
              operation === 'decrypt'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-dark-border bg-dark-surface hover:border-purple-500/50'
            }`}
          >
            <X className={`mx-auto mb-2 ${operation === 'decrypt' ? 'text-purple-400' : 'text-gray-400'}`} size={24} />
            <p className={`text-sm font-semibold ${operation === 'decrypt' ? 'text-purple-300' : 'text-gray-300'}`}>
              Remove Password
            </p>
          </button>
        </div>
      </div>

      {/* Operation-specific Options */}
      <div className="space-y-4">
        {operation === 'rotate' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rotation Angle
              </label>
              <select
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value={90}>90° Clockwise</option>
                <option value={180}>180°</option>
                <option value={270}>270° (90° Counter-clockwise)</option>
                <option value={-90}>90° Counter-clockwise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pages to Rotate (optional)
              </label>
              <input
                type="text"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="e.g., 1-3,5 or leave empty for all pages"
                className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-gray-500 text-xs mt-1">Leave empty to rotate all pages</p>
            </div>
          </>
        )}

        {operation === 'remove-pages' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pages to Keep <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="e.g., 1-3,5-7,10"
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <p className="text-gray-500 text-xs mt-1">Specify which pages to keep. All others will be removed.</p>
          </div>
        )}

        {operation === 'decrypt' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PDF Password <span className="text-purple-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter PDF password"
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
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
          className="block w-full p-8 border-2 border-dashed border-dark-border rounded-xl cursor-pointer hover:border-purple-500 transition-all bg-dark-surface/50"
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className="text-purple-400" size={32} />
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
            <p className="text-green-200 font-semibold">PDF edited successfully!</p>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Processing...</span>
            <span className="text-purple-400 font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Edit Button */}
      <button
        onClick={handleEdit}
        disabled={!file || loading}
        className={`
          w-full py-4 rounded-xl font-semibold text-white text-lg
          transition-all duration-300 flex items-center justify-center space-x-2
          ${!file || loading
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/50'
          }
        `}
      >
        {loading ? (
          <>
            <Loader className="animate-spin" size={20} />
            <span>Editing PDF...</span>
          </>
        ) : (
          <>
            <Edit3 size={20} />
            <span>Edit PDF</span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export default EditPDF;
