import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// StrictMode disabled: it double-mounts FaceLivenessDetector and breaks camera + Rekognition stream
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
