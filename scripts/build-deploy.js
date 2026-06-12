const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting deployment build...');

// 1. Run standard workspace builds
console.log('Compiling frontend and backend...');
execSync('npm run build:all', { stdio: 'inherit' });

// 2. Define source and target directories
const rootDir = path.resolve(__dirname, '..');
const deployDir = path.join(rootDir, 'deploy-dist');

// Clean previous deploy-dist directory if it exists
if (fs.existsSync(deployDir)) {
  console.log('Cleaning old deploy-dist directory...');
  fs.rmSync(deployDir, { recursive: true, force: true });
}

fs.mkdirSync(deployDir);

// Helper function to recursively copy directories
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 3. Copy root files
console.log('Copying root configuration files...');
fs.copyFileSync(path.join(rootDir, 'server.js'), path.join(deployDir, 'server.js'));
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(deployDir, 'package.json'));
if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) {
  fs.copyFileSync(path.join(rootDir, 'package-lock.json'), path.join(deployDir, 'package-lock.json'));
}

// 4. Copy backend files
console.log('Copying backend compiled files...');
copyDir(path.join(rootDir, 'backend/dist'), path.join(deployDir, 'backend/dist'));
copyDir(path.join(rootDir, 'backend/prisma'), path.join(deployDir, 'backend/prisma'));
fs.copyFileSync(path.join(rootDir, 'backend/package.json'), path.join(deployDir, 'backend/package.json'));

// 5. Copy frontend files
console.log('Copying frontend compiled files...');
copyDir(path.join(rootDir, 'frontend/next-build'), path.join(deployDir, 'frontend/next-build'));
copyDir(path.join(rootDir, 'frontend/public'), path.join(deployDir, 'frontend/public'));
fs.copyFileSync(path.join(rootDir, 'frontend/package.json'), path.join(deployDir, 'frontend/package.json'));
if (fs.existsSync(path.join(rootDir, 'frontend/next.config.mjs'))) {
  fs.copyFileSync(path.join(rootDir, 'frontend/next.config.mjs'), path.join(deployDir, 'frontend/next.config.mjs'));
}

console.log('Deployment build completed successfully inside /deploy-dist!');
