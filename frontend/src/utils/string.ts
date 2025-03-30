export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  }

  let truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    truncated = truncated.slice(0, lastSpace);
  }

  return truncated + "...";
};

export const determineTitleFontSize = (textLength: number) => {
  // Title was originall `display-4` which is 3.5rem
  const baseSize = 3.5;

  if (textLength <= 100) {
    return baseSize;
  }

  // Prevent text from becoming unreadable
  const minSize = 2.5;
  const shrinkFactor = 0.2;

  return Math.max(minSize, baseSize - ((textLength - 100) * shrinkFactor) / 10);
};
