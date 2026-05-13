/**
 * Freepik / Magnific image generation script
 * Usage: FREEPIK_API_KEY=xxx node scripts/gen-images.mjs
 *
 * Generates visual assets for the Notkode website in relace.ai style:
 * - Warm cream background, minimal geometric, editorial tech aesthetic
 * - Saves PNGs to /public/images/generated/
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

// Load .env.local manually (no dotenv dependency needed)
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    });
}

const API_KEY    = process.env.MAGNIFIC_API_KEY || process.env.FREEPIK_API_KEY;
const BASE_URL   = 'https://api.freepik.com/v1/ai/mystic';
const API_HEADER = 'x-freepik-api-key';
const OUT_DIR    = path.resolve('public/images/generated');
const POLL_MS    = 5000;
const MAX_POLLS  = 30;

if (!API_KEY) {
  console.error('❌  Set FREEPIK_API_KEY env var and re-run.\n   Example: FREEPIK_API_KEY=your_key node scripts/gen-images.mjs');
  process.exit(1);
}

// ─── Image definitions ──────────────────────────────────────────────────────
// Each entry describes one asset to generate.
// ── Style guide ──────────────────────────────────────────────────────────────
// Reference: relace.ai visual language
// → Real photographic backgrounds (landscapes, aerial, nature)
// → Warm, slightly desaturated, earthy editorial tones
// → Fine film grain / halftone texture
// → Wide horizontal framing, atmospheric depth
// → NO diagrams, NO text, NO people
// These will be used as backgrounds with UI overlays placed on top in code.
// ─────────────────────────────────────────────────────────────────────────────

const STYLE_SUFFIX =
  'Wide horizontal framing. Warm earthy color palette, slightly desaturated, ' +
  'amber and terracotta tones. Fine cinematic film grain texture visible. ' +
  'Editorial photography aesthetic. No people. No text. No logos. ' +
  'Atmospheric depth. Professional quality.';

const IMAGES = [
  {
    filename: 'bg-hero.png',
    prompt:
      'Panoramic mountain range landscape at golden dusk, silhouette of peaks against hazy warm sky, ' +
      'subtle atmospheric glow on horizon. ' + STYLE_SUFFIX,
    aspect_ratio: 'widescreen_16_9',
    model: 'realism',
  },
  {
    filename: 'bg-product.png',
    prompt:
      'Aerial view of rolling hills and terrain at sunset, abstract natural textures, ' +
      'warm amber and dusty rose tones, soft shadows. ' + STYLE_SUFFIX,
    aspect_ratio: 'widescreen_16_9',
    model: 'realism',
  },
  {
    filename: 'bg-process.png',
    prompt:
      'Close-up of layered desert rock strata or smooth sandstone surface, ' +
      'abstract geological texture, warm ochre and terracotta. ' + STYLE_SUFFIX,
    aspect_ratio: 'widescreen_16_9',
    model: 'realism',
  },
  {
    filename: 'bg-agency.png',
    prompt:
      'Aerial photograph of winding road through landscape, warm tones, ' +
      'top-down perspective, abstract compositional shapes. ' + STYLE_SUFFIX,
    aspect_ratio: 'widescreen_16_9',
    model: 'realism',
  },
];

// ─── API helpers ─────────────────────────────────────────────────────────────
async function request(url, method, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? JSON.stringify(body) : undefined;
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        [API_HEADER]: API_KEY,
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

async function downloadFile(url, dest) {
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Generate one image ───────────────────────────────────────────────────────
async function generate(img) {
  console.log(`\n📸  Generating: ${img.filename}`);
  console.log(`    Prompt: ${img.prompt.slice(0, 80)}…`);

  const { status, body } = await request(BASE_URL, 'POST', {
    prompt:       img.prompt,
    aspect_ratio: img.aspect_ratio,
    model:        img.model,
    resolution:   '2k',
    adherence:    70,
    hdr:          40,
    creative_detailing: 30,
    filter_nsfw:  true,
  });

  if (status !== 200 && status !== 201) {
    console.error(`    ❌  Request failed (${status}):`, body);
    return;
  }

  const taskId = body?.data?.task_id;
  if (!taskId) {
    console.error('    ❌  No task_id in response:', body);
    return;
  }
  console.log(`    ⏳  Task created: ${taskId}`);

  // Poll until done
  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_MS);
    const poll = await request(`${BASE_URL}/${taskId}`, 'GET');
    const taskStatus = poll.body?.data?.status;
    const generated  = poll.body?.data?.generated;

    process.stdout.write(`    ⏳  Status: ${taskStatus}  (${i + 1}/${MAX_POLLS})\r`);

    if (taskStatus === 'COMPLETED' && generated?.length) {
      const imageUrl = generated[0];
      const dest = path.join(OUT_DIR, img.filename);
      await downloadFile(imageUrl, dest);
      console.log(`\n    ✅  Saved → public/images/generated/${img.filename}`);
      return;
    }
    if (taskStatus === 'FAILED') {
      console.error(`\n    ❌  Task failed:`, poll.body);
      return;
    }
  }
  console.error(`\n    ⏱  Timed out after ${MAX_POLLS} polls.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('🎨  Notkode image generation — Freepik/Mystic API');
  console.log(`📁  Output: ${OUT_DIR}\n`);

  for (const img of IMAGES) {
    await generate(img);
  }

  console.log('\n🎉  Done! Images saved to public/images/generated/');
  console.log('    Add them to components via: /images/generated/<filename>');
}

main().catch(console.error);
