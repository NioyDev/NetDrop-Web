import fs from 'fs';
import path from 'path';

// Regex estricta para cualquier pictograma extendido o selector de variación de emoji
const emojiRegex = /[\p{Extended_Pictographic}\uFE0F]/u;

const projectRoot = 'C:\\dev\\NetDrop-Web';
const targets = ['index.html', 'site.webmanifest', 'css', 'js', 'public', 'dist'];
const excludeFiles = ['three.module.js', 'three-D-SAjKju.js'];
const extensions = ['.html', '.css', '.js', '.json', '.webmanifest', '.md'];

let errorsCount = 0;
const violations = [];

function checkFile(filePath) {
  const baseName = path.basename(filePath);
  if (excludeFiles.includes(baseName)) return;
  if (!extensions.some(ext => baseName.endsWith(ext))) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Excluir líneas que son explicaciones o comentarios sobre la propia regex en scripts de auditoría
    if (filePath.includes('scripts')) return;

    if (emojiRegex.test(line)) {
      errorsCount++;
      violations.push({
        file: path.relative(projectRoot, filePath),
        line: index + 1,
        content: line.trim()
      });
    }
  });
}

function traverse(target) {
  const fullPath = path.join(projectRoot, target);
  if (!fs.existsSync(fullPath)) return;

  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    const items = fs.readdirSync(fullPath);
    for (const item of items) {
      if (item === 'node_modules' || item === '.git' || item === 'netdrop-icons' || item === 'vendor') continue;
      traverse(path.join(target, item));
    }
  } else {
    checkFile(fullPath);
  }
}

for (const t of targets) {
  traverse(t);
}

if (errorsCount > 0) {
  console.error(`\n❌ ERROR: Se encontraron ${errorsCount} emojis en el proyecto:`);
  violations.forEach(v => {
    console.error(`  [${v.file}:${v.line}] -> ${v.content}`);
  });
  console.error('\nEl build ha fallado porque el proyecto exige 0 emojis.\n');
  process.exit(1);
} else {
  console.log('✓ Auditoría anti-emojis superada: 0 emojis encontrados en código y assets.');
  process.exit(0);
}
