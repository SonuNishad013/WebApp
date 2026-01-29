import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import { mergePDFs } from '../services/api';
import { downloadBlob } from '../utils/helpers';

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // 'success', 'error', null

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus(null);

    try {
      const result = await mergePDFs(files, setProgress);
      
      if (result.success) {
        downloadBlob(result.blob, result.filename);
        setStatus('success');
        setTimeout(() => {
          setFiles([]);
          setStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Merge error:', error);
      setStatus('error');
      alert(error.message || 'Failed to merge PDFs');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 rounded-xl flex items-center justify-center">
          <Layers className="text-cyber-blue" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Merge PDFs</h2>
          <p className="text-sm text-gray-400">Combine multiple PDF files into one</p>
        </div>
      </div>

      {/* File Upload */}
      <FileUpload
        files={files}
        setFiles={setFiles}
        acceptedTypes={['.pdf']}
        multiple={true}
      />

      {/* Action Button */}
      {files.length >= 2 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleMerge}
          disabled={loading}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-lg
            bg-gradient-to-r from-cyber-blue to-cyber-purple
            hover:shadow-lg hover:shadow-cyber-blue/50
            transition-all duration-300 transform hover:scale-[1.02]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            flex items-center justify-center space-x-2
          `}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Merging... {progress}%</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle size={24} />
              <span>Merged Successfully!</span>
            </>
          ) : (
            <>
              <Download size={24} />
              <span>Merge {files.length} PDFs</span>
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
            className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default MergePDF;
