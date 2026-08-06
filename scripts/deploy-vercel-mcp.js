const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.vercel') {
      return;
    }
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const relPath = path.relative(path.join(__dirname, '..'), fullPath).replace(/\\/g, '/');
      const data = fs.readFileSync(fullPath, 'utf8');
      arrayOfFiles.push({ file: relPath, data });
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(path.join(__dirname, '..'));
console.log(`Total files to deploy: ${files.length}`);
fs.writeFileSync(path.join(__dirname, 'vercel-files.json'), JSON.stringify(files, null, 2));
console.log('Saved vercel-files.json');
