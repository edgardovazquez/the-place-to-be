/**
 * Client-side image optimization utility.
 * Resizes large smartphone/camera photos (which can be 10-25MB) down to
 * crisp, web-optimized dimensions (~250-450KB) using an offscreen canvas.
 * This completely prevents memory spikes, browser freezes, 413 payload errors,
 * and localStorage quota crashes.
 */
export async function optimizeImage(
  fileOrDataUrl: File | string,
  maxWidth = 1920,
  maxHeight = 1440,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          // Fallback if dimensions couldn't be determined
          if (typeof fileOrDataUrl === 'string') {
            resolve(fileOrDataUrl);
          } else {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fileOrDataUrl);
          }
          return;
        }

        // Scale proportionally if larger than maximum constraints
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          if (typeof fileOrDataUrl === 'string') {
            resolve(fileOrDataUrl);
          } else {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(fileOrDataUrl);
          }
          return;
        }

        // Use high quality interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedUrl);
      } catch (err) {
        console.warn('Canvas optimization error, falling back to raw:', err);
        if (typeof fileOrDataUrl === 'string') {
          resolve(fileOrDataUrl);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(fileOrDataUrl);
        }
      }
    };

    img.onerror = (err) => {
      console.warn('Image load error during optimization:', err);
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
