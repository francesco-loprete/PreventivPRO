import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public");
const appDir = path.join(process.cwd(), "app");
const svgPath = path.join(root, "icon-base.svg");
const maskableSvgPath = path.join(root, "icon-maskable.svg");
const iconsDir = path.join(root, "icons");
const splashDir = path.join(root, "splash");

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const SPLASH_SCREENS = [
  {
    width: 2048,
    height: 2732,
    media:
      "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    width: 1668,
    height: 2388,
    media:
      "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    width: 1536,
    height: 2048,
    media:
      "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    width: 1290,
    height: 2796,
    media:
      "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    width: 1179,
    height: 2556,
    media:
      "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    width: 1284,
    height: 2778,
    media:
      "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    width: 1170,
    height: 2532,
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    width: 828,
    height: 1792,
    media:
      "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    width: 750,
    height: 1334,
    media:
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
];

function splashSvg(width, height) {
  const iconSize = Math.round(Math.min(width, height) * 0.22);
  const titleSize = Math.round(Math.min(width, height) * 0.05);
  const subtitleSize = Math.round(titleSize * 0.55);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#0F172A"/>
  <rect x="${(width - iconSize) / 2}" y="${height * 0.36}" width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.22}" fill="#38BDF8"/>
  <text x="${width / 2}" y="${height * 0.36 + iconSize * 0.62}" text-anchor="middle" fill="#0F172A" font-family="Arial, Helvetica, sans-serif" font-size="${iconSize * 0.58}" font-weight="700">P</text>
  <text x="${width / 2}" y="${height * 0.36 + iconSize + titleSize * 1.4}" text-anchor="middle" fill="#F8FAFC" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="700">Preventiv<tspan fill="#38BDF8">PRO</tspan></text>
  <text x="${width / 2}" y="${height * 0.36 + iconSize + titleSize * 2.4}" text-anchor="middle" fill="#94A3B8" font-family="Arial, Helvetica, sans-serif" font-size="${subtitleSize}">Gestione preventivi</text>
</svg>`;
}

async function generateIcons(svg) {
  fs.mkdirSync(iconsDir, { recursive: true });

  for (const size of ICON_SIZES) {
    const out = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log("Created", out);
  }

  const appleTouch = path.join(iconsDir, "apple-touch-icon.png");
  await sharp(svg).resize(180, 180).png().toFile(appleTouch);
  await sharp(svg).resize(180, 180).png().toFile(path.join(root, "apple-touch-icon.png"));
  console.log("Created apple-touch-icon.png");

  const maskableSvg = fs.readFileSync(maskableSvgPath);
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-maskable-512x512.png"));
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(root, "icon-maskable-512x512.png"));

  await sharp(svg).resize(192, 192).png().toFile(path.join(root, "icon-192x192.png"));
  await sharp(svg).resize(512, 512).png().toFile(path.join(root, "icon-512x512.png"));

  const favicon32 = await sharp(svg).resize(32, 32).png().toBuffer();
  await sharp(favicon32).toFile(path.join(root, "favicon.ico"));
  await sharp(favicon32).toFile(path.join(root, "favicon.png"));
  fs.mkdirSync(appDir, { recursive: true });
  await sharp(svg).resize(32, 32).png().toFile(path.join(appDir, "icon.png"));
  await sharp(svg).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
  console.log("Created favicon and app/icon.png");
}

async function generateSplashScreens() {
  fs.mkdirSync(splashDir, { recursive: true });

  for (const { width, height } of SPLASH_SCREENS) {
    const out = path.join(splashDir, `splash-${width}x${height}.png`);
    const svg = Buffer.from(splashSvg(width, height));
    await sharp(svg).png().toFile(out);
    console.log("Created", out);
  }
}

async function generate() {
  if (!fs.existsSync(svgPath)) {
    throw new Error(`Missing ${svgPath}`);
  }

  const svg = fs.readFileSync(svgPath);
  await generateIcons(svg);
  await generateSplashScreens();
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
