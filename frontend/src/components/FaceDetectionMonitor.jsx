import React, { useRef, useEffect, useState } from 'react';

const FaceDetectionMonitor = ({ 
  sessionId, 
  onFaceDetected, 
  onSuspiciousActivity,
  isActive = true 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetectionSupported, setFaceDetectionSupported] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    // Check for face detection support
    if ('FaceDetector' in window) {
      setFaceDetectionSupported(true);
    } else {
      console.warn('Face detection not supported in this browser');
      // Fallback to basic monitoring
      setFaceDetectionSupported(false);
    }
  }, []);

  useEffect(() => {
    if (isActive && videoRef.current) {
      startFaceDetection();
    } else {
      stopFaceDetection();
    }

    return () => stopFaceDetection();
  }, [isActive]);

  const startFaceDetection = async () => {
    if (!videoRef.current || isDetecting) return;

    try {
      setIsDetecting(true);

      if (faceDetectionSupported) {
        await startAdvancedDetection();
      } else {
        await startBasicDetection();
      }
    } catch (error) {
      console.error('Error starting face detection:', error);
      setIsDetecting(false);
    }
  };

  const startAdvancedDetection = async () => {
    try {
      const faceDetector = new window.FaceDetector({
        maxDetectedFaces: 5,
        fastMode: false
      });

      const detectFaces = async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) return;

        try {
          const faces = await faceDetector.detect(videoRef.current);
          const detection = {
            detected: faces.length > 0,
            confidence: faces.length > 0 ? faces[0].confidence || 0.8 : 0,
            multipleFaces: faces.length > 1,
            faceBounds: faces.length > 0 ? {
              x: faces[0].boundingBox.x,
              y: faces[0].boundingBox.y,
              width: faces[0].boundingBox.width,
              height: faces[0].boundingBox.height
            } : null
          };

          setLastDetection(detection);
          onFaceDetected?.(detection);

          // Check for suspicious activities
          if (faces.length === 0) {
            onSuspiciousActivity?.('no_face_detected', 'medium', 'No face detected in webcam feed');
          } else if (faces.length > 1) {
            onSuspiciousActivity?.('multiple_faces', 'high', `${faces.length} faces detected in webcam feed`);
          }

          // Draw face bounds on canvas for debugging (if needed)
          if (canvasRef.current) {
            drawFaceBounds(faces);
          }
        } catch (error) {
          console.warn('Face detection error:', error);
        }
      };

      // Run detection every 2 seconds
      detectionIntervalRef.current = setInterval(detectFaces, 2000);
    } catch (error) {
      console.error('Error initializing advanced face detection:', error);
      await startBasicDetection();
    }
  };

  const startBasicDetection = async () => {
    // Basic detection using video analysis
    const detectBasic = () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      // Simple detection based on video activity
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Get image data for basic analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple brightness analysis to detect presence
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const avgBrightness = totalBrightness / (data.length / 4);

      // Basic detection logic
      const detection = {
        detected: avgBrightness > 30, // Assume face present if not too dark
        confidence: Math.min(avgBrightness / 100, 1),
        multipleFaces: false, // Can't detect multiple faces with basic method
        faceBounds: null
      };

      setLastDetection(detection);
      onFaceDetected?.(detection);

      if (!detection.detected) {
        onSuspiciousActivity?.('no_face_detected', 'medium', 'Possible absence detected (basic method)');
      }
    };

    // Run basic detection every 3 seconds
    detectionIntervalRef.current = setInterval(detectBasic, 3000);
  };

  const drawFaceBounds = (faces) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face rectangles
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    faces.forEach((face, index) => {
      const { x, y, width, height } = face.boundingBox;
      ctx.strokeRect(x, y, width, height);
      
      // Add face number
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(`Face ${index + 1}`, x, y - 5);
    });
  };

  const stopFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsDetecting(false);
  };

  return (
    <div className="relative">
      {/* Video element - hidden or small preview */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="hidden" // Hide the video element
      />
      
      {/* Canvas for face detection visualization (optional) */}
      <canvas
        ref={canvasRef}
        className="hidden" // Hide unless needed for debugging
      />

      {/* Detection status indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isDetecting ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600">
            {isDetecting ? 'Monitoring Active' : 'Monitoring Inactive'}
          </span>
        </div>
      )}

      {/* Face detection status */}
      {lastDetection && isActive && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
          <div>Faces: {lastDetection.multipleFaces ? 'Multiple' : lastDetection.detected ? '1' : '0'}</div>
          <div>Confidence: {Math.round(lastDetection.confidence * 100)}%</div>
        </div>
      )}
    </div>
  );
};

export default FaceDetectionMonitor;