// capture-poster.mjs
// 사용법: node capture-poster.mjs
// 결과: ./poster.gif 파일 생성
// 의존성: puppeteer, omggif, pngjs (모두 순수 JS, 네이티브 빌드 불필요)

import puppeteer from 'puppeteer';
import { GifWriter } from 'omggif';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH = 960;
const HEIGHT = 320;
const FRAMES = 60;
const FRAME_DELAY = 8;         // GIF delay in centiseconds (8 = 80ms)
const CAPTURE_INTERVAL = 100;  // ms between captures

async function captureGif() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const htmlPath = path.resolve(__dirname, 'round-midnight-poster.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // 애니메이션 안정화 대기
  await new Promise((r) => setTimeout(r, 1000));

  console.log(`${FRAMES}프레임 캡처 시작...`);

  // 프레임 캡처
  const frames = [];
  for (let i = 0; i < FRAMES; i++) {
    const screenshot = await page.screenshot({ type: 'png' });
    const png = PNG.sync.read(screenshot);

    // RGBA → RGB 인덱스 팔레트로 변환 (양자화)
    frames.push(png.data);

    if ((i + 1) % 10 === 0) {
      console.log(`  ${i + 1}/${FRAMES} 프레임 캡처 완료`);
    }

    await new Promise((r) => setTimeout(r, CAPTURE_INTERVAL));
  }

  await browser.close();

  console.log('GIF 인코딩 중...');

  // 글로벌 팔레트 생성 (256색 양자화)
  const palette = buildGlobalPalette(frames[0], WIDTH, HEIGHT);

  // GIF 버퍼 할당 (넉넉하게)
  const buf = Buffer.alloc(WIDTH * HEIGHT * FRAMES + 1024 * 1024);
  const gif = new GifWriter(buf, WIDTH, HEIGHT, { loop: 0, palette });

  for (let i = 0; i < frames.length; i++) {
    const indexed = quantizeFrame(frames[i], WIDTH, HEIGHT, palette);
    gif.addFrame(0, 0, WIDTH, HEIGHT, indexed, { delay: FRAME_DELAY });

    if ((i + 1) % 10 === 0) {
      console.log(`  ${i + 1}/${FRAMES} 프레임 인코딩 완료`);
    }
  }

  const outputPath = path.resolve(__dirname, 'poster.gif');
  const finalBuf = buf.slice(0, gif.end());
  fs.writeFileSync(outputPath, finalBuf);

  const sizeMB = (finalBuf.length / 1024 / 1024).toFixed(2);
  console.log(`\n완료: ${outputPath} (${sizeMB}MB)`);
}

// 첫 프레임에서 256색 팔레트 추출 (중앙값 분할 양자화)
function buildGlobalPalette(rgbaData, w, h) {
  // 색상 수집 (샘플링)
  const colors = [];
  const step = 4; // 4픽셀마다 샘플링
  for (let i = 0; i < w * h * 4; i += 4 * step) {
    colors.push([rgbaData[i], rgbaData[i + 1], rgbaData[i + 2]]);
  }

  // 간단한 중앙값 분할
  const palette = medianCut(colors, 256);

  // 256개로 패딩
  while (palette.length < 256) {
    palette.push([0, 0, 0]);
  }

  // omggif 형식: [0xRRGGBB, 0xRRGGBB, ...]
  return palette.map(([r, g, b]) => (r << 16) | (g << 8) | b);
}

// 중앙값 분할 양자화
function medianCut(colors, maxColors) {
  if (colors.length === 0) return [[0, 0, 0]];

  let buckets = [colors];

  while (buckets.length < maxColors) {
    // 가장 큰 버킷 찾기
    let maxIdx = 0;
    let maxLen = 0;
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length > maxLen) {
        maxLen = buckets[i].length;
        maxIdx = i;
      }
    }

    if (maxLen <= 1) break;

    const bucket = buckets[maxIdx];

    // 가장 넓은 채널 범위 찾기
    let ranges = [0, 1, 2].map((ch) => {
      const vals = bucket.map((c) => c[ch]);
      return Math.max(...vals) - Math.min(...vals);
    });

    const splitCh = ranges.indexOf(Math.max(...ranges));

    // 중앙값으로 분할
    bucket.sort((a, b) => a[splitCh] - b[splitCh]);
    const mid = Math.floor(bucket.length / 2);

    buckets.splice(maxIdx, 1, bucket.slice(0, mid), bucket.slice(mid));
  }

  // 각 버킷의 평균색
  return buckets.map((bucket) => {
    const avg = [0, 0, 0];
    for (const c of bucket) {
      avg[0] += c[0];
      avg[1] += c[1];
      avg[2] += c[2];
    }
    return [
      Math.round(avg[0] / bucket.length),
      Math.round(avg[1] / bucket.length),
      Math.round(avg[2] / bucket.length),
    ];
  });
}

// RGBA 프레임을 팔레트 인덱스로 변환
function quantizeFrame(rgbaData, w, h, palette) {
  const indexed = new Uint8Array(w * h);
  const paletteRgb = palette.map((c) => [(c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff]);

  // 캐시로 속도 향상
  const cache = new Map();

  for (let i = 0; i < w * h; i++) {
    const r = rgbaData[i * 4];
    const g = rgbaData[i * 4 + 1];
    const b = rgbaData[i * 4 + 2];

    const key = (r << 16) | (g << 8) | b;
    if (cache.has(key)) {
      indexed[i] = cache.get(key);
      continue;
    }

    // 가장 가까운 팔레트 색 찾기
    let minDist = Infinity;
    let bestIdx = 0;
    for (let j = 0; j < paletteRgb.length; j++) {
      const dr = r - paletteRgb[j][0];
      const dg = g - paletteRgb[j][1];
      const db = b - paletteRgb[j][2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) {
        minDist = dist;
        bestIdx = j;
      }
    }

    cache.set(key, bestIdx);
    indexed[i] = bestIdx;
  }

  return indexed;
}

captureGif().catch(console.error);
