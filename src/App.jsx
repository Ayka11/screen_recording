import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FiVideo, 
  FiSettings, 
  FiPlay, 
  FiSquare, 
  FiPause, 
  FiDownload, 
  FiTrash2, 
  FiShare2, 
  FiMaximize2,
  FiMic,
  FiMicOff,
  FiMonitor,
  FiClock,
  FiFilm,
  FiMoreVertical,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { cn, formatDuration, formatFileSize, generateId, getSupportedMimeType } from './lib/utils';
import PermissionManager from './lib/permissions';
import firebaseManager from './lib/firebase';
import errorHandler from './lib/errorHandler';

// Recording State Enum
const RecordingState = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PAUSED: 'paused',
  STOPPED: 'stopped'
};

// Default settings
const defaultSettings = {
  videoQuality: 'high',
  frameRate: 30,
  audioEnabled: true,
  showFloatingControls: true,
  countdown: 3,
  saveLocation: 'downloads',
  recordingMode: 'screen' // 'screen' or 'camera'
};
// Camera permission helper
async function checkCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach(track => track.stop());
    return { granted: true, error: null };
  } catch (error) {
    return { granted: false, error: error.message || 'Camera permission denied' };
  }
}

// Video quality options
const qualityOptions = {
  low: { width: 1280, height: 720, bitrate: 2500000 },
  medium: { width: 1920, height: 1080, bitrate: 5000000 },
  high: { width: 2560, height: 1440, bitrate: 8000000 },
  ultra: { width: 3840, height: 2160, bitrate: 16000000 }
};

