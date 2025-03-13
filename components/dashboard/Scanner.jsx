"use client";
import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Custom CSS for scanner styling with better height control
const scannerStyles = `
  #qr-reader {
    border: none !important;
    padding: 0 !important;
    max-height: 350px !important;
    overflow: hidden !important;
  }
  
  #qr-reader__scan_region {
    background: #f3f4f6 !important;
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  #qr-reader__scan_region img {
    opacity: 0.6;
  }
  
  /* Fix for the height issue */
  #qr-reader video {
    max-height: 300px !important;
    object-fit: cover !important;
  }
  
  #qr-reader__dashboard {
    margin-top: 10px !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
  }
  
  /* Fix camera selection position */
  #qr-reader select {
    max-width: 100% !important;
    margin-bottom: 10px !important;
  }
  
  #qr-reader__dashboard_section_csr button {
    background-color: #3b82f6 !important;
    color: white !important;
    border-radius: 0.375rem !important;
    border: none !important;
    padding: 8px 16px !important;
    cursor: pointer !important;
  }
  
  #qr-reader__dashboard_section_csr span {
    color: #4b5563 !important;
    font-size: 0.875rem !important;
  }
  
  #qr-reader__dashboard_section_swaplink {
    color: #3b82f6 !important;
    font-size: 0.875rem !important;
    text-decoration: none !important;
  }
  
  /* Hide file input completely */
  #qr-reader__filescan_input {
    width: 0.1px !important;
    height: 0.1px !important;
    opacity: 0 !important;
    overflow: hidden !important;
    position: absolute !important;
    z-index: -1 !important;
  }
  
  #qr-reader__filescan_input + label {
    background-color: #3b82f6 !important;
    color: white !important;
    border-radius: 0.375rem !important;
    padding: 8px 16px !important;
    display: inline-block !important;
    cursor: pointer !important;
    margin-top: 8px !important;
  }
  
  /* Dark mode adjustments */
  .dark #qr-reader__scan_region {
    background: #1f2937 !important;
  }
  
  .dark #qr-reader__dashboard_section_csr span {
    color: #d1d5db !important;
  }
  
  .dark #qr-reader__dashboard_section_swaplink {
    color: #60a5fa !important;
  }
`;

// Make containerId unique for each instance
let instanceCounter = 0;

/**
 * Reusable QR Code Scanner component
 */
