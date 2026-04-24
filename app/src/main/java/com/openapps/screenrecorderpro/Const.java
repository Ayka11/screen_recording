/*
 * Copyright (c) ScreenCastPro 2017.
 */

package com.openapps.screenrecorderpro;

/**
 *  12-10-2016.
 */

// POJO class for bunch of statics used across the app
public class Const {
    static final int EXTDIR_REQUEST_CODE = 1000;
    static final int AUDIO_REQUEST_CODE = 1001;
    static final int SYSTEM_WINDOWS_CODE = 1002;
    static final int SCREEN_RECORD_REQUEST_CODE = 1003;
    static final String SCREEN_RECORDING_START = "com.openapps.screenrecorderpro.services.action.startrecording";
    static final String SCREEN_RECORDING_PAUSE = "com.openapps.screenrecorderpro.services.action.pauserecording";
    static final String SCREEN_RECORDING_RESUME = "com.openapps.screenrecorderpro.services.action.resumerecording";
    static final String SCREEN_RECORDING_STOP = "com.openapps.screenrecorderpro.services.action.stoprecording";
    static final String CAMERA_RECORDING_START = "com.openapps.screenrecorderpro.services.action.startcamerarecording";
    static final String CAMERA_RECORDING_PAUSE = "com.openapps.screenrecorderpro.services.action.pausecamerarecording";
    static final String CAMERA_RECORDING_RESUME = "com.openapps.screenrecorderpro.services.action.resumecamerarecording";
    static final String CAMERA_RECORDING_STOP = "com.openapps.screenrecorderpro.services.action.stopcamerarecording";
    static final int SCREEN_RECORDER_NOTIFICATION_ID = 5001;
    static final int SCREEN_RECORDER_SHARE_NOTIFICATION_ID = 5002;
    static final String RECORDER_INTENT_DATA = "recorder_intent_data";
    static final String RECORDER_INTENT_RESULT = "recorder_intent_result";
    static final String RECORDING_MODE = "recording_mode";
    static final String RECORDING_QUALITY = "recording_quality";
    static final String RECORDING_AUDIO_ENABLED = "recording_audio_enabled";
    public static final String TAG = "SCREENRECORDER";
    public static final String APPDIR = "screenrecorder";

  //  static final String ANALYTICS_URL = "http://analytics.orpheusdroid.com";
 //   static final String ANALYTICS_API_KEY = "07273a5c91f8a932685be1e3ad0d160d3de6d4ba";

    public enum RecordingState {
        RECORDING, PAUSED, STOPPED
    }
}
