// Comprehensive error handling system

export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.errorCallbacks = [];
  }

  // Error types
  static ErrorTypes = {
    PERMISSION: 'permission',
    RECORDING: 'recording',
    STORAGE: 'storage',
    NETWORK: 'network',
    VALIDATION: 'validation',
    SYSTEM: 'system',
    USER: 'user'
  };

  // Error severity levels
  static Severity = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  handleError(error, context = {}, severity = ErrorHandler.Severity.MEDIUM) {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: this.getErrorType(error),
      severity,
      message: error.message || 'Unknown error',
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Add to error log
    this.errors.unshift(errorInfo);
    
    // Limit error log size
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console
    this.logError(errorInfo);

    // Notify callbacks
    this.notifyCallbacks(errorInfo);

    // Show user notification if critical
    if (severity === ErrorHandler.Severity.CRITICAL) {
      this.showCriticalErrorNotification(errorInfo);
    }

    return errorInfo;
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getErrorType(error) {
    if (error.name?.includes('Permission') || error.message?.includes('permission')) {
      return ErrorHandler.ErrorTypes.PERMISSION;
    } else if (error.name?.includes('MediaRecorder') || error.message?.includes('recording')) {
      return ErrorHandler.ErrorTypes.RECORDING;
    } else if (error.name?.includes('Storage') || error.message?.includes('storage')) {
      return ErrorHandler.ErrorTypes.STORAGE;
    } else if (error.name?.includes('Network') || error.message?.includes('network')) {
      return ErrorHandler.ErrorTypes.NETWORK;
    } else if (error.name?.includes('ValidationError')) {
      return ErrorHandler.ErrorTypes.VALIDATION;
    } else if (error.name?.includes('SystemError')) {
      return ErrorHandler.ErrorTypes.SYSTEM;
    } else {
      return ErrorHandler.ErrorTypes.USER;
    }
  }

  logError(errorInfo) {
    const logMethod = this.getLogMethod(errorInfo.severity);
    
    logMethod(`[${errorInfo.type.toUpperCase()}] ${errorInfo.message}`, {
      id: errorInfo.id,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp
    });
  }

  getLogMethod(severity) {
    switch (severity) {
      case ErrorHandler.Severity.CRITICAL:
        return console.error;
      case ErrorHandler.Severity.HIGH:
        return console.error;
      case ErrorHandler.Severity.MEDIUM:
        return console.warn;
      case ErrorHandler.Severity.LOW:
        return console.info;
      default:
        return console.log;
    }
  }

  notifyCallbacks(errorInfo) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  showCriticalErrorNotification(errorInfo) {
    // Create a user-friendly notification for critical errors
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="font-semibold">Critical Error</h4>
          <p class="text-sm mt-1">${this.getUserFriendlyMessage(errorInfo)}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  getUserFriendlyMessage(errorInfo) {
    const messages = {
      [ErrorHandler.ErrorTypes.PERMISSION]: 'Permission required. Please check your browser settings.',
      [ErrorHandler.ErrorTypes.RECORDING]: 'Recording failed. Please try again.',
      [ErrorHandler.ErrorTypes.STORAGE]: 'Storage error. Your data may not be saved.',
      [ErrorHandler.ErrorTypes.NETWORK]: 'Network error. Please check your connection.',
      [ErrorHandler.ErrorTypes.VALIDATION]: 'Invalid input. Please check your settings.',
      [ErrorHandler.ErrorTypes.SYSTEM]: 'System error. Please refresh the page.',
      [ErrorHandler.ErrorTypes.USER]: 'Something went wrong. Please try again.'
    };

    return messages[errorInfo.type] || 'An unexpected error occurred.';
  }

  // Specific error handlers
  handlePermissionError(error, context = {}) {
    return this.handleError(error, context, ErrorHandler.Severity.HIGH);
  }

  handleRecordingError(error, context = {}) {
    return this.handleError(error, context, ErrorHandler.Severity.HIGH);
  }

  handleStorageError(error, context = {}) {
    return this.handleError(error, context, ErrorHandler.Severity.MEDIUM);
  }

  handleNetworkError(error, context = {}) {
    return this.handleError(error, context, ErrorHandler.Severity.MEDIUM);
  }

  handleValidationError(error, context = {}) {
    return this.handleError(error, context, ErrorHandler.Severity.LOW);
  }

  // Callback management
  onError(callback) {
    this.errorCallbacks.push(callback);
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  // Error retrieval and management
  getErrors(type = null, severity = null) {
    let filtered = this.errors;
    
    if (type) {
      filtered = filtered.filter(error => error.type === type);
    }
    
    if (severity) {
      filtered = filtered.filter(error => error.severity === severity);
    }
    
    return filtered;
  }

  getErrorById(id) {
    return this.errors.find(error => error.id === id);
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      bySeverity: {},
      recent: this.errors.slice(0, 10)
    };

    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  // Recovery suggestions
  getRecoverySuggestions(errorInfo) {
    const suggestions = {
      [ErrorHandler.ErrorTypes.PERMISSION]: [
        'Check browser permissions',
        'Restart the browser',
        'Try a different browser'
      ],
      [ErrorHandler.ErrorTypes.RECORDING]: [
        'Check screen sharing settings',
        'Close other recording applications',
        'Restart the application'
      ],
      [ErrorHandler.ErrorTypes.STORAGE]: [
        'Check available disk space',
        'Clear browser cache',
        'Try a different browser'
      ],
      [ErrorHandler.ErrorTypes.NETWORK]: [
        'Check internet connection',
        'Try again later',
        'Contact support if issue persists'
      ],
      [ErrorHandler.ErrorTypes.VALIDATION]: [
        'Check input values',
        'Review settings',
        'Reset to defaults'
      ],
      [ErrorHandler.ErrorTypes.SYSTEM]: [
        'Refresh the page',
        'Clear browser cache',
        'Restart the browser'
      ]
    };

    return suggestions[errorInfo.type] || ['Try again', 'Contact support'];
  }
}

// Export singleton instance
export default new ErrorHandler();
