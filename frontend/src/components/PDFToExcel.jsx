import { useState } from 'react';
import { motion } from 'framer-motion';
import { Table, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadFile } from '../services/api';
import { formatFileSize, downloadBlob } from '../utils/helpers';

/**
 * PDF to Excel Component
 * Converts PDF files with tables to Excel (XLSX) format
 */
export default function PDFToExcel() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [useTabula, setUseTabula] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('useTabula', useTabula);

      const blob = await uploadFile('/api/convert/pdf-to-excel', formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });

      // Download the converted file
      const outputFilename = file.name.replace(/\.pdf$/i, '.xlsx');
      downloadBlob(blob, outputFilename);

      setSuccess(true);
      setProgress(100);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        setProgress(0);
      }, 3000);

    } catch (err) {
      setError(err.message || 'Conversion failed. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Table className="w-8 h-8 text-green-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
            PDF to Excel
          </h2>
        </div>
        <p className="text-gray-400">
          Extract tables from PDF documents to Excel spreadsheets
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-4">
        <label
          htmlFor="pdf-to-excel-input"
          className="block w-full p-8 border-2 border-dashed border-dark-border rounded-lg cursor-pointer hover:border-green-500 transition-colors"
        >
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-gray-500" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-300">
                {file ? file.name : 'Click to upload PDF'}
              </p>
              {file && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(file.size)}
                </p>
              )}
              {!file && (
                <p className="text-sm text-gray-500 mt-1">
                  or drag and drop your file here
                </p>
              )}
            </div>
          </div>
          <input
            id="pdf-to-excel-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Tabula Option (Future Enhancement) */}
        <div className="flex items-center gap-2">
          <input
            id="use-tabula"
            type="checkbox"
            checked={useTabula}
            onChange={(e) => setUseTabula(e.target.checked)}
            className="w-4 h-4 rounded border-dark-border bg-dark-bg text-green-500 focus:ring-green-500"
          />
          <label htmlFor="use-tabula" className="text-sm text-gray-400">
            Use advanced table detection (experimental)
          </label>
        </div>
      </div>

      {/* Convert Button */}
      <motion.button
        onClick={handleConvert}
        disabled={!file || loading}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-lg
          transition-all duration-300
          ${!file || loading
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-green-500/50'
          }
        `}
        whileHover={!file || loading ? {} : { scale: 1.02 }}
        whileTap={!file || loading ? {} : { scale: 0.98 }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Converting... {progress}%
          </span>
        ) : success ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Conversion Complete!
          </span>
        ) : (
          'Convert to Excel'
        )}
      </motion.button>

      {/* Progress Bar */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm text-gray-400">
            <span>Converting...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-green-500 font-medium">Success!</p>
            <p className="text-sm text-gray-400">Your spreadsheet has been converted and downloaded</p>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-red-500 font-medium">Error</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-dark-surface/50 border border-dark-border/50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-green-500">How it works:</h3>
        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
          <li>Upload your PDF document containing tables</li>
          <li>Tables are automatically detected and extracted</li>
          <li>Data is converted to Excel format</li>
          <li>Download your editable spreadsheet</li>
        </ul>
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
          <p className="text-sm text-yellow-500/90">
            <strong>Note:</strong> Works best with PDFs that have clear table structures. Complex layouts may require manual adjustment.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
