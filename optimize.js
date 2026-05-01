const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const CleanCSS = require('clean-css');

const assetsDir = path.join(__dirname, 'assets');
const cssPath = path.join(__dirname, 'style.css');

async function optimize() {
  // 1. Optimize images
  const images = [
    { src: 'herodesk.jpeg', dist: 'herodesk.webp' },
    { src: 'heromobile.jpeg', dist: 'heromobile.webp' },
    { src: 'pfp1629.jpeg', dist: 'pfp1629.webp' },
    { src: 'pfphcy.jpeg', dist: 'pfphcy.webp' },
    { src: 'HCYABOVE/hcyabove (1).png', dist: 'HCYABOVE/hcyabove (1).webp' },
    { src: '1629/SS (1).png', dist: '1629/SS (1).webp' },
  ];

  for (const img of images) {
    const srcPath = path.join(assetsDir, img.src);
    const distPath = path.join(assetsDir, img.dist);
    
    if (fs.existsSync(srcPath)) {
      try {
        await sharp(srcPath).webp({ quality: 80 }).toFile(distPath);
        console.log(`Converted ${img.src} to ${img.dist}`);
      } catch (err) {
        console.error(`Error converting ${img.src}:`, err);
      }
    } else {
      console.log(`File not found: ${srcPath}`);
    }
  }

  // 2. Minify CSS
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const minified = new CleanCSS({}).minify(cssContent);
    fs.writeFileSync(cssPath, minified.styles);
    console.log('CSS minified successfully.');
  }
}

optimize();
