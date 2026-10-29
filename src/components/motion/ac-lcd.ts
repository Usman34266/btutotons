/**
 * The AC's display, drawn on a 2D canvas and used as a texture: a 7-segment
 * setpoint with unlit "ghost" segments like a real LCD, the mode, a fan-level
 * bar and the capacity line. All text arrives already formatted by the engine.
 */
export const LCD_SIZE = { width: 512, height: 224 } as const;

export interface LcdContent {
  mode: string;
  temperature: string;
  unit: string;
  tons: string;
  btuh: string;
  /** 1–3 lit fan bars (illustration only). */
  fanLevel: number;
  /** Swing on: a vertical double arrow next to the fan bars. */
  swing: boolean;
}

export interface LcdColors {
  bg: string;
  ink: string;
}

type Segment = "a" | "b" | "c" | "d" | "e" | "f" | "g";
const ALL: Segment[] = ["a", "b", "c", "d", "e", "f", "g"];
const DIGITS: Record<string, Segment[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "d", "c"],
  "7": ["a", "b", "c"],
  "8": ALL,
  "9": ["a", "b", "c", "d", "f", "g"],
};

const DIGIT = { width: 66, height: 104, thickness: 12, gap: 16 } as const;

function segmentRect(
  s: Segment,
  x: number,
  y: number,
): [number, number, number, number] {
  const { width: w, height: h, thickness: t } = DIGIT;
  const half = h / 2;
  const v = half - t * 1.25;
  switch (s) {
    case "a":
      return [x + t, y, w - 2 * t, t];
    case "b":
      return [x + w - t, y + t * 0.75, t, v];
    case "c":
      return [x + w - t, y + half + t * 0.5, t, v];
    case "d":
      return [x + t, y + h - t, w - 2 * t, t];
    case "e":
      return [x, y + half + t * 0.5, t, v];
    case "f":
      return [x, y + t * 0.75, t, v];
    case "g":
      return [x + t, y + half - t / 2, w - 2 * t, t];
  }
}

function drawDigit(
  ctx: CanvasRenderingContext2D,
  char: string,
  x: number,
  y: number,
) {
  const lit = new Set(DIGITS[char] ?? []);
  for (const s of ALL) {
    ctx.globalAlpha = lit.has(s) ? 1 : 0.08;
    ctx.beginPath();
    ctx.roundRect(...segmentRect(s, x, y), DIGIT.thickness / 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSnowflake(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(a) * 12, cy - Math.sin(a) * 12);
    ctx.lineTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12);
    ctx.stroke();
  }
}

function drawSwing(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 14);
  ctx.lineTo(cx, cy + 14);
  ctx.moveTo(cx - 7, cy - 7);
  ctx.lineTo(cx, cy - 14);
  ctx.lineTo(cx + 7, cy - 7);
  ctx.moveTo(cx - 7, cy + 7);
  ctx.lineTo(cx, cy + 14);
  ctx.lineTo(cx + 7, cy + 7);
  ctx.stroke();
}

export function drawLcd(
  ctx: CanvasRenderingContext2D,
  content: LcdContent,
  colors: LcdColors,
  fontFamily: string,
) {
  const { width, height } = LCD_SIZE;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = colors.bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 28);
  ctx.fill();

  ctx.fillStyle = colors.ink;
  ctx.strokeStyle = colors.ink;
  ctx.textBaseline = "alphabetic";

  // Mode, top left.
  drawSnowflake(ctx, 42, 40);
  ctx.font = `500 22px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.fillText(content.mode, 64, 48);

  // Fan level, top right: three rising bars.
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = i < content.fanLevel ? 1 : 0.12;
    const h = 10 + i * 8;
    ctx.fillRect(width - 92 + i * 20, 52 - h, 12, h);
  }
  ctx.globalAlpha = 1;
  if (content.swing) drawSwing(ctx, width - 122, 38);

  // Setpoint, 7-segment, slanted like an LCD.
  const chars = [...content.temperature];
  const digitsWidth =
    chars.length * DIGIT.width + (chars.length - 1) * DIGIT.gap;
  const startX = (width - digitsWidth) / 2 - 24;
  ctx.save();
  ctx.transform(1, 0, -0.1, 1, 12, 0);
  chars.forEach((c, i) =>
    drawDigit(ctx, c, startX + i * (DIGIT.width + DIGIT.gap), 58),
  );
  ctx.restore();
  ctx.font = `500 34px ${fontFamily}`;
  ctx.fillText(content.unit, startX + digitsWidth + 16, 92);

  // Capacity line, bottom.
  ctx.font = `500 28px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.fillText(content.tons, 32, height - 18);
  ctx.textAlign = "right";
  ctx.fillText(content.btuh, width - 32, height - 18);
}