const Scanner = forwardRef(({ 
  onScan, 
  onError,
  active = true,
  containerId = 'qr-reader',
  config = {}
}, ref) => {
  // Generate a unique ID for this scanner instance
  const uniqueId = useRef(`${containerId}-${++instanceCounter}`);
  
  // Scanner states
  const [isActive, setIsActive] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs
  const scannerRef = useRef(null);
  const styleRef = useRef(null);
  const mountedRef = useRef(false);
  const observerRef = useRef(null);
  
  // Apply styles only once on mount
  useEffect(() => {
    // Mark as mounted
    mountedRef.current = true;
    
    // Add styles if not already present
    if (!document.getElementById('qr-scanner-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'qr-scanner-styles';
      styleElement.textContent = scannerStyles;
      document.head.appendChild(styleElement);
      styleRef.current = styleElement;
    }
    
    // Only initialize if active
    if (active) {
      checkCameraPermission().then(hasPermission => {
        if (hasPermission) {
          initScanner();
        }
      });
    }
    
    // Complete cleanup on unmount
    return () => {
      mountedRef.current = false;
      
      // Disconnect any observers
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      // Full scanner cleanup
      fullCleanup();
    };
  }, []);
  
  // Handle scanner activation changes
  useEffect(() => {
    if (active && !isActive && mountedRef.current) {
      if (!permissionError) {
        initScanner();
      }
    } else if (!active && isActive) {
      cleanupScanner();
    }
  }, [active, isActive, permissionError]);
  
  // Check if camera permissions are granted
  const checkCameraPermission = async () => {
    try {
      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser');
      }

      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      setPermissionError(false);
      setErrorMessage('');
      return true;
    } catch (error) {
      console.error('Camera permission error:', error);
      
      let message = 'Camera access denied. ';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        message += 'Please enable camera permissions in your browser/device settings.';
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          message += ' On iOS, go to Settings > Safari > Camera and select "Allow".';
        } else if (/Android/.test(navigator.userAgent)) {
          message += ' On Android, go to Settings > Apps > Browser > Permissions > Camera.';
        }
      } else if (error.name === 'NotFoundError') {
        message = 'No camera detected on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        message = 'Camera is in use by another application.';
      } else {
        message = `Camera error: ${error.message || 'Unknown error'}`;
      }
      
      setPermissionError(true);
      setErrorMessage(message);
      setHasError(true);
      
      if (onError) {
        onError(error);
      }
      
      return false;
    }
  };

  // Thorough cleanup of all scanner elements
  const fullCleanup = () => {
    // Standard scanner cleanup
    cleanupScanner();
    
    // Find and remove any lingering scanner elements
    document.querySelectorAll('[id^="qr-reader"]').forEach(el => {
      // Only remove if it's not our main container
      if (el.id !== uniqueId.current) {
        el.remove();
      }
    });
    
    // If we have a container, clean it
    const container = document.getElementById(uniqueId.current);
    if (container) {
      container.innerHTML = '';
    }
  };
  
  // Initialize scanner
  const initScanner = async () => {
    // Prevent initialization if already have a scanner or component unmounted
    if (scannerRef.current || !mountedRef.current) {
      return;
    }
    
    // Make sure any previous instances are fully cleaned up first
    fullCleanup();
    
    try {
      // Check camera permission before initializing
      const hasPermission = await checkCameraPermission();
      if (!hasPermission) {
        return;
      }
      
      // Make sure container exists
      const container = document.getElementById(uniqueId.current);
      if (!container) {
        console.error(`Scanner container with id "${uniqueId.current}" not found`);
        setHasError(true);
        return;
      }
      
      // Clear container
      container.innerHTML = '';
      
      // Get stored camera ID if available
      let lastCameraId;
      try {
        lastCameraId = localStorage.getItem('lastUsedCameraId');
      } catch (e) {
        console.warn('Could not access localStorage for camera preferences');
      }
      
      // Scanner configuration with explicit height controls
      const defaultConfig = {
        qrbox: { width: 250, height: 250 },
        fps: 5,
        disableFlip: false,
        rememberLastUsedCamera: true,
        aspectRatio: 1,
        formatsToSupport: [0] 
        // Only support QR codes (format 0)
      };
      
      // Add camera ID if we have one
      if (lastCameraId) {
        defaultConfig.cameraId = lastCameraId;
      } else {
        defaultConfig.videoConstraints = {
          facingMode: "environment"
        };
      }
      
      // Create scanner
      const scanner = new Html5QrcodeScanner(
        uniqueId.current,
        { ...defaultConfig, ...config },
        false // verbose off
      );
      
      // Store the scanner reference
      scannerRef.current = scanner;
      
      // Render with callbacks
      scanner.render(handleScanSuccess, handleScanError);
      setIsActive(true);
      setHasError(false);
      
      // Setup camera selection listener
      setupCameraListener();
    } catch (error) {
      console.error('Scanner initialization error:', error);
      setHasError(true);
      setIsActive(false);
      
      if (onError) {
        onError(error);
      }
    }
  };
  
  // Set up camera listener to save preferences
  const setupCameraListener = () => {
    // Wait for DOM to be updated with camera selection
    setTimeout(() => {
      if (!mountedRef.current) return;
      
      const selectElement = document.querySelector(`#${uniqueId.current} select`);
      if (selectElement) {
        // Save the initially selected camera
        if (selectElement.value) {
          try {
            localStorage.setItem('lastUsedCameraId', selectElement.value);
          } catch (e) {
            console.warn('Unable to save camera preference');
          }
        }
        
        // Listen for changes
        selectElement.addEventListener('change', (e) => {
          try {
            localStorage.setItem('lastUsedCameraId', e.target.value);
          } catch (e) {
            console.warn('Unable to save camera preference');
          }
        });
      }
    }, 1000);
  };
  
  // Clean up scanner
  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.error('Error clearing scanner:', error);
      } finally {
        scannerRef.current = null;
        setIsActive(false);
      }
    }
  };
  
  // Handle successful scan
  const handleScanSuccess = (decodedText, decodedResult) => {
    // Stop scanning to prevent multiple scans
    cleanupScanner();
    
    // Call the provided onScan callback
    if (onScan && mountedRef.current) {
      onScan(decodedText, decodedResult);
    }
  };
  
  // Handle scan errors
  const handleScanError = (error) => {
    // Ignore common non-problematic errors
    if (error && typeof error === 'string' && 
        (error.includes('NotFoundException') || 
         error.includes('No MultiFormat Readers'))) {
      return;
    }
    
    // For real errors, call the provided onError callback
    if (onError && mountedRef.current) {
      onError(error);
    }
  };
  
  // Retry after permission error
  const retryAfterPermissionError = async () => {
    setHasError(false);
    setPermissionError(false);
    setErrorMessage('');
    
    const hasPermission = await checkCameraPermission();
    if (hasPermission) {
      initScanner();
    }
  };
  
  // Public method to restart scanning
  const restart = () => {
    cleanupScanner();
    
    // Only restart if still mounted
    if (mountedRef.current) {
      setTimeout(() => {
        initScanner();
      }, 300);
    }
  };
  
  // Expose methods to parent via ref
  React.useImperativeHandle(ref, () => ({
    restart,
    stop: cleanupScanner,
    isActive: () => isActive,
    hasError: () => hasError,
    retryAfterPermissionError
  }));
  
  // Controlled height container with unique ID
  return (
    <div className="qr-scanner-component">
      <div 
        id={uniqueId.current}
        className="qr-scanner-container relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
        style={{ height: '320px', maxHeight: '350px' }}
      ></div>
      {!isActive && active && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 dark:bg-black/30">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      
      {/* Permission Error UI */}
      {permissionError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Camera Access Required</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{errorMessage}</p>
          <button 
            onClick={retryAfterPermissionError}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry Camera Access
          </button>
        </div>
      )}
    </div>
  );
});

// Add display name
Scanner.displayName = 'Scanner';

export default Scanner;