/*
 * Copyright (c) ScreenCastPro 2017.
 */

package com.openapps.screenrecorderpro;

import android.content.Context;
import android.hardware.Camera;
import android.media.MediaRecorder;
import android.util.Log;
import android.os.Build;
import androidx.annotation.RequiresApi;

import java.io.IOException;

/**
 * Handles camera recording using the Camera API and MediaRecorder.
 */
@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
public class CameraRecorder {
    private Camera camera;
    private MediaRecorder mediaRecorder;
    private RecordingConfig config;
    private Context context;
    private boolean isRecording = false;

    public CameraRecorder(Context context, RecordingConfig config) {
        this.context = context;
        this.config = config;
    }

    /**
     * Start camera recording to the specified output path.
     *
     * @param outputPath Path to save the video file
     * @param rotation   Device rotation (0, 90, 180, 270)
     * @throws IOException If recording setup fails
     */
    public void startCameraRecording(String outputPath, int rotation) throws IOException {
        try {
            // Release any existing camera resource
            if (camera != null) {
                camera.release();
                camera = null;
            }

            // Get back camera (camera 0)
            camera = Camera.open(0);
            
            // Set camera parameters
            Camera.Parameters params = camera.getParameters();
            params.setPreviewSize(config.getVideoWidth(), config.getVideoHeight());
            params.setPreviewFrameRate(config.getFrameRate());
            camera.setParameters(params);
            camera.setDisplayOrientation(rotation);

            // Setup MediaRecorder
            mediaRecorder = new MediaRecorder();
            mediaRecorder.setCamera(camera);
            
            // Set audio source if enabled
            if (config.isAudioEnabled()) {
                mediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            }
            
            mediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
            mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            mediaRecorder.setVideoEncoder(MediaRecorder.VideoEncoder.H264);
            
            // Set audio codec if enabled
            if (config.isAudioEnabled()) {
                mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
                mediaRecorder.setAudioSamplingRate(44100);
                mediaRecorder.setAudioEncodingBitRate(128000);
            }
            
            mediaRecorder.setVideoSize(config.getVideoWidth(), config.getVideoHeight());
            mediaRecorder.setVideoFrameRate(config.getFrameRate());
            mediaRecorder.setVideoEncodingBitRate(config.getBitrate());
            mediaRecorder.setOrientationHint(rotation);
            mediaRecorder.setOutputFile(outputPath);

            mediaRecorder.prepare();
            mediaRecorder.start();
            
            isRecording = true;
            Log.d(Const.TAG, "Camera recording started at " + outputPath + 
                    " Quality: " + config.getQuality() + " FPS: " + config.getFrameRate());
        } catch (IOException e) {
            Log.e(Const.TAG, "Error starting camera recording: " + e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            Log.e(Const.TAG, "Runtime error starting camera recording: " + e.getMessage());
            throw new IOException(e);
        }
    }

    /**
     * Stop camera recording and release resources.
     */
    public void stopCameraRecording() {
        try {
            if (mediaRecorder != null) {
                if (isRecording) {
                    mediaRecorder.stop();
                }
                mediaRecorder.reset();
                mediaRecorder.release();
                mediaRecorder = null;
            }
            
            if (camera != null) {
                camera.release();
                camera = null;
            }
            
            isRecording = false;
            Log.d(Const.TAG, "Camera recording stopped");
        } catch (RuntimeException e) {
            Log.e(Const.TAG, "Error stopping camera recording: " + e.getMessage());
        }
    }

    /**
     * Pause camera recording (requires Android 7.0+).
     */
    public void pauseCameraRecording() {
        if (mediaRecorder != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                mediaRecorder.pause();
                isRecording = false;
                Log.d(Const.TAG, "Camera recording paused");
            } catch (IllegalStateException e) {
                Log.e(Const.TAG, "Error pausing camera recording: " + e.getMessage());
            }
        }
    }

    /**
     * Resume camera recording (requires Android 7.0+).
     */
    public void resumeCameraRecording() {
        if (mediaRecorder != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                mediaRecorder.resume();
                isRecording = true;
                Log.d(Const.TAG, "Camera recording resumed");
            } catch (IllegalStateException e) {
                Log.e(Const.TAG, "Error resuming camera recording: " + e.getMessage());
            }
        }
    }

    /**
     * Check if currently recording.
     */
    public boolean isRecording() {
        return isRecording;
    }
}
