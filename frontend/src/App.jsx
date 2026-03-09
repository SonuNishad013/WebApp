import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import {
  Zap,
  FileText,
  Merge,
  Split,
  Shrink,
  Presentation,
  FileSpreadsheet,
  FileType,
  Edit3,
  ImageDown,
  Image,
  FileSignature,
  Stamp,
  Type,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import MergePDF from './components/MergePDF';
import SplitPDF from './components/SplitPDF';
import CompressPDF from './components/CompressPDF';
import PDFToWord from './components/PDFToWord';
import PDFToPowerPoint from './components/PDFToPowerPoint';
import PDFToExcel from './components/PDFToExcel';
import WordToPDF from './components/WordToPDF';
import PowerPointToPDF from './components/PowerPointToPDF';
import ExcelToPDF from './components/ExcelToPDF';
import EditPDF from './components/EditPDF';
import PDFToJPG from './components/PDFToJPG';
import ImageToPDF from './components/ImageToPDF';
import SignPDF from './components/SignPDF';
import WatermarkPDF from './components/WatermarkPDF';
import TXTToPDF from './components/TXTToPDF';
import './index.css';

const tools = [
  {
    id: 'merge',
    path: '/merge-pdf',
    label: 'Merge PDF',
    description: 'Combine multiple PDFs into one file.',
    component: MergePDF,
    icon: Merge,
  },
  {
    id: 'split',
    path: '/split-pdf',
    label: 'Split PDF',
    description: 'Split a PDF into separate pages.',
    component: SplitPDF,
    icon: Split,
  },
  {
    id: 'compress',
    path: '/compress-pdf',
    label: 'Compress PDF',
    description: 'Reduce file size while keeping quality.',
    component: CompressPDF,
    icon: Shrink,
  },
  {
    id: 'pdf-to-word',
    path: '/pdf-to-word',
    label: 'PDF to Word',
    description: 'Convert PDFs into editable Word files.',
    component: PDFToWord,
    icon: FileText,
  },
  {
    id: 'pdf-to-ppt',
    path: '/pdf-to-powerpoint',
    label: 'PDF to PowerPoint',
    description: 'Turn PDFs into PowerPoint slides.',
    component: PDFToPowerPoint,
    icon: Presentation,
  },
  {
    id: 'pdf-to-excel',
    path: '/pdf-to-excel',
    label: 'PDF to Excel',
    description: 'Extract tables into Excel spreadsheets.',
    component: PDFToExcel,
    icon: FileSpreadsheet,
  },
  {
    id: 'word-to-pdf',
    path: '/word-to-pdf',
    label: 'Word to PDF',
    description: 'Convert DOCX documents to PDF.',
    component: WordToPDF,
    icon: FileType,
  },
  {
    id: 'ppt-to-pdf',
    path: '/powerpoint-to-pdf',
    label: 'PowerPoint to PDF',
    description: 'Convert PPT/PPTX files to PDF.',
    component: PowerPointToPDF,
    icon: Presentation,
  },
  {
    id: 'excel-to-pdf',
    path: '/excel-to-pdf',
    label: 'Excel to PDF',
    description: 'Convert XLSX sheets into PDF.',
    component: ExcelToPDF,
    icon: FileSpreadsheet,
  },
  {
    id: 'edit-pdf',
    path: '/edit-pdf',
    label: 'Edit PDF',
    description: 'Edit, annotate, and tweak PDFs.',
    component: EditPDF,
    icon: Edit3,
  },
  {
    id: 'pdf-to-jpg',
    path: '/pdf-to-jpg',
    label: 'PDF to JPG',
    description: 'Export PDF pages to JPG images.',
    component: PDFToJPG,
    icon: ImageDown,
  },
  {
    id: 'jpg-to-pdf',
    path: '/jpg-to-pdf',
    label: 'Image to PDF',
    description: 'Convert images into a PDF file.',
    component: ImageToPDF,
    icon: Image,
  },
  {
    id: 'sign-pdf',
    path: '/sign-pdf',
    label: 'Sign PDF',
    description: 'Add signatures to your PDFs.',
    component: SignPDF,
    icon: FileSignature,
  },
  {
    id: 'watermark',
    path: '/watermark-pdf',
    label: 'Watermark PDF',
    description: 'Stamp a watermark on PDFs.',
    component: WatermarkPDF,
    icon: Stamp,
  },
  {
    id: 'txt-to-pdf',
    path: '/txt-to-pdf',
    label: 'TXT to PDF',
    description: 'Convert text files into PDFs.',
    component: TXTToPDF,
    icon: Type,
  },
];

const Header = ({ compact = false }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className={compact ? 'text-center mb-8' : 'text-center mb-12'}
  >
    <div className="flex items-center justify-center mb-4">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className={
          compact
            ? 'w-12 h-12 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-xl flex items-center justify-center mr-3'
            : 'w-16 h-16 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-2xl flex items-center justify-center mr-4'
        }
      >
        <Zap className="text-white" size={compact ? 24 : 32} />
      </motion.div>
      <div className="text-left">
        <h1
          className={
            compact
              ? 'text-3xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent'
              : 'text-5xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent'
          }
        >
          PDF Converter
        </h1>
        <p className="text-gray-400 text-sm mt-1">Futuristic Document Processing</p>
      </div>
    </div>
  </motion.div>
);

const Footer = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
    className="mt-12 text-center text-sm text-gray-500"
  >
    <div className="flex items-center justify-center space-x-2">
      <FileText size={16} />
      <span>Parts 1-5: PDF Processing, Conversion, Image & Security Services</span>
    </div>
    <p className="mt-2">
      Powered by qpdf • Ghostscript • LibreOffice • Poppler • ImageMagick • OpenSSL
    </p>
  </motion.div>
);

