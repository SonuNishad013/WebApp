import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, FileText } from 'lucide-react';
import MergePDF from './components/MergePDF';
import SplitPDF from './components/SplitPDF';
import CompressPDF from './components/CompressPDF';
import PDFToWord from './components/PDFToWord';
import PDFToPowerPoint from './components/PDFToPowerPoint';
import PDFToExcel from './components/PDFToExcel';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('merge');

  const tabs = [
    { id: 'merge', label: 'Merge', component: MergePDF },
    { id: 'split', label: 'Split', component: SplitPDF },
    { id: 'compress', label: 'Compress', component: CompressPDF },
    { id: 'pdf-to-word', label: 'PDF → Word', component: PDFToWord },
    { id: 'pdf-to-ppt', label: 'PDF → PPT', component: PDFToPowerPoint },
    { id: 'pdf-to-excel', label: 'PDF → Excel', component: PDFToExcel },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-16 h-16 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-2xl flex items-center justify-center mr-4"
            >
              <Zap className="text-white" size={32} />
            </motion.div>
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
                PDF Converter
              </h1>
              <p className="text-gray-400 text-sm mt-1">Futuristic Document Processing</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-dark-surface p-2 rounded-xl border border-dark-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3 px-4 rounded-lg font-semibold text-xs md:text-sm
                  transition-all duration-300 relative overflow-hidden
                  ${activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-surface/50 backdrop-blur-xl rounded-2xl p-8 border border-dark-border shadow-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {ActiveComponent && <ActiveComponent />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <div className="flex items-center justify-center space-x-2">
            <FileText size={16} />
            <span>Part 1 & 2: PDF Processing & Conversion Services</span>
          </div>
          <p className="mt-2">
            Powered by open-source tools • qpdf • Ghostscript • LibreOffice
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
