// Firebase integration for analytics and storage

import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration - replace with your config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

class FirebaseManager {
  constructor() {
    this.app = null;
    this.analytics = null;
    this.storage = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      // Only initialize if we have valid config
      if (this.isValidConfig()) {
        this.app = initializeApp(firebaseConfig);
        this.analytics = getAnalytics(this.app);
        this.storage = getStorage(this.app);
        this.isInitialized = true;
        
        console.log('Firebase initialized successfully');
        this.logEvent('app_initialized');
      } else {
        console.warn('Firebase config is invalid - running without analytics');
      }
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      this.handleInitializationError(error);
    }
  }

  isValidConfig() {
    // Check if config has been replaced with actual values
    return !firebaseConfig.apiKey.includes('your-api-key');
  }

  handleInitializationError(error) {
    // Graceful fallback when Firebase fails
    this.isInitialized = false;
    
    // You could implement local analytics here
    this.logEvent = (eventName, params) => {
      console.log(`Analytics Event: ${eventName}`, params);
    };
  }

  logEvent(eventName, params = {}) {
    if (!this.isInitialized || !this.analytics) {
      console.log(`Analytics Event: ${eventName}`, params);
      return;
    }

    try {
      logEvent(this.analytics, eventName, {
        timestamp: new Date().toISOString(),
        ...params
      });
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  // Recording events
  logRecordingStarted(settings) {
    this.logEvent('recording_started', {
      video_quality: settings.videoQuality,
      frame_rate: settings.frameRate,
      audio_enabled: settings.audioEnabled,
      countdown_duration: settings.countdown
    });
  }

  logRecordingStopped(duration, fileSize) {
    this.logEvent('recording_stopped', {
      duration_seconds: duration,
      file_size_bytes: fileSize
    });
  }

  logRecordingError(error) {
    this.logEvent('recording_error', {
      error_message: error.message,
      error_type: error.name
    });
  }

  logSettingsChanged(settings) {
    this.logEvent('settings_changed', {
      video_quality: settings.videoQuality,
      frame_rate: settings.frameRate,
      audio_enabled: settings.audioEnabled,
      floating_controls: settings.showFloatingControls
    });
  }

  logVideoDownload(video) {
    this.logEvent('video_downloaded', {
      video_duration: video.duration,
      video_size: video.size
    });
  }

  logVideoShared(video, method) {
    this.logEvent('video_shared', {
      video_duration: video.duration,
      video_size: video.size,
      share_method: method
    });
  }

  // Storage methods for optional cloud storage
  async uploadVideo(videoBlob, metadata) {
    if (!this.isInitialized || !this.storage) {
      throw new Error('Firebase Storage not initialized');
    }

    try {
      const fileName = `recordings/${Date.now()}_${metadata.name.replace(/[^a-z0-9]/gi, '_')}.webm`;
      const storageRef = ref(this.storage, fileName);
      
      await uploadBytes(storageRef, videoBlob);
      const downloadURL = await getDownloadURL(storageRef);
      
      this.logEvent('video_uploaded', {
        file_name: fileName,
        file_size: videoBlob.size
      });
      
      return downloadURL;
    } catch (error) {
      this.logEvent('video_upload_error', {
        error_message: error.message
      });
      throw error;
    }
  }

  // User analytics
  logPageView(page) {
    this.logEvent('page_view', { page });
  }

  logUserInteraction(action, details) {
    this.logEvent('user_interaction', {
      action,
      ...details
    });
  }

  // Performance monitoring
  logPerformance(metric, value) {
    this.logEvent('performance', {
      metric,
      value
    });
  }

  // Error tracking
  logError(error, context) {
    this.logEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context
    });
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      hasAnalytics: !!this.analytics,
      hasStorage: !!this.storage,
      config: this.isValidConfig()
    };
  }
}

// Export singleton instance
export default new FirebaseManager();
