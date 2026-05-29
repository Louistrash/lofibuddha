// Convert Bodhi photo to favicon sizes using sharp
const sharp = require('sharp');
const path = require('path');

const inputFile = '/opt/data/.hermes/image_cache/img_71530a1db1ee.jpg';
const outputDir = '/opt/data/bodhi-dashboard/public';

async function main() {
    const image = sharp(inputFile);
    const metadata = await image.metadata();
    console.log('Input:', metadata.width, 'x', metadata.height, metadata.format);

    // Center crop to square
    const size = Math.min(metadata.width, metadata.height);
    const left = Math.floor((metadata.width - size) / 2);
    const top = Math.floor((metadata.height - size) / 2);

    const square = sharp(inputFile).extract({ left, top, width: size, height: size });

    // Generate sizes
    const sizes = [
        { name: 'bodhi-icon-32.png', size: 32 },
        { name: 'bodhi-icon-180.png', size: 180 },
        { name: 'bodhi-icon-192.png', size: 192 },
        { name: 'bodhi-icon-512.png', size: 512 },
    ];

    for (const s of sizes) {
        await square.clone().resize(s.size, s.size).png().toFile(path.join(outputDir, s.name));
        console.log('OK', s.name, s.size + 'x' + s.size);
    }

    console.log('\nDone!');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
