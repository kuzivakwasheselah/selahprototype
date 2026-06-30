import type { Verse } from "@/data/verses";

/**
 * Compose the verse over the background image on a canvas and trigger a PNG
 * download — the "Save as wallpaper" behaviour. Portrait 1080x1920 so the
 * result works as a phone lock/home screen.
 */
export async function downloadWallpaper(verse: Verse, imageUrl: string) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = await loadImage(imageUrl);

  // cover-fit the image
  const scale = Math.max(W / img.width, H / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);

  // darkening gradient for legibility
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0.45)");
  grad.addColorStop(0.5, "rgba(0,0,0,0.25)");
  grad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // verse text
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 24;
  const fontSize = verse.text.length > 160 ? 58 : verse.text.length > 90 ? 66 : 76;
  ctx.font = `500 ${fontSize}px Georgia, 'Cormorant Garamond', serif`;

  const lines = wrapText(ctx, `“${verse.text}”`, W - 200);
  const lineHeight = fontSize * 1.34;
  const blockHeight = lines.length * lineHeight;
  let y = H / 2 - blockHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  // reference
  ctx.shadowBlur = 12;
  ctx.font = `italic 40px Georgia, serif`;
  ctx.fillText(`— ${verse.book} ${verse.chapter}:${verse.verse}`, W / 2, y + 36);

  // brand
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.7;
  ctx.font = `600 30px Georgia, serif`;
  ctx.fillText("Selah", W / 2, H - 70);
  ctx.globalAlpha = 1;

  const link = document.createElement("a");
  link.download = `selah-${verse.book.replace(/\s+/g, "-").toLowerCase()}-${verse.chapter}-${verse.verse}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Compose a prayer (title + body) over a background image and trigger a PNG
 * download — the prayer equivalent of `downloadWallpaper`.
 */
export async function downloadPrayerWallpaper(
  title: string,
  text: string,
  imageUrl: string,
) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = await loadImage(imageUrl);
  const scale = Math.max(W / img.width, H / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0.5)");
  grad.addColorStop(0.5, "rgba(0,0,0,0.3)");
  grad.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 24;

  // Title
  ctx.font = `italic 52px Georgia, 'Cormorant Garamond', serif`;
  ctx.fillText(title, W / 2, H * 0.3);

  // Body
  const fontSize = text.length > 220 ? 50 : text.length > 140 ? 58 : 66;
  ctx.font = `500 ${fontSize}px Georgia, 'Cormorant Garamond', serif`;
  const lines = wrapText(ctx, text, W - 200);
  const lineHeight = fontSize * 1.36;
  const blockHeight = lines.length * lineHeight;
  let y = H / 2 - blockHeight / 2 + 40;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.7;
  ctx.font = `600 30px Georgia, serif`;
  ctx.fillText("Selah", W / 2, H - 70);
  ctx.globalAlpha = 1;

  const link = document.createElement("a");
  link.download = `selah-prayer-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
