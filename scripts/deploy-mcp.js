const fs = require('fs');
const path = require('path');

// clean-deploy-files.json 읽기
const cleanFiles = JSON.parse(fs.readFileSync(path.join(__dirname, 'clean-deploy-files.json'), 'utf8'));

// vercel deploy 호환을 위해 필수 파일만 골라내기
const targetFiles = cleanFiles.filter(f => !f.file.startsWith('scripts/') && f.file !== 'init.sql');

console.log(`Total files ready for Vercel deployment: ${targetFiles.length}`);
targetFiles.forEach(f => console.log(' -> ' + f.file));

// mcp_payload.json 생성
const payload = {
  name: "exercise-tracker",
  target: "production",
  teamId: "team_f3bRLwEMdEoBAgEADTQbK3Dt",
  files: targetFiles
};

fs.writeFileSync(path.join(__dirname, 'mcp_payload.json'), JSON.stringify(payload));
console.log("Successfully generated mcp_payload.json!");
