# PDF Conversion Frontend

Futuristic React frontend for PDF & Office document conversion.

## Part 1 Features

- **Merge PDF** - Combine multiple PDF files
- **Split PDF** - Extract pages or ranges
- **Compress PDF** - Reduce file size with quality presets

## Tech Stack

- **React 18** with Hooks
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Dropzone** for file uploads
- **Axios** for API calls

## Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Development mode:
```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## Design Features

### Futuristic UI
- Dark mode first design
- Neon accent colors (cyan, purple, pink)
- Glassmorphism effects
- Smooth animations and transitions
- Gradient backgrounds
- Glow effects on hover

### User Experience
- Drag & drop file upload
- Real-time progress indicators
- Animated file lists
- Success/error feedback
- Responsive design
- Keyboard accessible

### Performance
- No page reloads
- Async file operations
- Progress tracking
- Optimized animations
- Lazy component loading

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx       # Drag & drop file upload
│   │   ├── MergePDF.jsx         # PDF merging interface
│   │   ├── SplitPDF.jsx         # PDF splitting interface
│   │   └── CompressPDF.jsx      # PDF compression interface
│   ├── services/
│   │   └── api.js               # API client
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # App entry point
│   └── index.css                # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The frontend connects to the backend API running on `http://localhost:5000`.

API endpoints are proxied through Vite config for development.

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  'cyber-blue': '#00f0ff',
  'cyber-purple': '#b000ff',
  'cyber-pink': '#ff006e',
  // ... add your colors
}
```

### Animations
Modify animations in `tailwind.config.js` under `extend.animation` and `extend.keyframes`.

### File Size Limits
Update `maxSize` prop in FileUpload components (default: 10MB).

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Next Steps

Part 2 will add:
- PDF to Word converter
- PDF to PowerPoint converter
- PDF to Excel converter
