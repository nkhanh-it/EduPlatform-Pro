import React, { useEffect, useRef } from 'react';
import { API_BASE } from '@/api';

interface ProtectedVideoPlayerProps {
  src: string;
  title: string;
  className?: string;
}

const ProtectedVideoPlayer: React.FC<ProtectedVideoPlayerProps> = ({ src, title, className }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let destroyed = false;
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      if (!src) {
        video.removeAttribute('src');
        video.load();
        return;
      }

      const tokenMatch = src.match(/\/api\/media\/(?:hls|play)\/([^/]+)/);
      const playbackToken = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
      if (playbackToken) {
        const sessionResponse = await fetch(`${API_BASE}/api/media/playback/session?token=${encodeURIComponent(playbackToken)}`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!sessionResponse.ok) {
          throw new Error('Failed to initialize playback session');
        }
      }

      if (src.includes('.m3u8')) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.crossOrigin = 'use-credentials';
          video.src = src;
          return;
        }

        const { default: Hls } = await import('hls.js');
        if (destroyed) {
          return;
        }

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            xhrSetup: (xhr) => {
              xhr.withCredentials = true;
            },
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          cleanup = () => hls.destroy();
          return;
        }
      }

      video.crossOrigin = 'use-credentials';
      video.src = src;
    };

    setup();

    return () => {
      destroyed = true;
      if (cleanup) {
        cleanup();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      title={title}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      onContextMenu={(event) => event.preventDefault()}
    />
  );
};

export default ProtectedVideoPlayer;
