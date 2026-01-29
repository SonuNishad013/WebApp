#!/bin/bash

echo "=========================================="
echo "PDF Conversion App - Setup Script"
echo "=========================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed. Please install it first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "✓ Homebrew found"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it:"
    echo "   brew install node"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo "✓ npm found: $(npm --version)"

# Install conversion tools
echo ""
echo "Installing conversion tools..."
echo ""

# qpdf for merge and split
if ! command -v qpdf &> /dev/null; then
    echo "Installing qpdf..."
    brew install qpdf
else
    echo "✓ qpdf already installed"
fi

# Ghostscript for compression
if ! command -v gs &> /dev/null; then
    echo "Installing ghostscript..."
    brew install ghostscript
else
    echo "✓ ghostscript already installed"
fi

# LibreOffice (for future parts)
if [ ! -d "/Applications/LibreOffice.app" ]; then
    echo "LibreOffice not found. Install for Part 2+ features:"
    echo "   brew install --cask libreoffice"
else
    echo "✓ LibreOffice already installed"
fi

# Poppler (for future parts)
if ! command -v pdftoppm &> /dev/null; then
    echo "Poppler not found. Install for Part 4+ features:"
    echo "   brew install poppler"
else
    echo "✓ poppler already installed"
fi

# ImageMagick (for future parts)
if ! command -v magick &> /dev/null; then
    echo "ImageMagick not found. Install for Part 4+ features:"
    echo "   brew install imagemagick"
else
    echo "✓ imagemagick already installed"
fi

# Tesseract (for future parts)
if ! command -v tesseract &> /dev/null; then
    echo "Tesseract not found. Install for Part 2+ OCR features:"
    echo "   brew install tesseract"
else
    echo "✓ tesseract already installed"
fi

echo ""
echo "=========================================="
echo "Installing Backend Dependencies..."
echo "=========================================="
cd backend
if [ -f "package.json" ]; then
    npm install
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "✓ Created .env file from .env.example"
    fi
    echo "✓ Backend dependencies installed"
else
    echo "❌ backend/package.json not found"
fi
cd ..

echo ""
echo "=========================================="
echo "Installing Frontend Dependencies..."
echo "=========================================="
cd frontend
if [ -f "package.json" ]; then
    npm install
    echo "✓ Frontend dependencies installed"
else
    echo "❌ frontend/package.json not found"
fi
cd ..

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
