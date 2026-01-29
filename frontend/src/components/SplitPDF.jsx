import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Download, Loader2, CheckCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import { splitPDF } from '../services/api';
import { downloadBlob } from '../utils/helpers';

const SplitPDF = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [mode, setMode] = useState('individual'); // 'individual' or 'range'
  const [pageRanges, setPageRanges] = useState('1-3');

  const handleSplit = async () => {
    if (files.length === 0) {
      alert('Please select a PDF file to split');
      return;
    }

    if (mode === 'range' && !pageRanges) {
      alert('Please enter page ranges (e.g., 1-3)');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus(null);

    try {
      const result = await splitPDF(
        files[0], 
        mode, 
        mode === 'range' ? pageRanges : null, 
        setProgress
      );
      
      if (result.success) {
        if (result.blob) {
          downloadBlob(result.blob, result.filename);
        } else if (result.data) {
          alert(`PDF split into ${result.data.files.length} pages. Check console for details.`);
          console.log('Split result:', result.data);
        }
        setStatus('success');
        setTimeout(() => {
          setFiles([]);
          setStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Split error:', error);
      setStatus('error');
      alert(error.message || 'Failed to split PDF');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyber-purple/20 to-cyber-pink/20 rounded-xl flex items-center justify-center">
          <Scissors className="text-cyber-purple" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Split PDF</h2>
          <p className="text-sm text-gray-400">Extract pages from PDF</p>
        </div>
      </div>

      {/* File Upload */}
      <FileUpload
        files={files}
        setFiles={setFiles}
        acceptedTypes={['.pdf']}
        multiple={false}
      />

      {/* Mode Selection */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('individual')}
              className={`
                py-3 px-4 rounded-xl font-medium transition-all
                ${mode === 'individual'
                  ? 'bg-gradient-to-r from-cyber-purple to-cyber-pink text-white'
                  : 'bg-dark-surface border border-dark-border text-gray-400 hover:border-cyber-purple/50'
                }
              `}
            >
              Split Each Page
            </button>
            <button
              onClick={() => setMode('range')}
              className={`
                py-3 px-4 rounded-xl font-medium transition-all
                ${mode === 'range'
                  ? 'bg-gradient-to-r from-cyber-purple to-cyber-pink text-white'
                  : 'bg-dark-surface border border-dark-border text-gray-400 hover:border-cyber-purple/50'
                }
              `}
            >
              Extract Range
            </button>
          </div>

          {mode === 'range' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                type="text"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
                placeholder="e.g., 1-3 or 1,3,5"
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-500 focus:border-cyber-purple focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter page ranges (e.g., 1-3 for pages 1 to 3)
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Action Button */}
      {files.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSplit}
          disabled={loading}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-lg
            bg-gradient-to-r from-cyber-purple to-cyber-pink
            hover:shadow-lg hover:shadow-cyber-purple/50
            transition-all duration-300 transform hover:scale-[1.02]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            flex items-center justify-center space-x-2
          `}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Splitting... {progress}%</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle size={24} />
              <span>Split Successfully!</span>
            </>
          ) : (
            <>
              <Download size={24} />
              <span>Split PDF</span>
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
            className="h-full bg-gradient-to-r from-cyber-purple to-cyber-pink"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default SplitPDF;
