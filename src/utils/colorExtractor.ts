/**
 * colorExtractor.ts
 * Extracts harmonious, prominent color palettes from images using the HTML5 Canvas API.
 */

export interface ExtractedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  count: number;
}

export async function extractColorsFromImage(
  imageSource: File | string,
  maxColors: number = 4
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(['#0B57D0', '#A8C7FA', '#D3E3FD']);
          return;
        }

        // Downscale for speedy pixel processing (e.g. 100x100 max)
        const maxDim = 80;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const colorBuckets: Record<string, { r: number; g: number; b: number; count: number }> = {};

        // Sample pixels with quantization (16-step quantization for distinct clusters)
        const quant = 24;
        for (let i = 0; i < data.length; i += 4 * 2) {
          const a = data[i + 3];
          if (a < 128) continue; // Skip transparent pixels

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Skip pure washed-out whites and pitch blacks
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 15 || brightness > 245) continue;

          const qr = Math.round(r / quant) * quant;
          const qg = Math.round(g / quant) * quant;
          const qb = Math.round(b / quant) * quant;
          const key = `${qr},${qg},${qb}`;

          if (!colorBuckets[key]) {
            colorBuckets[key] = { r: qr, g: qg, b: qb, count: 0 };
          }
          colorBuckets[key].count++;
        }

        const sorted = Object.values(colorBuckets).sort((a, b) => b.count - a.count);

        if (sorted.length === 0) {
          // Fallback if image was mostly white/black
          resolve(['#0B57D0', '#4285F4', '#90CAF9']);
          return;
        }

        // Pick diverse colors (avoid selecting colors that are too close to each other)
        const selected: ExtractedColor[] = [];
        const isTooClose = (c1: ExtractedColor, c2: ExtractedColor) => {
          const dr = c1.r - c2.r;
          const dg = c1.g - c2.g;
          const db = c1.b - c2.b;
          return Math.sqrt(dr * dr + dg * dg + db * db) < 45; // Euclidean RGB distance
        };

        for (const candidate of sorted) {
          const hex = rgbToHex(candidate.r, candidate.g, candidate.b);
          const colorObj: ExtractedColor = { ...candidate, hex };

          const duplicate = selected.some((s) => isTooClose(s, colorObj));
          if (!duplicate) {
            selected.push(colorObj);
          }
          if (selected.length >= maxColors) break;
        }

        // If not enough diverse colors, fill with highest count
        let idx = 0;
        while (selected.length < Math.min(maxColors, sorted.length) && idx < sorted.length) {
          const c = sorted[idx++];
          const hex = rgbToHex(c.r, c.g, c.b);
          if (!selected.some((s) => s.hex === hex)) {
            selected.push({ ...c, hex });
          }
        }

        const hexList = selected.map((s) => s.hex);
        resolve(hexList.length > 0 ? hexList : ['#0B57D0', '#A8C7FA']);
      } catch (err) {
        console.warn('Failed to extract colors from image', err);
        resolve(['#0B57D0', '#A8C7FA', '#D3E3FD']);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for color extraction'));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(imageSource);
    }
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, val));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
