// Permissions handling utilities for screen recording

export class PermissionManager {
  constructor() {
    this.permissions = {
      screen: false,
      audio: false,
      notifications: false
    };
    this.checkSupport();
  }

  checkSupport() {
    this.support = {
      screen: 'getDisplayMedia' in navigator.mediaDevices,
      audio: 'getUserMedia' in navigator.mediaDevices,
      notifications: 'Notification' in window,
      mediaRecorder: 'MediaRecorder' in window
    };
  }

  async checkScreenPermission() {
    try {
      // Try to get screen access to check permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      // Immediately stop the stream after checking
      stream.getTracks().forEach(track => track.stop());
      
      this.permissions.screen = true;
      return { granted: true, error: null };
    } catch (error) {
      this.permissions.screen = false;
      return { 
        granted: false, 
        error: this.getPermissionError(error) 
      };
    }
  }

  async checkAudioPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      stream.getTracks().forEach(track => track.stop());
      
      this.permissions.audio = true;
      return { granted: true, error: null };
    } catch (error) {
      this.permissions.audio = false;
      return { 
        granted: false, 
        error: this.getPermissionError(error) 
      };
    }
  }

  async requestNotificationPermission() {
    if (!this.support.notifications) {
      return { 
        granted: false, 
        error: 'Notifications not supported in this browser' 
      };
    }

    const permission = await Notification.requestPermission();
    this.permissions.notifications = permission === 'granted';
    
    return { 
      granted: this.permissions.notifications, 
      error: this.permissions.notifications ? null : 'Notification permission denied'
    };
  }

  getPermissionError(error) {
    if (error.name === 'NotAllowedError') {
      return 'Permission denied by user';
    } else if (error.name === 'NotFoundError') {
      return 'No screen/audio device found';
    } else if (error.name === 'NotReadableError') {
      return 'Device is already in use by another application';
    } else if (error.name === 'OverconstrainedError') {
      return 'Device constraints cannot be satisfied';
    } else if (error.name === 'SecurityError') {
      return 'Security restrictions prevent access';
    } else {
      return `Unknown error: ${error.message}`;
    }
  }

  async requestAllPermissions() {
    const results = {
      screen: await this.checkScreenPermission(),
      audio: await this.checkAudioPermission(),
      notifications: await this.requestNotificationPermission()
    };

    const allGranted = Object.values(results).every(result => result.granted);
    
    return {
      allGranted,
      results,
      summary: this.getPermissionSummary(results)
    };
  }

  getPermissionSummary(results) {
    const issues = [];
    
    if (!results.screen.granted) {
      issues.push('Screen capture permission required');
    }
    
    if (!results.audio.granted) {
      issues.push('Microphone access optional for audio recording');
    }
    
    if (!results.notifications.granted) {
      issues.push('Notifications optional for recording alerts');
    }

    return {
      canRecord: results.screen.granted,
      canRecordWithAudio: results.screen.granted && results.audio.granted,
      issues,
      recommendations: this.getRecommendations(results)
    };
  }

  getRecommendations(results) {
    const recommendations = [];
    
    if (!results.screen.granted) {
      recommendations.push('Grant screen capture permission to start recording');
    }
    
    if (!results.audio.granted) {
      recommendations.push('Enable microphone access for audio recording');
    }
    
    if (!results.notifications.granted) {
      recommendations.push('Allow notifications for recording alerts');
    }

    return recommendations;
  }

  showNotification(title, body, options = {}) {
    if (this.permissions.notifications && this.support.notifications) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        ...options
      });
    }
  }

  getPermissionStatus() {
    return {
      permissions: { ...this.permissions },
      support: { ...this.support },
      canRecord: this.permissions.screen,
      canRecordWithAudio: this.permissions.screen && this.permissions.audio
    };
  }
}

export default PermissionManager;
