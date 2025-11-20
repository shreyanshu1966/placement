import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Proctoring API service
export class ProctoringService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.mediaRecorder = null;
    this.screenRecorder = null;
    this.audioRecorder = null;
    this.recordingChunks = {
      webcam: [],
      screen: [],
      audio: []
    };
  }

  // Initialize proctored session
  async initializeSession(assignmentId, studentId, config = {}) {
    try {
      const browserInfo = {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform
      };

      const deviceInfo = await this.getDeviceInfo();

      const response = await this.api.post('/proctoring/sessions/initialize', {
        assignmentId,
        studentId,
        proctorConfig: config,
        browserInfo,
        deviceInfo
      });

      return response.data;
    } catch (error) {
      console.error('Error initializing proctored session:', error);
      throw error;
    }
  }

  // Get device information
  async getDeviceInfo() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput').length;
      const microphones = devices.filter(device => device.kind === 'audioinput').length;
      const speakers = devices.filter(device => device.kind === 'audiooutput').length;

      return {
        type: this.detectDeviceType(),
        cameras,
        microphones,
        speakers
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return { type: 'unknown', cameras: 0, microphones: 0, speakers: 0 };
    }
  }

  // Detect device type
  detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad/.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Check system requirements
  async checkSystemRequirements() {
    const requirements = {
      camera: false,
      microphone: false,
      screen: false,
      browser: false
    };

    try {
      // Check camera access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        requirements.camera = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.warn('Camera access denied:', error);
      }

      // Check microphone access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        requirements.microphone = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.warn('Microphone access denied:', error);
      }

      // Check screen sharing capability
      try {
        if (navigator.mediaDevices.getDisplayMedia) {
          requirements.screen = true;
        }
      } catch (error) {
        console.warn('Screen sharing not supported:', error);
      }

      // Check browser compatibility
      requirements.browser = this.isBrowserSupported();

      return requirements;
    } catch (error) {
      console.error('Error checking system requirements:', error);
      return requirements;
    }
  }

  // Check browser support
  isBrowserSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      navigator.mediaDevices.getDisplayMedia &&
      window.MediaRecorder
    );
  }

  // Start webcam recording
  async startWebcamRecording(sessionId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: true 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.recordingChunks.webcam = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.webcam.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.uploadRecordingChunk(sessionId, 'webcam');
      };

      this.mediaRecorder.start(10000); // Record in 10-second chunks
      return stream;
    } catch (error) {
      console.error('Error starting webcam recording:', error);
      throw error;
    }
  }

  // Start screen recording
  async startScreenRecording(sessionId) {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { mediaSource: 'screen' },
        audio: true 
      });

      this.screenRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.recordingChunks.screen = [];

      this.screenRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.screen.push(event.data);
        }
      };

      this.screenRecorder.onstop = () => {
        this.uploadRecordingChunk(sessionId, 'screen');
      };

      this.screenRecorder.start(10000); // Record in 10-second chunks
      return stream;
    } catch (error) {
      console.error('Error starting screen recording:', error);
      throw error;
    }
  }

  // Upload recording chunk
  async uploadRecordingChunk(sessionId, type) {
    try {
      if (this.recordingChunks[type].length === 0) return;

      const blob = new Blob(this.recordingChunks[type], { type: 'video/webm' });
      const formData = new FormData();
      formData.append(type, blob, `${type}_${Date.now()}.webm`);
      formData.append('sessionId', sessionId);
      formData.append('recordingType', type);
      formData.append('duration', blob.size); // Approximate duration

      await this.api.post(`/proctoring/sessions/${sessionId}/upload-recording`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Clear chunks after upload
      this.recordingChunks[type] = [];
    } catch (error) {
      console.error(`Error uploading ${type} recording:`, error);
    }
  }

  // Stop all recordings
  stopAllRecordings() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    if (this.screenRecorder && this.screenRecorder.state === 'recording') {
      this.screenRecorder.stop();
      this.screenRecorder.stream.getTracks().forEach(track => track.stop());
    }

    if (this.audioRecorder && this.audioRecorder.state === 'recording') {
      this.audioRecorder.stop();
    }
  }

  // Record suspicious activity
  async recordSuspiciousActivity(sessionId, type, severity = 'medium', details = '') {
    try {
      const response = await this.api.post(`/proctoring/sessions/${sessionId}/suspicious-activity`, {
        type,
        severity,
        details
      });

      return response.data;
    } catch (error) {
      console.error('Error recording suspicious activity:', error);
      throw error;
    }
  }

  // Record biometric data
  async recordBiometricData(sessionId, data) {
    try {
      await this.api.post(`/proctoring/sessions/${sessionId}/biometric-data`, data);
    } catch (error) {
      console.error('Error recording biometric data:', error);
    }
  }

  // Record screen activity
  async recordScreenActivity(sessionId, action, details = '', duration = 0) {
    try {
      await this.api.post(`/proctoring/sessions/${sessionId}/screen-activity`, {
        action,
        details,
        duration
      });
    } catch (error) {
      console.error('Error recording screen activity:', error);
    }
  }

  // Start proctored session
  async startSession(sessionId, systemCheck) {
    try {
      const response = await this.api.put(`/proctoring/sessions/${sessionId}/start`, {
        systemCheck
      });

      return response.data;
    } catch (error) {
      console.error('Error starting proctored session:', error);
      throw error;
    }
  }

  // End proctored session
  async endSession(sessionId, reason = 'completed') {
    try {
      this.stopAllRecordings();
      
      const response = await this.api.put(`/proctoring/sessions/${sessionId}/end`, {
        reason
      });

      return response.data;
    } catch (error) {
      console.error('Error ending proctored session:', error);
      throw error;
    }
  }

  // Get session details
  async getSessionDetails(sessionId) {
    try {
      const response = await this.api.get(`/proctoring/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session details:', error);
      throw error;
    }
  }

  // Faculty: Get all sessions for assignment
  async getAssignmentSessions(assignmentId, filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await this.api.get(`/proctoring/assignments/${assignmentId}/sessions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment sessions:', error);
      throw error;
    }
  }

  // Faculty: Get live monitoring data
  async getLiveMonitoring(assignmentId = null) {
    try {
      const params = assignmentId ? `?assignmentId=${assignmentId}` : '';
      const response = await this.api.get(`/proctoring/sessions/live/monitoring${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching live monitoring data:', error);
      throw error;
    }
  }

  // Submit proctor review
  async submitReview(sessionId, review) {
    try {
      const response = await this.api.post(`/proctoring/sessions/${sessionId}/review`, review);
      return response.data;
    } catch (error) {
      console.error('Error submitting proctor review:', error);
      throw error;
    }
  }

  // Get analytics summary
  async getAnalyticsSummary(assignmentId = null, timeframe = '7d') {
    try {
      const params = new URLSearchParams({ timeframe });
      if (assignmentId) params.append('assignmentId', assignmentId);
      
      const response = await this.api.get(`/proctoring/analytics/summary?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const proctoringService = new ProctoringService();