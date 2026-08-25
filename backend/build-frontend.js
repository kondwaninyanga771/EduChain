const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const backendPublicDir = path.join(__dirname, 'public');

console.log('🚀 Building frontend...');
try {
  // Run the vite build process in the frontend directory
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
  console.log('✅ Frontend build successful!');
  
  console.log('📂 Copying build to backend/public...');
  
  // Clean the existing public directory if it exists
  if (fs.existsSync(backendPublicDir)) {
    fs.rmSync(backendPublicDir, { recursive: true, force: true });
  }
  
  // Copy frontend dist to backend public
  const frontendDistDir = path.join(frontendDir, 'dist');
  fs.cpSync(frontendDistDir, backendPublicDir, { recursive: true });
  
  console.log('✅ Files copied successfully!');
  console.log('🎉 Fullstack build complete! The backend will now serve the frontend directly.');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
