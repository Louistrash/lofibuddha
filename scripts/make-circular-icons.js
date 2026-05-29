// Create circular transparent Bodhi favicons
const sharp = require('sharp');
const path = require('path');

const inputFile = '/opt/data/.hermes/image_cache/img_71530a1db1ee.jpg';
const outputDir = '/opt/data/bodhi-dashboard/public';

async function main() {
    const metadata = await sharp(inputFile).metadata();
    console.log('Input:', metadata.width, 'x', metadata.height);
    
    const size = Math.min(metadata.width, metadata.height);
    const left = Math.floor((metadata.width - size) / 2);
    const top = Math.floor((metadata.height - size) / 2);
    
    // Extract center crop then resize and add circular mask
    const square = sharp(inputFile).extract({ left, top, width: size, height: size });
    
    // Create circular SVG masks for each size
    const sizes = [32, 180, 192, 512];
    
    for (const s of sizes) {
        const radius = s / 2;
        // Create circular mask using SVG
        const mask = Buffer.from(
            `<svg width="${s}" height="${s}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/></svg>`
        );
        
        const resized = await square.clone().resize(s, s).png().toBuffer();
        
        // Apply the circular mask and add transparency
        await sharp(resized)
            .composite([{ input: mask, blend: 'dest-in' }])
            .png()
            .toFile(path.join(outputDir, `bodhi-icon-${s}.png`));
        
        console.log(`✅ bodhi-icon-${s}.png (circular, transparent)`);
    }
    
    console.log('\nDone! All icons are now circular with transparent background.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