const HomePage = () => (
  <motion.div
    key="home"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
    className="max-w-6xl mx-auto"
  >
    <Header />

    <div className="text-center mb-10">
      <p className="text-gray-300 max-w-2xl mx-auto">
        Every PDF tool you need, in one place. Pick a box to launch a dedicated workspace
        for each task.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        return (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            <Link
              to={tool.path}
              className="firecrawl-card group block p-5 h-full"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 flex items-center justify-center">
                  <Icon className="text-cyber-blue" size={24} />
                </div>
                <div className="text-cyber-blue/70 group-hover:text-cyber-blue flex items-center text-xs uppercase tracking-[0.2em]">
                  Open
                  <ArrowRight size={14} className="ml-2" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white mb-1">{tool.label}</h3>
                <p className="text-sm text-gray-400">{tool.description}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>

    <Footer />
  </motion.div>
);

const ToolPage = ({ tool }) => {
  const ToolComponent = tool.component;

  return (
    <motion.div
      key={tool.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <Header compact />

      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-cyber-blue/80 hover:text-cyber-blue transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to all tools
        </Link>
      </div>

      <div className="bg-dark-surface/50 backdrop-blur-xl rounded-2xl p-8 border border-dark-border shadow-2xl">
        <ToolComponent />
      </div>

      <Footer />
    </motion.div>
  );
};

const NotFound = () => (
  <motion.div
    key="not-found"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
    className="max-w-4xl mx-auto text-center"
  >
    <Header compact />
    <div className="bg-dark-surface/50 backdrop-blur-xl rounded-2xl p-8 border border-dark-border shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
      <p className="text-gray-400 mb-6">
        The tool you are looking for does not exist. Choose a tool from the homepage.
      </p>
      <Link
        to="/"
        className="inline-flex items-center text-sm text-cyber-blue/80 hover:text-cyber-blue transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to all tools
      </Link>
    </div>
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 px-4 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            {tools.map((tool) => (
              <Route key={tool.id} path={tool.path} element={<ToolPage tool={tool} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
