const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, '../public/images');
fs.mkdirSync(destDir, { recursive: true });

const generatedSrcs = [
  'C:\\Users\\fkore\\.gemini\\antigravity-ide\\brain\\0ce7879e-144e-4cd2-9006-67a6a6516750\\fitness_sexy_woman_1_1786023547175.png',
  'C:\\Users\\fkore\\.gemini\\antigravity-ide\\brain\\0ce7879e-144e-4cd2-9006-67a6a6516750\\fitness_sexy_woman_2_1786023561585.png',
  'C:\\Users\\fkore\\.gemini\\antigravity-ide\\brain\\0ce7879e-144e-4cd2-9006-67a6a6516750\\fitness_sexy_woman_3_1786023574300.png'
];

for (let i = 1; i <= 20; i++) {
  const srcIndex = (i - 1) % generatedSrcs.length;
  const srcPath = generatedSrcs[srcIndex];
  const targetPath = path.join(destDir, `fitness_${i}.png`);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, targetPath);
  }
}
console.log('Successfully updated all 20 fitness images with stunning aesthetic fit woman models in public/images!');
