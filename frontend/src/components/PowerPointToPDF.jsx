import { useState } from 'react';
import { Presentation, Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { formatFileSize } from '../utils/helpers';

export default function PowerPointToPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint'
      ];
      
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.match(/\.(pptx|ppt)$/i)) {
        setError('Please select a valid PowerPoint file (.pptx or .ppt)');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/convert/powerpoint-to-pdf',
        formData,
        {
          responseType: 'blob',
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name.replace(/\.(pptx|ppt)$/i, '.pdf'));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        setProgress(0);
      }, 3000);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(
        err.response?.data?.error ||
        'Failed to convert presentation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
          <Presentation className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            PowerPoint → PDF
          </h2>
          <p className="text-slate-400 text-sm">Convert presentations to PDF</p>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label
          htmlFor="ppt-upload"
          className="block w-full p-8 border-2 border-dashed border-slate-600 rounded-xl hover:border-orange-500 transition-colors cursor-pointer bg-slate-800/30 hover:bg-slate-800/50"
        >
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-slate-400" />
            <div className="text-center">
              <p className="text-slate-300 font-medium">
                {file ? file.name : 'Click to upload PowerPoint'}
              </p>
              {file && (
                <p className="text-slate-500 text-sm mt-1">
                  {formatFileSize(file.size)}
                </p>
              )}
              {!file && (
                <p className="text-slate-500 text-sm mt-1">
                  Supports .pptx and .ppt files
                </p>
              )}
            </div>
          </div>
          <input
            id="ppt-upload"
            type="file"
            accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Info Message */}
      <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <p className="text-orange-300 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Each slide will become a PDF page. Vector graphics and animations are preserved.
          </span>
        </p>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Converting...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-green-400" />
          <p className="text-green-300">Presentation converted successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-sm mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!file || loading || success}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-white
          transition-all duration-200 flex items-center justify-center gap-2
          ${
            file && !loading && !success
              ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl active:scale-95'
              : 'bg-slate-700 cursor-not-allowed opacity-50'
          }
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Converting...
          </>
        ) : success ? (
          <>
            <Check className="w-5 h-5" />
            Converted!
          </>
        ) : (
          <>
            <Presentation className="w-5 h-5" />
            Convert to PDF
          </>
        )}
      </button>
    </div>
  );
}
