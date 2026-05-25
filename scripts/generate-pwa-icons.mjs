import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public");
const svgPath = path.join(root, "icon-base.svg");
const iconsDir = path.join(root, "icons");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  if (!fs.existsSync(svgPath)) {
    throw new Error(`Missing ${svgPath}`);
  }

  fs.mkdirSync(iconsDir, { recursive: true });
  const svg = fs.readFileSync(svgPath);

  for (const size of sizes) {
    const out = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log("Created", out);
  }

  await sharp(svg).resize(180, 180).png().toFile(path.join(iconsDir, "apple-touch-icon.png"));
  console.log("Created apple-touch-icon.png");

  const maskableSvg = fs.readFileSync(path.join(root, "icon-maskable.svg"));
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-maskable-512x512.png"));
  console.log("Created icon-maskable-512x512.png");
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
