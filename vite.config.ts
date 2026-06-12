/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local CORS Proxy middleware to handle /api/proxy in dev mode without Vercel CLI
function localProxyPlugin() {
  return {
    name: 'local-proxy',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && (req.url === '/api/proxy' || req.url.startsWith('/api/proxy?'))) {
          try {
            // Load the proxy handler using Vite's SSR module loader (handles TypeScript compilation automatically)
            const { default: handler } = await server.ssrLoadModule('/api/proxy.ts');

            // Parse body if present and appropriate
            let body: any = undefined;
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              const buffers: Buffer[] = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const rawBody = Buffer.concat(buffers).toString('utf-8');
              try {
                body = JSON.parse(rawBody);
              } catch {
                body = rawBody;
              }
            }

            // Adapt standard Node request to Vercel VercelRequest surface area
            const vercelReq = Object.create(req);
            vercelReq.body = body;

            // Adapt standard Node response to Vercel VercelResponse surface area
            const vercelRes = Object.create(res);
            
            vercelRes.status = function (code: number) {
              res.statusCode = code;
              return this;
            };

            vercelRes.setHeader = function (key: string, value: string) {
              res.setHeader(key, value);
              return this;
            };

            vercelRes.end = function () {
              res.end();
            };

            vercelRes.json = function (obj: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(obj));
            };

            vercelRes.send = function (data: any) {
              res.end(data);
            };

            await handler(vercelReq, vercelRes);
          } catch (err: any) {
            console.error('Local proxy error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localProxyPlugin()],
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/.climpire-worktrees/**', '**/.climpire/**'],
  },
})
