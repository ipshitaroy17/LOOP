'use client';

/**
 * YouTubePlayer — a self-contained, accessible YouTube iframe embed.
 *
 * Design decisions:
 * - Uses youtube-nocookie.com (privacy-enhanced mode) for all embeds.
 * - Never renders arbitrary stored HTML from the database.
 * - Video ID is extracted and validated before the iframe is rendered.
 * - No autoplay; full player controls and fullscreen are enabled.
 * - Responsive 16:9 aspect ratio via aspect-video Tailwind class.
 * - Detects YouTube JS API error events (onError) so unavailable /
 *   embedding-blocked videos show a clear fallback rather than a blank box.
 *
 * Props:
 *   videoId   Validated YouTube video ID (11 chars). Required.
 *   title     Accessible <iframe> title. Required.
 *   className Optional extra classes on the outer wrapper.
 */

import { useEffect, useState } from 'react';
import { buildEmbedUrl, buildWatchUrl } from '@/lib/youtube/parseVideoId';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  className?: string;
}

type PlayerState = 'loading' | 'ready' | 'error';

export default function YouTubePlayer({ videoId, title, className = '' }: YouTubePlayerProps) {
  const watchUrl = buildWatchUrl(videoId);

  // The embed URL is built once after the component mounts so we can include
  // the browser origin (for enablejsapi CORS). The lazy-initialiser form of
  // useState runs only on the client, so there is no SSR mismatch.
  const [embedUrl] = useState<string>(() =>
    typeof window !== 'undefined'
      ? buildEmbedUrl(videoId, window.location.origin)
      : buildEmbedUrl(videoId)
  );

  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [errorCode, setErrorCode] = useState<number | null>(null);

  useEffect(() => {
    // YouTube IFrame Player API error detection.
    // We listen for postMessage events from the iframe.
    // YouTube's JS API emits { event: 'onError', info: <code> } when:
    //   2  — invalid parameter
    //   5  — HTML5 player error
    //   100 — video not found / removed
    //   101 / 150 — owner has disallowed embedding
    function handleMessage(event: MessageEvent) {
      if (event.origin !== 'https://www.youtube-nocookie.com') return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onError') {
          setErrorCode(data.info as number);
          setPlayerState('error');
        } else if (data?.event === 'onReady' || data?.event === 'infoDelivery') {
          setPlayerState((prev) => (prev !== 'error' ? 'ready' : prev));
        }
      } catch {
        // non-JSON postMessage from other origins — ignore
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [videoId]);

  function handleIframeLoad() {
    setPlayerState((prev) => (prev === 'loading' ? 'ready' : prev));
  }

  function handleIframeError() {
    setPlayerState('error');
    setErrorCode(null);
  }

  const errorMessage = (() => {
    if (errorCode === 101 || errorCode === 150) {
      return 'The video owner has disabled embedding. Watch it directly on YouTube.';
    }
    if (errorCode === 100) {
      return 'This video is unavailable or has been removed from YouTube.';
    }
    if (errorCode === 2) {
      return 'Invalid video — the stored URL may be malformed.';
    }
    return 'The video could not be loaded. It may be unavailable or region-restricted.';
  })();

  return (
    <div className={`relative w-full ${className}`}>
      {/* 16:9 responsive wrapper */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-md">
        {playerState === 'error' ? (
          /* ── Error fallback ─────────────────────────────────────────── */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-zinc-900 rounded-2xl">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <svg
                className="w-8 h-8 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300 mb-2">{errorMessage}</p>
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: 'var(--color-sage)',
                  color: '#1F1F1F',
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Watch on YouTube
              </a>
            </div>
          </div>
        ) : (
          /* ── Main iframe ─────────────────────────────────────────────── */
          <>
            {playerState === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black rounded-2xl z-10 pointer-events-none">
                <div
                  className="w-10 h-10 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin"
                  aria-label="Loading video…"
                />
              </div>
            )}
            <iframe
              src={embedUrl}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </>
        )}
      </div>
    </div>
  );
}
