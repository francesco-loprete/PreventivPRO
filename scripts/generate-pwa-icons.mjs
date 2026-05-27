import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public");
const appDir = path.join(process.cwd(), "app");
const iconsDir = path.join(root, "icons");
const splashDir = path.join(root, "splash");
const brandingDir = path.join(root, "branding");

/** Custom uploaded masters — never overwritten by this script. */
const CUSTOM_SOURCES = {
  icon512: path.join(root, "icon-512x512.png"),
  icon192: path.join(root, "icon-192x192.png"),
  appleTouch: path.join(root, "apple-touch-icon.png"),
  maskable512: path.join(root, "icon-maskable-512x512.png"),
};

const DERIVED_ICON_SIZES = [72, 96, 128, 144, 152, 384];

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

function assertCustomSources() {
  for (const [name, filePath] of Object.entries(CUSTOM_SOURCES)) {
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Missing custom asset ${name} at ${filePath}. Restore uploaded icons before running generate:icons.`
      );
    }
  }
}

async function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log("Copied", to);
}

async function syncIconSet() {
  fs.mkdirSync(iconsDir, { recursive: true });
  if (fs.existsSync(brandingDir) && !fs.statSync(brandingDir).isDirectory()) {
    fs.unlinkSync(brandingDir);
  }
  fs.mkdirSync(brandingDir, { recursive: true });

  await copyFile(CUSTOM_SOURCES.appleTouch, path.join(iconsDir, "apple-touch-icon.png"));
  await copyFile(CUSTOM_SOURCES.icon192, path.join(iconsDir, "icon-192x192.png"));
  await copyFile(CUSTOM_SOURCES.icon512, path.join(iconsDir, "icon-512x512.png"));
  await copyFile(
    CUSTOM_SOURCES.maskable512,
    path.join(iconsDir, "icon-maskable-512x512.png")
  );
  await copyFile(
    CUSTOM_SOURCES.icon512,
    path.join(brandingDir, "logo-preventivpro.png")
  );

  const master = sharp(CUSTOM_SOURCES.icon512);

  for (const size of DERIVED_ICON_SIZES) {
    const out = path.join(iconsDir, `icon-${size}x${size}.png`);
    await master.clone().resize(size, size).png().toFile(out);
    console.log("Created", out, "(from custom icon-512x512.png)");
  }

  const favicon32 = await sharp(CUSTOM_SOURCES.appleTouch)
    .resize(32, 32)
    .png()
    .toBuffer();
  await sharp(favicon32).toFile(path.join(root, "favicon.ico"));
  await sharp(favicon32).toFile(path.join(root, "favicon.png"));

  fs.mkdirSync(appDir, { recursive: true });
  await sharp(favicon32).toFile(path.join(appDir, "icon.png"));
  await copyFile(CUSTOM_SOURCES.appleTouch, path.join(appDir, "apple-icon.png"));
  console.log("Synced favicon and app icons from custom apple-touch-icon.png");
}

async function generateSplashScreens() {
  fs.mkdirSync(splashDir, { recursive: true });

  for (const { width, height } of SPLASH_SCREENS) {
    const out = path.join(splashDir, `splash-${width}x${height}.png`);
    const logoSize = Math.round(Math.min(width, height) * 0.28);
    const logo = await sharp(CUSTOM_SOURCES.icon512)
      .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: "#0F172A",
      },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png()
      .toFile(out);

    console.log("Created", out, "(from custom logo)");
  }
}

async function generate() {
  assertCustomSources();
  await syncIconSet();
  await generateSplashScreens();
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
