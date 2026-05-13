/**
 * Generate one specific image for the /parcerias hero
 * Same visual language as the others (relace.ai style)
 * Concept: two paths converging — represents partnership
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    });
}

const API_KEY  = process.env.MAGNIFIC_API_KEY || process.env.FREEPIK_API_KEY;
const BASE_URL = 'https://api.freepik.com/v1/ai/mystic';
const OUT_DIR  = path.resolve('public/images/generated');
const POLL_MS  = 5000;
const MAX_POLLS = 30;

if (!API_KEY) { console.error('❌  Set MAGNIFIC_API_KEY'); process.exit(1); }

const STYLE_SUFFIX =
  'Wide horizontal framing. Warm earthy color palette, slightly desaturated, ' +
  'amber and terracotta tones. Fine cinematic film grain texture visible. ' +
  'Editorial photography aesthetic. No people. No text. No logos. ' +
  'Atmospheric depth. Professional quality.';

const IMAGE = {
  filename: 'bg-parcerias.png',
  prompt:
    'Aerial top-down photograph of two diverging paths or trails through golden ' +
    'wheat fields and earthy terrain at sunset, two roads converging into one, ' +
    'abstract geometric composition, soft warm shadows, minimalist landscape. ' +
    STYLE_SUFFIX,
  aspect_ratio: 'widescreen_16_9',
  model: 'realism',
};

function request(url, method, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? JSON.stringify(body) : undefined;
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': API_KEY,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => { fs.unlink(dest, () => {}); reject(e); });
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`📸  Generating: ${IMAGE.filename}`);

  const { status, body } = await request(BASE_URL, 'POST', {
    prompt:       IMAGE.prompt,
    aspect_ratio: IMAGE.aspect_ratio,
    model:        IMAGE.model,
    resolution:   '2k',
    adherence:    70,
    hdr:          40,
    creative_detailing: 30,
    filter_nsfw:  true,
  });

  if (status !== 200 && status !== 201) {
    console.error(`❌  Request failed (${status}):`, body); return;
  }

  const taskId = body?.data?.task_id;
  if (!taskId) { console.error('❌  No task_id:', body); return; }
  console.log(`⏳  Task: ${taskId}`);

  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_MS);
    const poll = await request(`${BASE_URL}/${taskId}`, 'GET');
    const taskStatus = poll.body?.data?.status;
    const generated  = poll.body?.data?.generated;
    process.stdout.write(`⏳  ${taskStatus} (${i + 1}/${MAX_POLLS})\r`);

    if (taskStatus === 'COMPLETED' && generated?.length) {
      const dest = path.join(OUT_DIR, IMAGE.filename);
      await downloadFile(generated[0], dest);
      console.log(`\n✅  Saved → public/images/generated/${IMAGE.filename}`);
      return;
    }
    if (taskStatus === 'FAILED') { console.error('\n❌  Task failed:', poll.body); return; }
  }
  console.error(`\n⏱  Timed out`);
}

main().catch(console.error);
