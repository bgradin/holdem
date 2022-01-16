import console from 'console';
import fs from 'fs';
import http from 'http';
import path from 'path';
import * as esbuild from 'esbuild';

const copyStaticFiles = require('esbuild-copy-static-files');

const PORT = 3031;

esbuild.build({
  entryPoints: ['src/client/app.tsx'],
  outfile: 'src/client/public/bundle.js',
  bundle: true,
  watch: !process.env.PRODUCTION,
  minify: !!process.env.PRODUCTION,
  sourcemap: true,
  plugins: [
    copyStaticFiles({
      src: 'src/client/index.html',
      dest: 'src/client/public/index.html',
      force: true,
    }),
  ],
}).catch((err) => {
  console.error(err);
}).then(() => {
  console.log('Esbuild successful!');

  if (!process.env.PRODUCTION) {
    // eslint-disable-next-line global-require
    require('../src/server/server').default.start();

    const proxy = http.createServer((req, res) => {
      if (req.url) {
        const file = path.resolve(__dirname, '../src/client/public', req.url === '/' ? 'index.html' : req.url.substr(1));
        try {
          if (fs.existsSync(file)) {
            res.write(fs.readFileSync(file));
            res.end();
          } else {
            res.writeHead(404);
            res.end();
          }
        } catch (err) {
          res.writeHead(500, typeof (err as any).toString === 'function' ? (err as any).toString() as string : '');
          res.end();
        }
      }
    });
    proxy.listen(PORT);
  }
});
