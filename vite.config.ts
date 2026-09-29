import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

function siteContentPlugin() {
  const handleSiteContent = (req: any, res: any, next: any) => {
    // Static file serving for user uploads in public/uploads/
    if (req.url && req.url.startsWith('/uploads/')) {
      const cleanPath = req.url.split('?')[0];
      const filePath = path.join(process.cwd(), 'public', cleanPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    // 1. Upload photo endpoint
    if (req.url && req.url.startsWith('/api/upload-photo')) {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const { dataUrl, type = 'photo' } = JSON.parse(body || '{}');
            if (!dataUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No dataUrl provided' }));
              return;
            }

            const uploadsDir = path.resolve(__dirname, 'public/uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Extract base64 image data
            const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              const mimeType = matches[1];
              const base64Data = matches[2];
              const buffer = Buffer.from(base64Data, 'base64');
              const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
              const fileName = `${type}_${Date.now()}.${ext}`;
              const filePath = path.join(uploadsDir, fileName);
              fs.writeFileSync(filePath, buffer);

              const publicUrl = `/uploads/${fileName}`;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, url: publicUrl }));
              return;
            } else {
              // If already a static URL or simple path, return as is
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, url: dataUrl }));
              return;
            }
          } catch (err: any) {
            console.error('Upload photo endpoint error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Failed to process photo upload' }));
            return;
          }
        });
        return;
      }
    }

    // 2. Site content persistence endpoint
    if (req.url && req.url.startsWith('/api/site-content')) {
      const filePath = path.resolve(__dirname, 'data/published-content.json');

      if (req.method === 'GET') {
        try {
          if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
            return;
          }
        } catch (err) {
          console.error(err);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            cabinetImg: null,
            cabinetFitMode: 'contain',
            spotlightImg: null,
            publishedAt: '2026-09-17T00:00:00.000Z',
            lastUpdatedBy: 'Section B Cabinet',
            issueTitle: 'Issue 02 — September 17–30, 2026',
          })
        );
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body || '{}');
            let current = {};
            if (fs.existsSync(filePath)) {
              try {
                current = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              } catch {
                current = {};
              }
            }
            const updated = {
              ...current,
              ...parsed,
              publishedAt: new Date().toISOString(),
            };

            const dataDir = path.dirname(filePath);
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, content: updated }));
            return;
          } catch (err) {
            console.error('Site content write error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to write content' }));
            return;
          }
        });
        return;
      }
    }

    next();
  };

  return {
    name: 'site-content-api',
    configureServer(server: any) {
      server.middlewares.use(handleSiteContent);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handleSiteContent);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), siteContentPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Ignore user-uploaded assets and data files so uploads never trigger dev server reloads or glitches
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/data/**', '**/public/uploads/**'],
      },
    },
  };
});
