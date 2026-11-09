/**
 * YouTube URL parser and embed URL constructor.
 *
 * Supported URL formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID        (already-embedded URLs)
 *   https://m.youtube.com/watch?v=VIDEO_ID
 *
 * Returns null for any URL that does not unambiguously resolve to a valid
 * YouTube video ID. We never fall through to rendering arbitrary stored HTML.
 */

/** A valid YouTube video ID: 11 characters, alphanumeric + _ - */
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const { hostname, pathname, searchParams } = parsed;

  // Normalise: strip www. / m. prefix
  const host = hostname.replace(/^(www\.|m\.)/, '');

  // https://youtu.be/VIDEO_ID
  if (host === 'youtu.be') {
    const id = pathname.slice(1).split('?')[0];
    return VIDEO_ID_RE.test(id) ? id : null;
  }

  // https://youtube.com/watch?v=VIDEO_ID
  if (host === 'youtube.com' && pathname === '/watch') {
    const id = searchParams.get('v') ?? '';
    return VIDEO_ID_RE.test(id) ? id : null;
  }

  // https://youtube.com/embed/VIDEO_ID  (already-embedded form stored in DB)
  if (host === 'youtube.com' && pathname.startsWith('/embed/')) {
    const id = pathname.slice('/embed/'.length).split('?')[0];
    return VIDEO_ID_RE.test(id) ? id : null;
  }

  return null;
}

/**
 * Builds a safe embed URL from a validated video ID.
 * - autoplay=0 : never autoplay
 * - rel=0      : suppress unrelated recommendations at end of video
 * - modestbranding=1 : reduce YouTube logo size
 * - origin     : set when running in browser (reduces CORS noise)
 */
export function buildEmbedUrl(videoId: string, origin?: string): string {
  const params = new URLSearchParams({
    autoplay: '0',
    rel: '0',
    modestbranding: '1',
    // enablejsapi allows YouTube to emit postMessage events (onError, onReady)
    // which YouTubePlayer.tsx uses for playback error detection.
    enablejsapi: '1',
  });
  if (origin) {
    params.set('origin', origin);
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Returns a canonical YouTube watch URL for "Open on YouTube" links.
 */
export function buildWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
