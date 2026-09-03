import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicFiles = [
  'index.html', 'styles.css', 'app.js', 'config.js',
  'admin.html', 'admin.css', 'admin.js',
  'assets/payments/binance.svg',
  'assets/payments/instapay.png',
  'assets/payments/paypal.svg',
  'assets/payments/vodafone.svg',
  'assets/ranks/elite.png',
  'assets/ranks/epic.png',
  'assets/ranks/grandmaster.png',
  'assets/ranks/legend.png',
  'assets/ranks/master.png',
  'assets/ranks/mythic.png',
  'assets/ranks/mythical-glory.png',
  'assets/ranks/mythical-honor.png',
  'assets/ranks/mythical-immortal.png',
  'assets/ranks/warrior.png'
];

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const files = Object.fromEntries(publicFiles.map(file => {
  const body = fs.readFileSync(path.join(root, file)).toString('base64');
  return [`/${file}`, { body, type: mime[path.extname(file)] || 'application/octet-stream' }];
}));

const worker = `const FILES=${JSON.stringify(files)};
const decode=value=>Uint8Array.from(atob(value),character=>character.charCodeAt(0));
export default {
  async fetch(request) {
    const url=new URL(request.url);
    let pathname=decodeURIComponent(url.pathname);
    if(pathname==='/'||pathname==='/index') pathname='/index.html';
    if(pathname==='/admin') pathname='/admin.html';
    const file=FILES[pathname];
    if(!file) return new Response('Not found',{status:404,headers:{'content-type':'text/plain; charset=utf-8'}});
    const isDocument=pathname.endsWith('.html');
    return new Response(decode(file.body),{headers:{
      'content-type':file.type,
      'cache-control':isDocument?'no-cache':'public, max-age=31536000, immutable',
      'x-content-type-options':'nosniff',
      'referrer-policy':'strict-origin-when-cross-origin'
    }});
  }
};\n`;

fs.mkdirSync(path.join(root, 'dist/server'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/server/index.js'), worker);
console.log(`Built ${publicFiles.length} public files for deployment.`);
