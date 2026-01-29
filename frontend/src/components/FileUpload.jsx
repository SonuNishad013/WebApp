import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize, validateFileType, validateFileSize } from '../utils/helpers';

const FileUpload = ({ 
  files, 
  setFiles, 
  acceptedTypes = ['.pdf'], 
  multiple = false,
  maxSize = 10 
}) => {
  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file => {
      if (!validateFileType(file, acceptedTypes)) {
        alert(`${file.name} is not an accepted file type. Accepted: ${acceptedTypes.join(', ')}`);
        return false;
      }
      if (!validateFileSize(file, maxSize)) {
        alert(`${file.name} exceeds maximum size of ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (multiple) {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  }, [acceptedTypes, multiple, maxSize, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple,
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-300 overflow-hidden
          ${isDragActive 
            ? 'border-cyber-blue bg-cyber-blue/10 animate-glow' 
            : 'border-dark-border hover:border-cyber-blue/50 bg-dark-surface'
          }
        `}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 to-cyber-purple/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
        
        <input {...getInputProps()} />
        
        <div className="relative z-10">
          <motion.div
            animate={{
              y: isDragActive ? -10 : 0,
              scale: isDragActive ? 1.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Upload 
              className={`mx-auto mb-4 ${isDragActive ? 'text-cyber-blue' : 'text-gray-400'}`} 
              size={48}
            />
          </motion.div>
          
          <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            {isDragActive ? 'Drop files here' : 'Upload Files'}
          </h3>
          
          <p className="text-gray-400 text-sm mb-2">
            Drag & drop or click to select
          </p>
          
          <p className="text-xs text-gray-500">
            Accepted: {acceptedTypes.join(', ')} • Max {maxSize}MB
            {multiple && ' • Multiple files allowed'}
          </p>
        </div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-3"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-dark-surface border border-dark-border rounded-lg hover:border-cyber-blue/50 transition-colors group"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 rounded-lg flex items-center justify-center">
                    <FileText className="text-cyber-blue" size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
