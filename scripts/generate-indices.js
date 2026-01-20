const fs = require('fs');
const path = require('path');

const platformsDir = path.join(__dirname, '../src/platforms');

function generateIndexFile(directory) {
  const dirPath = path.join(platformsDir, directory);
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts');

  if (files.length === 0) return;

  const imports = files.map(file => {
    const platformName = path.basename(file, '.ts');
    return `import ${platformName} from "./${platformName}";`;
  }).join('\n');

  const platformNames = files.map(file => path.basename(file, '.ts'));

  const content = `import type { Platform } from "../../types";
${imports}

const platforms: Platform[] = [
  ${platformNames.join(',\n  ')},
];

export default platforms;
`;

  fs.writeFileSync(path.join(dirPath, 'index.ts'), content.trim() + '\n');
  console.log(`Generated index for ${directory} with ${files.length} platforms.`);
}

console.log('Generating platform indices...');
generateIndexFile('gal');
generateIndexFile('patch');
console.log('Done.');