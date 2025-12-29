export const getErrorSvg = (message: string, width: number = 256, height: number = 256) => {
  // Basic XML escaping
  const escapedMessage = message.replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&apos;');

  // Split message into lines
  const maxCharsPerLine = 30;
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

  const fontSize = Math.max(16, Math.floor(width / 24));
  const lineHeight = fontSize * 1.4;
  
  // Face dimensions
  const faceScale = width / 200;
  const cx = width / 2;
  const cy = height * 0.3; // Move face up slightly

  // Layout calculations
  const titleY = height * 0.65;
  const textStartY = titleY + lineHeight * 1.5; // Start text below title

  const textContent = lines.map((line, index) => 
    `<text x="50%" y="${textStartY + index * lineHeight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" fill="#374151" text-anchor="middle" dominant-baseline="middle">${line.trim()}</text>`
  ).join('\n');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg)"/>
  
  <!-- Dead Face Icon -->
  <g transform="translate(${cx}, ${cy}) scale(${faceScale})">
    <!-- Face Shape -->
    <circle r="50" fill="#fff" stroke="#1f2937" stroke-width="3"/>
    
    <!-- Left Eye (X) -->
    <g transform="translate(-20, -10)">
      <line x1="-8" y1="-8" x2="8" y2="8" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
      <line x1="8" y1="-8" x2="-8" y2="8" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
    </g>
    
    <!-- Right Eye (X) -->
    <g transform="translate(20, -10)">
      <line x1="-8" y1="-8" x2="8" y2="8" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
      <line x1="8" y1="-8" x2="-8" y2="8" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
    </g>
    
    <!-- Mouth (Wavy/Dead) -->
    <path d="M-20 25 Q-10 15 0 25 T20 25" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Sweat Drop -->
    <path d="M35 -20 Q35 -30 40 -25 Q45 -20 35 -20" fill="#60a5fa" stroke="#2563eb" stroke-width="1"/>
  </g>

  <!-- Error Title -->
  <text x="50%" y="${titleY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${width * 0.08}" font-weight="bold" fill="#1f2937" text-anchor="middle" letter-spacing="1">ERROR</text>

  <!-- Error Message -->
  ${textContent}
  
  <!-- Border -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#d1d5db" stroke-width="${Math.max(2, width/100)}"/>
</svg>
  `.trim();
};
