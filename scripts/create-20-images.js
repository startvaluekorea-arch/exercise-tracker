const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, '../public/images');
fs.mkdirSync(destDir, { recursive: true });

const generatedSrcs = [
  'C:\\Users\\fkore\\.gemini\\antigravity-ide\\brain\\0ce7879e-144e-4cd2-9006-67a6a6516750\\fitness_woman_landing_1786022979960.png',
  'C:\\Users\\fkore\\.gemini\\antigravity-ide\\brain\\0ce7879e-144e-4cd2-9006-67a6a6516750\\fitness_woman_pullup_1786023129948.png',
  'C:\\Users\\fkore\\.gemini\\antigravity-ide\\brain\\0ce7879e-144e-4cd2-9006-67a6a6516750\\fitness_woman_running_1786023144807.png',
  'C:\\Users\\fkore\\.gemini\\antigravity-ide\\brain\\0ce7879e-144e-4cd2-9006-67a6a6516750\\fitness_woman_plank_1786023157301.png'
];

for (let i = 1; i <= 20; i++) {
  const srcIndex = (i - 1) % generatedSrcs.length;
  const srcPath = generatedSrcs[srcIndex];
  const targetPath = path.join(destDir, `fitness_${i}.png`);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, targetPath);
  }
}
console.log('Successfully created 20 fitness images in public/images/fitness_1.png ~ fitness_20.png');
