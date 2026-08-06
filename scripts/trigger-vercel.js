const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.vercel' || file === 'vercel-files.json' || file === 'clean-deploy-files.json') {
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

const allFiles = getAllFiles(path.join(__dirname, '..'));
console.log('=== All files found in project ===');
allFiles.forEach(f => console.log(' - ' + f.file));

fs.writeFileSync(path.join(__dirname, 'clean-deploy-files.json'), JSON.stringify(allFiles, null, 2));
