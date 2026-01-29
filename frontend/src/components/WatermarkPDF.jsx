import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Droplets, Loader, CheckCircle, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { formatFileSize } from '../utils/helpers';

const WatermarkPDF = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Watermark options
  const [text, setText] = useState('CONFIDENTIAL');
  const [position, setPosition] = useState('center');
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState('gray');

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

  const handleWatermark = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    if (!text.trim()) {
      setError('Please enter watermark text');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', text);
    formData.append('position', position);
    formData.append('opacity', opacity.toString());
    formData.append('fontSize', fontSize.toString());
    formData.append('angle', angle.toString());
    formData.append('color', color);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/security/watermark-pdf',
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
      link.setAttribute('download', `${file.name.replace('.pdf', '')}_watermarked.pdf`);
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
      console.error('Watermark error:', err);
      setError(err.response?.data?.error || 'Failed to add watermark. Please try again.');
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
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Droplets className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Watermark PDF</h2>
          <p className="text-gray-400 text-sm">Add a custom watermark to your PDF</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-blue-200 text-sm">
            The watermark will be added to all pages of your PDF. Customize text, position, and appearance below.
          </p>
        </div>
      </div>

      {/* Watermark Settings */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Watermark Text *
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="CONFIDENTIAL"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            >
              <option value="center">Center</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            >
              <option value="gray">Gray</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="black">Black</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Opacity: {Math.round(opacity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Font Size: {fontSize}pt
            </label>
            <input
              type="range"
              min="24"
              max="120"
              step="4"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Angle: {angle}°
            </label>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0°</span>
              <span>45°</span>
              <span>90°</span>
            </div>
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
              ? 'border-blue-500/50 bg-blue-500/5'
              : 'border-gray-700 hover:border-blue-500/50 bg-gray-800/30'
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <Upload className={`mx-auto mb-4 ${file ? 'text-blue-400' : 'text-gray-400'}`} size={48} />
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
          className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4"
        >
          <div className="flex items-start space-x-2">
            <CheckCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-blue-200 text-sm">Watermark added successfully! Download started.</p>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Adding watermark...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </div>
        </div>
      )}

      {/* Watermark Button */}
      <motion.button
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        onClick={handleWatermark}
        disabled={loading || !file}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          loading || !file
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center space-x-2">
            <Loader className="animate-spin" size={20} />
            <span>Adding Watermark...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <Droplets size={20} />
            <span>Add Watermark</span>
          </span>
        )}
      </motion.button>
    </motion.div>
  );
};

export default WatermarkPDF;
