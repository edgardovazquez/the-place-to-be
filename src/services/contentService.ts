import { PublishedSiteContent } from '../types';
import { getMediaItem, saveMediaItem } from '../utils/imageDb';

const DEFAULT_CONTENT: PublishedSiteContent = {
  cabinetImg: '/section_b_cabinet.jpg',
  cabinetFitMode: 'contain',
  spotlightImg: '/section_b_spotlight.jpg',
  publishedAt: '2026-09-17T00:00:00.000Z',
  lastUpdatedBy: 'Section B Cabinet',
  issueTitle: 'Issue 02 — September 17–30, 2026',
};

export async function fetchPublishedContent(): Promise<PublishedSiteContent> {
  let content: PublishedSiteContent | null = null;

  try {
    const res = await fetch('/api/site-content');
    if (res.ok) {
      const data = await res.json();
      content = data;
    }
  } catch (err) {
    console.warn('Could not fetch from server, checking local caches:', err);
  }

  // Fallback to local cache if server is unavailable
  if (!content) {
    try {
      const cached = localStorage.getItem('section_b_published_content');
      if (cached) {
        content = JSON.parse(cached);
      }
    } catch {
      // ignore quota or parse error
    }
  }

  const result: PublishedSiteContent = content || { ...DEFAULT_CONTENT };

  // Check IndexedDB backup if cabinetImg or spotlightImg is missing
  try {
    if (!result.cabinetImg) {
      const idbCabinet = await getMediaItem('cabinetImg');
      if (idbCabinet) {
        result.cabinetImg = idbCabinet;
      }
    } else if (result.cabinetImg.startsWith('data:image/')) {
      // Keep IndexedDB in sync
      saveMediaItem('cabinetImg', result.cabinetImg).catch(() => {});
    }

    if (!result.spotlightImg) {
      const idbSpotlight = await getMediaItem('spotlightImg');
      if (idbSpotlight) {
        result.spotlightImg = idbSpotlight;
      }
    }
  } catch (err) {
    console.warn('Error reading from IndexedDB cache:', err);
  }

  // Cache in localStorage if possible (safe from quota errors)
  try {
    localStorage.setItem('section_b_published_content', JSON.stringify(result));
  } catch {
    // ignore
  }

  return result;
}

export async function saveAndPublishContent(
  content: Partial<PublishedSiteContent>
): Promise<{ success: boolean; content?: PublishedSiteContent; error?: string }> {
  // Always persist images to IndexedDB first so they are never lost
  try {
    if (content.cabinetImg) {
      await saveMediaItem('cabinetImg', content.cabinetImg);
    }
    if (content.spotlightImg) {
      await saveMediaItem('spotlightImg', content.spotlightImg);
    }
  } catch (err) {
    console.warn('Could not persist to IndexedDB:', err);
  }

  try {
    const res = await fetch('/api/site-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });

    if (res.ok) {
      const json = await res.json();
      const updated = json.content;
      try {
        localStorage.setItem('section_b_published_content', JSON.stringify(updated));
      } catch {
        // ignore quota exceptions
      }
      return { success: true, content: updated };
    } else {
      const errorText = await res.text();
      console.warn('Server save warning:', errorText);
    }
  } catch (err: any) {
    console.error('Save to server error:', err);
  }

  // Offline or network fallback
  try {
    const currentCached = localStorage.getItem('section_b_published_content');
    const base = currentCached ? JSON.parse(currentCached) : DEFAULT_CONTENT;
    const updated = { ...base, ...content, publishedAt: new Date().toISOString() };
    try {
      localStorage.setItem('section_b_published_content', JSON.stringify(updated));
    } catch {
      // quota exceeded
    }
    return { success: true, content: updated };
  } catch {
    return {
      success: true,
      content: { ...DEFAULT_CONTENT, ...content, publishedAt: new Date().toISOString() },
    };
  }
}

export async function uploadPhotoToServer(
  dataUrl: string,
  type: string
): Promise<string> {
  // Save in client-side IndexedDB immediately
  try {
    await saveMediaItem(`${type}Img`, dataUrl);
  } catch {
    // ignore
  }

  try {
    const res = await fetch('/api/upload-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, type }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Server photo upload error, using direct optimized payload:', err);
  }

  return dataUrl;
}

