const parseYouTubeTimeToSeconds = (value: string | null): number | null => {
  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) {
    return null;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
};

const extractYouTubeVideoId = (videoUrl: string): { id: string; start: number | null } | null => {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (host === 'youtu.be') {
      const id = pathParts[0];
      if (!id) {
        return null;
      }
      const start = parseYouTubeTimeToSeconds(url.searchParams.get('t'));
      return { id, start };
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        if (!id) {
          return null;
        }
        const start = parseYouTubeTimeToSeconds(url.searchParams.get('t'));
        return { id, start };
      }

      if (pathParts[0] === 'shorts' || pathParts[0] === 'embed' || pathParts[0] === 'live') {
        const id = pathParts[1];
        if (!id) {
          return null;
        }
        const start = parseYouTubeTimeToSeconds(url.searchParams.get('t') || url.searchParams.get('start'));
        return { id, start };
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const getYouTubeEmbedUrl = (videoUrl: string): string | null => {
  const parsed = extractYouTubeVideoId(videoUrl.trim());
  if (!parsed) {
    return null;
  }

  const safeId = parsed.id.replace(/[^A-Za-z0-9_-]/g, '');
  if (!safeId) {
    return null;
  }

  const params = new URLSearchParams({ rel: '0' });
  if (parsed.start && parsed.start > 0) {
    params.set('start', String(parsed.start));
  }

  return `https://www.youtube.com/embed/${safeId}?${params.toString()}`;
};
