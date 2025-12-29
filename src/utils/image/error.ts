export const getErrorSvg = (message: string, width: number = 256, height: number = 256) => {
  // Basic XML escaping
  const escapedMessage = message.replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&apos;');

  // Split message into lines if it's too long (simple heuristic)
  const maxCharsPerLine = 25;
  const words = escapedMessage.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxCharsPerLine) {
      lines.push(currentLine);
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  lines.push(currentLine);

  const lineHeight = 20;
  const startY = (height - (lines.length * lineHeight)) / 2 + lineHeight / 2;

  const textContent = lines.map((line, index) => 
    `<text x="50%" y="${startY + index * lineHeight}" font-family="Arial, sans-serif" font-size="14" fill="#721c24" text-anchor="middle" dominant-baseline="middle">${line.trim()}</text>`
  ).join('\n');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f8d7da" stroke="#f5c6cb" stroke-width="2"/>
  <text x="50%" y="30" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#721c24" text-anchor="middle">Error</text>
  ${textContent}
</svg>
  `.trim();
};
