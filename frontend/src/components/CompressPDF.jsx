import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minimize2, Download, Loader2, CheckCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import { compressPDF } from '../services/api';
import { downloadBlob } from '../utils/helpers';

const CompressPDF = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [quality, setQuality] = useState('ebook');

  const qualityOptions = [
    { value: 'screen', label: 'Screen', desc: '72 DPI - Smallest' },
    { value: 'ebook', label: 'Ebook', desc: '150 DPI - Balanced' },
    { value: 'printer', label: 'Printer', desc: '300 DPI - High Quality' },
    { value: 'prepress', label: 'Prepress', desc: '300 DPI - Color Preserving' },
  ];

  const handleCompress = async () => {
    if (files.length === 0) {
      alert('Please select a PDF file to compress');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus(null);

    try {
      const result = await compressPDF(files[0], quality, setProgress);
      
      if (result.success) {
        downloadBlob(result.blob, result.filename);
        setStatus('success');
        setTimeout(() => {
          setFiles([]);
          setStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Compress error:', error);
      setStatus('error');
      alert(error.message || 'Failed to compress PDF');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyber-pink/20 to-cyber-purple/20 rounded-xl flex items-center justify-center">
          <Minimize2 className="text-cyber-pink" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Compress PDF</h2>
          <p className="text-sm text-gray-400">Reduce PDF file size</p>
        </div>
      </div>

      {/* File Upload */}
      <FileUpload
        files={files}
        setFiles={setFiles}
        acceptedTypes={['.pdf']}
        multiple={false}
      />

      {/* Quality Selection */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Compression Quality
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {qualityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setQuality(option.value)}
                className={`
                  p-4 rounded-xl text-left transition-all
                  ${quality === option.value
                    ? 'bg-gradient-to-br from-cyber-pink/20 to-cyber-purple/20 border-2 border-cyber-pink'
                    : 'bg-dark-surface border-2 border-dark-border hover:border-cyber-pink/50'
                  }
                `}
              >
                <div className="font-semibold text-white mb-1">
                  {option.label}
                </div>
                <div className="text-xs text-gray-400">
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      {files.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleCompress}
          disabled={loading}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-lg
            bg-gradient-to-r from-cyber-pink to-cyber-purple
            hover:shadow-lg hover:shadow-cyber-pink/50
            transition-all duration-300 transform hover:scale-[1.02]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            flex items-center justify-center space-x-2
          `}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Compressing... {progress}%</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle size={24} />
              <span>Compressed Successfully!</span>
            </>
          ) : (
            <>
              <Download size={24} />
              <span>Compress PDF</span>
            </>
          )}
        </motion.button>
      )}

      {/* Progress Bar */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-2 bg-dark-border rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-cyber-pink to-cyber-purple"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default CompressPDF;
