// This is captured from Bootstrap's --bs-body-font-family variable
const bs_font_sans_serif = `system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"`;

export const createPlaceholderImage = (
  width: number,
  height: number,
  text: string
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (context === null) {
    console.log("Somehow the 2d context is not available");
    return;
  }

  // Set background color
  context.fillStyle = "#eee";
  context.fillRect(0, 0, width, height);

  // Set text style and add text
  context.fillStyle = "#333";
  context.font = `50px ${bs_font_sans_serif}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  // Allow word wrapping which is not natively available
  printAtWordWrap(context, text, width / 2, height / 3, 50, width - 20);

  return canvas.toDataURL();
};

function printAtWordWrap(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  lineHeight: number,
  fitWidth: number
) {
  if (fitWidth <= 0) {
    context.fillText(text, x, y);
    return;
  }
  let words = text.split(" ");
  let currentLine = 0;
  let idx = 1;
  while (words.length > 0 && idx <= words.length) {
    const str = words.slice(0, idx).join(" ");
    const width = context.measureText(str).width;
    if (width > fitWidth) {
      if (idx == 1) {
        idx = 2;
      }
      context.fillText(
        words.slice(0, idx - 1).join(" "),
        x,
        y + lineHeight * currentLine
      );
      currentLine++;
      words = words.splice(idx - 1);
      idx = 1;
    } else {
      idx++;
    }
  }
  if (idx > 0) {
    context.fillText(words.join(" "), x, y + lineHeight * currentLine);
  }
}