function App() {
  // Core recording states
  const [recordingState, setRecordingState] = useState(RecordingState.IDLE);
  const [recordedVideos, setRecordedVideos] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('recorder');
  const [showSettings, setShowSettings] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isFloatingMinimized, setIsFloatingMinimized] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  
  // Initialize managers
  const [permissionManager] = useState(() => new PermissionManager());
  
  // Recording refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const floatingControlsRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [floatingPosition, setFloatingPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  // Initialize app and check permissions on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Load saved data
        const saved = localStorage.getItem('screenRecorderVideos');
        if (saved) {
          try {
            setRecordedVideos(JSON.parse(saved));
          } catch (e) {
            errorHandler.handleValidationError(e, { action: 'load_videos' });
          }
        }
        
        const savedSettings = localStorage.getItem('screenRecorderSettings');
        if (savedSettings) {
          try {
            setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
          } catch (e) {
            errorHandler.handleValidationError(e, { action: 'load_settings' });
          }
        }

        // Check permissions
        const status = permissionManager.getPermissionStatus();
        setPermissionStatus(status);
        
        // Log page view
        firebaseManager.logPageView('main');
        
      } catch (error) {
        errorHandler.handleError(error, { action: 'app_initialization' }, errorHandler.Severity.HIGH);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [permissionManager]);

  // Save videos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('screenRecorderVideos', JSON.stringify(recordedVideos));
  }, [recordedVideos]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('screenRecorderSettings', JSON.stringify(settings));
  }, [settings]);

  // Timer effect
  useEffect(() => {
    if (recordingState === RecordingState.RECORDING) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recordingState]);

  // Start recording with improved permissions and error handling
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (settings.recordingMode === 'camera') {
        // Camera recording mode
        const cameraPerm = await checkCameraPermission();
        if (!cameraPerm.granted) {
          setError(cameraPerm.error || 'Camera permission is required to start recording');
          setShowPermissionsModal(true);
          return;
        }

        setCountdown(settings.countdown);
        for (let i = settings.countdown; i > 0; i--) {
          setCountdown(i);
          await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown(0);

        // Get camera stream
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: qualityOptions[settings.videoQuality].width },
            height: { ideal: qualityOptions[settings.videoQuality].height },
            frameRate: { ideal: settings.frameRate }
          },
          audio: settings.audioEnabled
        });
        setCameraStream(cameraStream);
        streamRef.current = cameraStream;

        // Setup MediaRecorder
        const mimeType = getSupportedMimeType();
        const mediaRecorder = new MediaRecorder(cameraStream, {
          mimeType,
          videoBitsPerSecond: qualityOptions[settings.videoQuality].bitrate
        });
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        mediaRecorder.onerror = (event) => {
          const error = new Error(`MediaRecorder error: ${event.error?.message || 'Unknown recording error'}`);
          errorHandler.handleRecordingError(error, { event });
          setError(error.message);
          stopRecording();
        };
        mediaRecorder.onstop = () => {
          try {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const newVideo = {
              id: generateId(),
              url,
              blob,
              name: `Camera Recording ${new Date().toLocaleString()}`,
              duration: recordingTime,
              size: blob.size,
              date: new Date().toISOString(),
              mimeType,
              settings: { ...settings }
            };
            setRecordedVideos(prev => [newVideo, ...prev]);
            setRecordingTime(0);
            firebaseManager.logRecordingStopped(recordingTime, blob.size);
            permissionManager.showNotification(
              'Camera Recording Completed',
              `Duration: ${formatDuration(recordingTime)}`
            );
          } catch (error) {
            errorHandler.handleRecordingError(error, { action: 'process_camera_recording' });
          } finally {
            // Stop all tracks
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
            streamRef.current = null;
          }
        };
        mediaRecorder.start(1000);
        setRecordingState(RecordingState.RECORDING);
        firebaseManager.logRecordingStarted(settings);
        firebaseManager.logUserInteraction('start_camera_recording', { settings });
        // Handle stream end
        cameraStream.getVideoTracks()[0].onended = () => {
          stopRecording();
        };
        return;
      }

      // Screen recording mode (default)
      const permissionResults = await permissionManager.requestAllPermissions();
      if (!permissionResults.results.screen.granted) {
        const error = new Error('Screen capture permission is required to start recording');
        errorHandler.handlePermissionError(error, { permissionResults });
        setError(permissionResults.results.screen.error);
        setShowPermissionsModal(true);
        return;
      }
      setCountdown(settings.countdown);
      for (let i = settings.countdown; i > 0; i--) {
        setCountdown(i);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(0);
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: qualityOptions[settings.videoQuality].width },
          height: { ideal: qualityOptions[settings.videoQuality].height },
          frameRate: { ideal: settings.frameRate }
        },
        audio: settings.audioEnabled
      });
      let combinedStream = displayStream;
      if (settings.audioEnabled && permissionResults.results.audio.granted) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          });
          const tracks = [...displayStream.getTracks(), ...audioStream.getTracks()];
          combinedStream = new MediaStream(tracks);
        } catch (audioErr) {
          console.warn('Audio capture failed, continuing with screen only:', audioErr);
          errorHandler.handleRecordingError(audioErr, { type: 'audio_capture' });
        }
      }
      streamRef.current = combinedStream;
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: qualityOptions[settings.videoQuality].bitrate
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event.error?.message || 'Unknown recording error'}`);
        errorHandler.handleRecordingError(error, { event });
        setError(error.message);
        stopRecording();
      };
      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const newVideo = {
            id: generateId(),
            url,
            blob,
            name: `Recording ${new Date().toLocaleString()}`,
            duration: recordingTime,
            size: blob.size,
            date: new Date().toISOString(),
            mimeType,
            settings: { ...settings }
          };
          setRecordedVideos(prev => [newVideo, ...prev]);
          setRecordingTime(0);
          firebaseManager.logRecordingStopped(recordingTime, blob.size);
          permissionManager.showNotification(
            'Recording Completed',
            `Duration: ${formatDuration(recordingTime)}`
          );
        } catch (error) {
          errorHandler.handleRecordingError(error, { action: 'process_recording' });
        } finally {
          combinedStream.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      mediaRecorder.start(1000);
      setRecordingState(RecordingState.RECORDING);
      firebaseManager.logRecordingStarted(settings);
      firebaseManager.logUserInteraction('start_recording', { settings });
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (err) {
      console.error('Failed to start recording:', err);
      const errorInfo = errorHandler.handleRecordingError(err, { 
        settings, 
        permissionStatus: permissionManager.getPermissionStatus() 
      });
      setError(err.message || 'Failed to start recording');
      setRecordingState(RecordingState.IDLE);
      setCountdown(0);
    } finally {
      setIsLoading(false);
    }
  }, [settings, recordingTime, permissionManager]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === RecordingState.RECORDING) {
      mediaRecorderRef.current.stop();
      setRecordingState(RecordingState.IDLE);
    }
  }, [recordingState]);

  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    
    if (recordingState === RecordingState.RECORDING) {
      mediaRecorderRef.current.pause();
      setRecordingState(RecordingState.PAUSED);
    } else if (recordingState === RecordingState.PAUSED) {
      mediaRecorderRef.current.resume();
      setRecordingState(RecordingState.RECORDING);
    }
  }, [recordingState]);

  // Delete video
  const deleteVideo = useCallback((id) => {
    setRecordedVideos(prev => {
      const video = prev.find(v => v.id === id);
      if (video) {
        URL.revokeObjectURL(video.url);
      }
      return prev.filter(v => v.id !== id);
    });
  }, []);

  // Download video with error handling and analytics
  const downloadVideo = useCallback((video) => {
    try {
      const a = document.createElement('a');
      a.href = video.url;
      a.download = `${video.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Log download
      firebaseManager.logVideoDownload(video);
      firebaseManager.logUserInteraction('download_video', { videoId: video.id });
      
      // Show notification
      permissionManager.showNotification(
        'Download Started',
        `${video.name} is being downloaded`
      );
      
    } catch (error) {
      errorHandler.handleError(error, { action: 'download_video', videoId: video.id });
      setError('Failed to download video');
    }
  }, []);

  // Share video with improved error handling and Firebase integration
  const shareVideo = useCallback(async (video) => {
    try {
      if (navigator.share) {
        const file = new File([video.blob], `${video.name}.webm`, { type: video.mimeType });
        await navigator.share({
          files: [file],
          title: video.name,
          text: `Check out this screen recording: ${formatDuration(video.duration)}`
        });
        
        // Log successful share
        firebaseManager.logVideoShared(video, 'native_share');
        firebaseManager.logUserInteraction('share_video', { 
          method: 'native_share', 
          videoId: video.id 
        });
        
      } else {
        // Fallback: try Firebase upload or download
        try {
          const downloadURL = await firebaseManager.uploadVideo(video.blob, {
            name: video.name,
            duration: video.duration,
            size: video.size
          });
          
          // Copy to clipboard
          await navigator.clipboard.writeText(downloadURL);
          
          firebaseManager.logVideoShared(video, 'firebase_link');
          firebaseManager.logUserInteraction('share_video', { 
            method: 'firebase_link', 
            videoId: video.id 
          });
          
          permissionManager.showNotification(
            'Link Copied',
            'Video link copied to clipboard'
          );
          
        } catch (uploadError) {
          // Final fallback: download
          downloadVideo(video);
          firebaseManager.logVideoShared(video, 'download_fallback');
        }
      }
    } catch (error) {
      errorHandler.handleError(error, { action: 'share_video', videoId: video.id });
      
      // Final fallback
      downloadVideo(video);
    }
  }, [downloadVideo]);

  // Drag handlers for floating controls
  const handleDragStart = (e) => {
    const rect = floatingControlsRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setIsDragging(true);
    }
  };

  const handleDragMove = useCallback((e) => {
    if (isDragging) {
      setFloatingPosition({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y
      });
    }
  }, [isDragging]);

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove]);

  // Handle settings changes with analytics
  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
    firebaseManager.logSettingsChanged(newSettings);
    firebaseManager.logUserInteraction('settings_changed', { newSettings });
  }, []);

  // Check permissions on demand
  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await permissionManager.requestAllPermissions();
      setPermissionStatus(permissionManager.getPermissionStatus());
      
      if (!results.allGranted) {
        setShowPermissionsModal(true);
      }
      
      return results;
    } catch (error) {
      errorHandler.handlePermissionError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [permissionManager]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <FiVideo className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Screen Recorder Pro</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('recorder')}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  activeTab === 'recorder' 
                    ? "bg-primary text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <FiMonitor className="w-4 h-4 inline mr-2" />
                Recorder
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  activeTab === 'gallery' 
                    ? "bg-primary text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <FiFilm className="w-4 h-4 inline mr-2" />
                Gallery ({recordedVideos.length})
              </button>
              {/* Permission Status Indicator */}
              <button
                onClick={checkPermissions}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  permissionStatus?.canRecord 
                    ? "text-green-600 hover:bg-green-50" 
                    : "text-yellow-600 hover:bg-yellow-50"
                )}
                title={permissionStatus?.canRecord ? "Permissions OK" : "Check Permissions"}
              >
                {permissionStatus?.canRecord ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  <FiAlertCircle className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FiSettings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'recorder' ? (
          <div className="space-y-6">
            {/* Recorder Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {settings.recordingMode === 'camera' ? 'Camera Recording' : 'Screen Recording'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {settings.recordingMode === 'camera'
                    ? 'Record from your webcam with audio. Choose your settings and click start to begin camera recording.'
                    : 'Record your screen with audio. Choose your settings and click start to begin recording.'}
                </p>

                {/* Mode Toggle */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button
                    onClick={() => setSettings(s => ({ ...s, recordingMode: 'screen' }))}
                    className={cn(
                      'px-4 py-2 rounded-lg font-medium transition-colors',
                      settings.recordingMode === 'screen'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <FiMonitor className="w-4 h-4 inline mr-2" />
                    Screen
                  </button>
                  <button
                    onClick={() => setSettings(s => ({ ...s, recordingMode: 'camera' }))}
                    className={cn(
                      'px-4 py-2 rounded-lg font-medium transition-colors',
                      settings.recordingMode === 'camera'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <FiVideo className="w-4 h-4 inline mr-2" />
                    Camera
                  </button>
                </div>

                {/* Camera Preview */}
                {settings.recordingMode === 'camera' && cameraStream && (
                  <div className="flex justify-center mb-4">
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      muted
                      playsInline
                      style={{ width: 320, height: 180, borderRadius: 12, background: '#222' }}
                      onLoadedMetadata={e => {
                        if (videoPreviewRef.current) {
                          videoPreviewRef.current.srcObject = cameraStream;
                        }
                      }}
                    />
                  </div>
                )}

                {/* Recording Controls */}
                <div className="flex items-center justify-center gap-4">
                  {recordingState === RecordingState.IDLE ? (
                    <button
                      onClick={startRecording}
                      className="group relative flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                      Start Recording
                      {settings.countdown > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                          {settings.countdown}s countdown
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      {/* Recording Indicator */}
                      <div className="flex items-center gap-3 bg-red-50 px-6 py-3 rounded-full">
                        <div className="w-4 h-4 bg-red-500 rounded-full recording-pulse" />
                        <span className="text-red-600 font-mono font-bold text-xl">
                          {formatDuration(recordingTime)}
                        </span>
                      </div>

                      {/* Pause/Resume */}
                      <button
                        onClick={togglePause}
                        className="p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-all"
                      >
                        {recordingState === RecordingState.RECORDING ? (
                          <FiPause className="w-6 h-6" />
                        ) : (
                          <FiPlay className="w-6 h-6" />
                        )}
                      </button>

                      {/* Stop */}
                      <button
                        onClick={stopRecording}
                        className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"
                      >
                        <FiSquare className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Countdown Overlay */}
                {countdown > 0 && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="text-8xl font-bold text-white animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                    <FiAlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button 
                      onClick={() => setError(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Settings Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <FiMonitor className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Video Quality</p>
                    <p className="font-medium capitalize">{settings.videoQuality}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  {settings.audioEnabled ? (
                    <FiMic className="w-5 h-5 text-green-500" />
                  ) : (
                    <FiMicOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Audio</p>
                    <p className="font-medium">{settings.audioEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <FiClock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Frame Rate</p>
                    <p className="font-medium">{settings.frameRate} FPS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Gallery Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Recorded Videos</h2>
              <span className="text-gray-500">{recordedVideos.length} videos</span>
            </div>

            {recordedVideos.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <FiFilm className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings yet</h3>
                <p className="text-gray-500">Start recording to see your videos here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recordedVideos.map((video) => (
                  <div key={video.id} className="video-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="relative aspect-video bg-gray-900">
                      <video
                        src={video.url}
                        className="w-full h-full object-contain"
                        controls
                        preload="metadata"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate" title={video.name}>
                        {video.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {formatDuration(video.duration)}
                        </span>
                        <span>{formatFileSize(video.size)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => downloadVideo(video)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                        >
                          <FiDownload className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => shareVideo(video)}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <FiShare2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Controls */}
      {recordingState !== RecordingState.IDLE && settings.showFloatingControls && (
        <div
          ref={floatingControlsRef}
          className="fixed z-40 floating-controls rounded-2xl shadow-2xl overflow-hidden select-none"
          style={{ 
            left: floatingPosition.x, 
            top: floatingPosition.y,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleDragStart}
        >
          <div className="bg-white/95 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full recording-pulse" />
                <span className="text-sm font-mono font-bold text-gray-700">
                  {formatDuration(recordingTime)}
                </span>
              </div>
              <button
                onClick={() => setIsFloatingMinimized(!isFloatingMinimized)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isFloatingMinimized ? (
                  <FiChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <FiChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>

            {/* Controls */}
            {!isFloatingMinimized && (
              <div className="flex items-center justify-center gap-2 p-3">
                <button
                  onClick={togglePause}
                  className={cn(
                    "p-3 rounded-full transition-all",
                    recordingState === RecordingState.PAUSED
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-yellow-500 text-white hover:bg-yellow-600"
                  )}
                >
                  {recordingState === RecordingState.PAUSED ? (
                    <FiPlay className="w-5 h-5" />
                  ) : (
                    <FiPause className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={stopRecording}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                >
                  <FiSquare className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Video Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Quality
                </label>
                <select
                  value={settings.videoQuality}
                  onChange={(e) => handleSettingsChange({ ...settings, videoQuality: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="low">720p (HD)</option>
                  <option value="medium">1080p (Full HD)</option>
                  <option value="high">1440p (2K)</option>
                  <option value="ultra">2160p (4K)</option>
                </select>
              </div>

              {/* Frame Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Rate: {settings.frameRate} FPS
                </label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={settings.frameRate}
                  onChange={(e) => handleSettingsChange({ ...settings, frameRate: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15 FPS</span>
                  <span>60 FPS</span>
                </div>
              </div>

              {/* Audio Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Record Audio
                  </label>
                  <p className="text-xs text-gray-500">Capture microphone audio</p>
                </div>
                <button
                  onClick={() => handleSettingsChange({ ...settings, audioEnabled: !settings.audioEnabled })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.audioEnabled ? "bg-primary" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      settings.audioEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Floating Controls */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Floating Controls
                  </label>
                  <p className="text-xs text-gray-500">Show overlay controls during recording</p>
                </div>
                <button
                  onClick={() => handleSettingsChange({ ...settings, showFloatingControls: !settings.showFloatingControls })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.showFloatingControls ? "bg-primary" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      settings.showFloatingControls ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Countdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Countdown: {settings.countdown} seconds
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={settings.countdown}
                  onChange={(e) => handleSettingsChange({ ...settings, countdown: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleSettingsChange(defaultSettings)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Reset
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Permissions Required</h2>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <FiAlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {settings.recordingMode === 'camera' ? 'Camera Recording Permissions' : 'Screen Recording Permissions'}
                </h3>
                <p className="text-gray-600">
                  {settings.recordingMode === 'camera'
                    ? 'This app needs permissions to record from your camera and optionally capture audio.'
                    : 'This app needs permissions to record your screen and optionally capture audio.'}
                </p>
              </div>
              <div className="space-y-3">
                {settings.recordingMode === 'camera' ? (
                  <>
                    {/* Camera Permission */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FiVideo className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Camera</p>
                          <p className="text-sm text-gray-500">Required for camera recording</p>
                        </div>
                      </div>
                      {/* No persistent camera permission state, so always show yellow */}
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    </div>
                    {/* Audio Permission */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FiMic className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Microphone</p>
                          <p className="text-sm text-gray-500">Optional for audio</p>
                        </div>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Screen Permission */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FiMonitor className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Screen Capture</p>
                          <p className="text-sm text-gray-500">Required for recording</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        permissionStatus?.permissions.screen 
                          ? "bg-green-500" 
                          : "bg-red-500"
                      )} />
                    </div>
                    {/* Audio Permission */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FiMic className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Microphone</p>
                          <p className="text-sm text-gray-500">Optional for audio</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        permissionStatus?.permissions.audio 
                          ? "bg-green-500" 
                          : "bg-yellow-500"
                      )} />
                    </div>
                    {/* Notifications Permission */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FiInfo className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Notifications</p>
                          <p className="text-sm text-gray-500">Optional for alerts</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        permissionStatus?.permissions.notifications 
                          ? "bg-green-500" 
                          : "bg-gray-300"
                      )} />
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={checkPermissions}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Checking...' : 'Request Permissions'}
                </button>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
