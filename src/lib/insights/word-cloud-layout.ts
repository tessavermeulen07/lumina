export interface CloudWordInput {
  text: string;
  count: number;
}

export interface PlacedCloudWord {
  text: string;
  count: number;
  fontSize: number;
  fontWeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_FONT_PX = 15;
const MAX_FONT_PX = 44;
const WORD_PADDING = 36;
const MEASURE_BUFFER = 1.08;
const HORIZONTAL_SPREAD = 1.55;
const VERTICAL_SPREAD = 1.2;

function getFontSize(
  count: number,
  minCount: number,
  maxCount: number,
): number {
  if (maxCount <= minCount) {
    return (MIN_FONT_PX + MAX_FONT_PX) / 2;
  }

  const ratio = (count - minCount) / (maxCount - minCount);
  return MIN_FONT_PX + ratio * (MAX_FONT_PX - MIN_FONT_PX);
}

function getFontWeight(fontSize: number): number {
  if (fontSize >= 34) return 700;
  if (fontSize >= 24) return 600;
  return 500;
}

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return !(
    a.x + a.width + WORD_PADDING <= b.x ||
    b.x + b.width + WORD_PADDING <= a.x ||
    a.y + a.height + WORD_PADDING <= b.y ||
    b.y + b.height + WORD_PADDING <= a.y
  );
}

function getLabelWidth(
  text: string,
  count: number,
  fontSize: number,
  fontWeight: number,
  measureWidth: (text: string, fontSize: number, fontWeight: number) => number,
): number {
  const countFontSize = fontSize * 0.6;
  return (
    (measureWidth(text, fontSize, fontWeight) +
      8 +
      measureWidth(String(count), countFontSize, 400)) *
    MEASURE_BUFFER
  );
}

function centerCloudInContainer(
  words: PlacedCloudWord[],
  containerWidth: number,
  wordCount: number,
): { words: PlacedCloudWord[]; height: number } {
  if (words.length === 0) {
    return { words, height: 0 };
  }

  const minX = Math.min(...words.map((word) => word.x));
  const maxX = Math.max(...words.map((word) => word.x + word.width));
  const minY = Math.min(...words.map((word) => word.y));
  const maxY = Math.max(...words.map((word) => word.y + word.height));

  const cloudWidth = maxX - minX;
  const cloudHeight = maxY - minY;
  const targetHeight = Math.max(
    cloudHeight + WORD_PADDING * 2,
    wordCount * 56,
    140,
  );
  const offsetX = (containerWidth - cloudWidth) / 2 - minX;
  const offsetY = (targetHeight - cloudHeight) / 2 - minY;

  return {
    words: words.map((word) => ({
      ...word,
      x: word.x + offsetX,
      y: word.y + offsetY,
    })),
    height: targetHeight,
  };
}

function tryPlaceWord(
  word: CloudWordInput,
  fontSize: number,
  fontWeight: number,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  containerWidth: number,
  placed: PlacedCloudWord[],
  startStep = 0,
): PlacedCloudWord | null {
  for (let step = startStep; step < 5000; step += 1) {
    const angle = step * 0.34;
    const radius = WORD_PADDING + step * 2.1;
    const x =
      centerX + radius * Math.cos(angle) * HORIZONTAL_SPREAD - width / 2;
    const y =
      centerY + radius * Math.sin(angle) * VERTICAL_SPREAD - height / 2;

    if (x < 8 || x + width > containerWidth - 8 || y < 8) {
      continue;
    }

    const candidate = { x, y, width, height };
    const hasCollision = placed.some((item) => boxesOverlap(candidate, item));

    if (!hasCollision) {
      return {
        text: word.text,
        count: word.count,
        fontSize,
        fontWeight,
        x,
        y,
        width,
        height,
      };
    }
  }

  return null;
}

export function layoutWordCloud(
  words: CloudWordInput[],
  containerWidth: number,
  measureWidth: (text: string, fontSize: number, fontWeight: number) => number,
): { words: PlacedCloudWord[]; height: number } {
  if (words.length === 0) {
    return { words: [], height: 0 };
  }

  const minCount = Math.min(...words.map((word) => word.count));
  const maxCount = Math.max(...words.map((word) => word.count));
  const sorted = [...words].sort((a, b) => b.count - a.count);
  const placed: PlacedCloudWord[] = [];
  const centerX = containerWidth / 2;
  const centerY = Math.max(sorted.length * 28, 90);

  for (const [index, word] of sorted.entries()) {
    const fontSize = getFontSize(word.count, minCount, maxCount);
    const fontWeight = getFontWeight(fontSize);
    const width = getLabelWidth(
      word.text,
      word.count,
      fontSize,
      fontWeight,
      measureWidth,
    );
    const height = fontSize * 1.35 * MEASURE_BUFFER;

    if (index === 0) {
      placed.push({
        text: word.text,
        count: word.count,
        fontSize,
        fontWeight,
        x: centerX - width / 2,
        y: centerY - height / 2,
        width,
        height,
      });
      continue;
    }

    const positioned = tryPlaceWord(
      word,
      fontSize,
      fontWeight,
      width,
      height,
      centerX,
      centerY,
      containerWidth,
      placed,
      WORD_PADDING,
    );

    if (positioned) {
      placed.push(positioned);
      continue;
    }

    let fallbackY = 0;
    let added = false;

    for (let attempt = 0; attempt < 200; attempt += 1) {
      for (const x of [
        centerX - width / 2,
        containerWidth * 0.2 - width / 2,
        containerWidth * 0.8 - width / 2,
        16,
        containerWidth - width - 16,
      ]) {
        const clampedX = Math.max(8, Math.min(x, containerWidth - width - 8));
        const candidate = {
          x: clampedX,
          y: fallbackY,
          width,
          height,
        };

        if (candidate.x < 8 || candidate.x + width > containerWidth - 8) {
          continue;
        }

        const hasCollision = placed.some((item) =>
          boxesOverlap(candidate, item),
        );

        if (!hasCollision) {
          placed.push({
            text: word.text,
            count: word.count,
            fontSize,
            fontWeight,
            x: candidate.x,
            y: candidate.y,
            width,
            height,
          });
          added = true;
          break;
        }
      }

      if (added) {
        break;
      }

      fallbackY += height + WORD_PADDING;
    }
  }

  return centerCloudInContainer(placed, containerWidth, sorted.length);
}
