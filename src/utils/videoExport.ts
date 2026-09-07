/**
 * Video recording and export utility using HTML5 Canvas captureStream & MediaRecorder
 */

export interface VideoExportOptions {
  durationSeconds: number;
  fps: number;
  format: 'mp4' | 'webm' | 'gif';
  renderFrame: (progress: number, timeMs: number) => void;
  width: number;
  height: number;
  onProgress?: (progress: number) => void;
}

/**
 * Checks supported MIME types for video recording in the current browser
 */
export function getSupportedVideoMimeType(preferredFormat: 'mp4' | 'webm'): { mimeType: string; extension: string } {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: 'video/webm', extension: 'webm' };
  }

  if (preferredFormat === 'mp4') {
    const mp4Types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=h264',
      'video/mp4',
    ];
    for (const t of mp4Types) {
      if (MediaRecorder.isTypeSupported(t)) {
        return { mimeType: t, extension: 'mp4' };
      }
    }
  }

  // Fallbacks to WebM
  const webmTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const t of webmTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      return { mimeType: t, extension: 'webm' };
    }
  }

  return { mimeType: 'video/webm', extension: 'webm' };
}

/**
 * Records an animated canvas sequence for the specified duration and returns a video Blob
 */
export async function recordCanvasAnimation(
  canvas: HTMLCanvasElement,
  options: VideoExportOptions
): Promise<{ blob: Blob; extension: string; mimeType: string }> {
  const { durationSeconds, fps, format, renderFrame, onProgress } = options;

  const { mimeType, extension } = getSupportedVideoMimeType(format === 'gif' ? 'webm' : format);

  return new Promise((resolve, reject) => {
    try {
      const stream = canvas.captureStream(fps);
      const chunks: Blob[] = [];

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 10_000_000, // 10 Mbps for crisp gradients
        });
      } catch {
        // Fallback without options if browser rejects mimeType
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onerror = (err) => {
        reject(err);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType });
        resolve({ blob: finalBlob, extension, mimeType });
      };

      recorder.start();

      const totalFrames = Math.round(durationSeconds * fps);
      let currentFrame = 0;
      const intervalMs = 1000 / fps;

      const timer = setInterval(() => {
        currentFrame++;
        const progress = Math.min(1, currentFrame / totalFrames);
        const timeMs = currentFrame * intervalMs;

        renderFrame(progress, timeMs);

        if (onProgress) {
          onProgress(Math.round(progress * 100));
        }

        if (currentFrame >= totalFrames) {
          clearInterval(timer);
          setTimeout(() => {
            if (recorder.state !== 'inactive') {
              recorder.stop();
            }
          }, 200);
        }
      }, intervalMs);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Helper to download Blob to user file system
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
