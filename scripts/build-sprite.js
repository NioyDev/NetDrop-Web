import fs from 'fs';
import path from 'path';

const projectRoot = 'C:\\dev\\NetDrop-Web';
const spritePath = path.join(projectRoot, 'public', 'icons', 'sprite.svg');
const indexPath = path.join(projectRoot, 'index.html');
const jsDir = path.join(projectRoot, 'js');

if (!fs.existsSync(spritePath)) {
  console.error('No se encontró public/icons/sprite.svg');
  process.exit(1);
}

const fullSprite = fs.readFileSync(spritePath, 'utf-8');

// Escanear qué iconos se usan en index.html y js/*.js
let combinedCode = fs.readFileSync(indexPath, 'utf-8');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
for (const file of jsFiles) {
  combinedCode += '\n' + fs.readFileSync(path.join(jsDir, file), 'utf-8');
}

// Extraer todos los identificadores tipo i-[nombre] o #i-[nombre]
const regex = /(?:#|")i-([a-z0-9-]+)/g;
const usedIconNames = new Set();
let match;
while ((match = regex.exec(combinedCode)) !== null) {
  usedIconNames.add(match[1]);
}

// Iconos esenciales que siempre deben estar disponibles para simulador / UI
const essentials = [
  'qr-code', 'refresh-cw', 'puzzle', 'palette', 'shield-check', 'eye',
  'app-window', 'download', 'copy', 'check', 'monitor', 'smartphone',
  'laptop', 'tablet', 'wifi', 'zap', 'external-link', 'file-text',
  'film', 'image', 'trash-2', 'trash', 'help-circle', 'sun', 'moon',
  'info', 'chevron-down', 'python', 'rust', 'linux', 'github',
  'home', 'archive', 'upload', 'volume-2', 'file', 'descarga', 'exe',
  'qr', 'refresh', 'sound', 'upfile', 'zip'
];
for (const e of essentials) {
  usedIconNames.add(e);
}

// Extraer los símbolos correspondientes
const symbols = [];
for (const name of usedIconNames) {
  const id = 'i-' + name;
  const symbolRegex = new RegExp(`<symbol id="${id}"[\\s\\S]*?<\\/symbol>`, 'i');
  const symMatch = fullSprite.match(symbolRegex);
  if (symMatch) {
    symbols.push(symMatch[0]);
  }
}

const inlineSprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;" aria-hidden="true">\n  <defs>\n${symbols.map(s => '    ' + s).join('\n')}\n  </defs>\n</svg>`;
const byteSize = Buffer.byteLength(inlineSprite, 'utf-8');

// Incrustar en index.html
let indexContent = fs.readFileSync(indexPath, 'utf-8');
const spriteMarkerRegex = /<!-- INLINE_SPRITE_START -->[\s\S]*?<!-- INLINE_SPRITE_END -->/;
const replacement = `<!-- INLINE_SPRITE_START -->\n${inlineSprite}\n<!-- INLINE_SPRITE_END -->`;

if (spriteMarkerRegex.test(indexContent)) {
  indexContent = indexContent.replace(spriteMarkerRegex, replacement);
} else {
  // Insertar justo después de <body>
  indexContent = indexContent.replace('<body class="theme-midnight">', `<body class="theme-midnight">\n  ${replacement}`);
}

fs.writeFileSync(indexPath, indexContent, 'utf-8');
console.log(`✓ Sprite incrustado en index.html: ${symbols.length} iconos (${(byteSize / 1024).toFixed(2)} KB - ${byteSize} bytes)`);
