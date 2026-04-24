# Screen Recorder Pro

A modern web-based screen recording application built with React, Vite, and Tailwind CSS.

## Features

- **Screen Recording**: Capture your screen with configurable quality (720p to 4K)
- **Audio Capture**: Record microphone audio with noise suppression
- **Floating Controls**: Draggable overlay with pause/resume/stop functionality
- **Video Gallery**: Manage and preview recorded videos
- **Settings Panel**: Customize recording quality, frame rate, audio options
- **Download & Share**: Export recordings as WebM files
- **Modern UI**: Clean, responsive interface with Feather icons

## Technologies Used

- **React 19.2.0** - Modern React with hooks
- **Vite 7.3.1** - Fast development server and build tool
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Icons** - Feather icon set
- **MediaRecorder API** - Browser-based recording
- **getDisplayMedia API** - Screen capture

## Getting Started

### Prerequisites

- Node.js 18+ 
- Modern web browser with screen capture support

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Usage

1. **Start Recording**: Click the red record button to begin screen capture
2. **Configure Settings**: Adjust video quality, frame rate, and audio options
3. **Control Recording**: Use floating controls to pause/resume/stop
4. **Manage Videos**: View, download, or share recordings in the gallery
5. **Customize**: Enable/disable floating controls and set countdown timer

## Browser Support

Requires a modern browser that supports:
- MediaRecorder API
- getDisplayMedia API
- Screen capture permissions

## License

This project is open source and available under the MIT License.
