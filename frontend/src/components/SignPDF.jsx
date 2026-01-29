import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileCheck, Loader, CheckCircle, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { formatFileSize } from '../utils/helpers';

const SignPDF = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Signing options
  const [signerName, setSignerName] = useState('Document Signer');
  const [reason, setReason] = useState('Document approval');
  const [location, setLocation] = useState('Digital');
  const [contactInfo, setContactInfo] = useState('');

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

  const handleSign = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    if (!signerName.trim()) {
      setError('Please enter a signer name');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('signerName', signerName);
    formData.append('reason', reason);
    formData.append('location', location);
    if (contactInfo) formData.append('contactInfo', contactInfo);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/security/sign-pdf',
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
      link.setAttribute('download', `${file.name.replace('.pdf', '')}_signed.pdf`);
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
      console.error('Sign error:', err);
      setError(err.response?.data?.error || 'Failed to sign PDF. Please try again.');
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
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <FileCheck className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Sign PDF</h2>
          <p className="text-gray-400 text-sm">Add a digital signature to your PDF</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-green-200 text-sm">
            This generates a self-signed certificate and adds signature metadata to your PDF document.
          </p>
        </div>
      </div>

      {/* Signature Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Signer Name *
          </label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Your name or organization"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reason for Signing
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Document approval"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact Info (Optional)
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Email or phone"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Select PDF File
        </label>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
            file
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-gray-700 hover:border-green-500/50 bg-gray-800/30'
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <Upload className={`mx-auto mb-4 ${file ? 'text-green-400' : 'text-gray-400'}`} size={48} />
            {file ? (
              <div className="space-y-2">
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-300">Click to upload or drag and drop</p>
                <p className="text-gray-500 text-sm">PDF files only</p>
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
          className="bg-green-500/10 border border-green-500/50 rounded-lg p-4"
        >
          <div className="flex items-start space-x-2">
            <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-green-200 text-sm">PDF signed successfully! Download started.</p>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Signing PDF...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Sign Button */}
      <motion.button
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        onClick={handleSign}
        disabled={loading || !file}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          loading || !file
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/50'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center space-x-2">
            <Loader className="animate-spin" size={20} />
            <span>Signing PDF...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <FileCheck size={20} />
            <span>Sign PDF</span>
          </span>
        )}
      </motion.button>
    </motion.div>
  );
};

export default SignPDF;
