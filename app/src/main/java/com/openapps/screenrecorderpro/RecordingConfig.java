/*
 * Copyright (c) ScreenCastPro 2017.
 */

package com.openapps.screenrecorderpro;

/**
 * Configuration for video recording quality, mode, and settings.
 */
public class RecordingConfig {
    
    public enum Quality {
        LOW(1280, 720, 2500000),
        MEDIUM(1920, 1080, 5000000),
        HIGH(2560, 1440, 8000000),
        ULTRA(3840, 2160, 16000000);

        public final int width;
        public final int height;
        public final int bitrate;

        Quality(int width, int height, int bitrate) {
            this.width = width;
            this.height = height;
            this.bitrate = bitrate;
        }
    }

    public enum RecordingMode {
        SCREEN,
        CAMERA
    }

    private Quality quality = Quality.HIGH;
    private RecordingMode mode = RecordingMode.SCREEN;
    private int frameRate = 30;
    private boolean audioEnabled = true;

    public RecordingConfig() {}

    public Quality getQuality() {
        return quality;
    }

    public void setQuality(Quality quality) {
        this.quality = quality;
    }

    public RecordingMode getMode() {
        return mode;
    }

    public void setMode(RecordingMode mode) {
        this.mode = mode;
    }

    public int getFrameRate() {
        return frameRate;
    }

    public void setFrameRate(int frameRate) {
        this.frameRate = frameRate;
    }

    public boolean isAudioEnabled() {
        return audioEnabled;
    }

    public void setAudioEnabled(boolean audioEnabled) {
        this.audioEnabled = audioEnabled;
    }

    public int getVideoWidth() {
        return quality.width;
    }

    public int getVideoHeight() {
        return quality.height;
    }

    public int getBitrate() {
        return quality.bitrate;
    }
}
