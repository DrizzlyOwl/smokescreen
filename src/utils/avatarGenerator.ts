/**
 * Deterministic bitmap avatar generator for SMOKESCREEN.
 * Generates a pixelated 8x8 identicon based on a username hash.
 */

const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
};

const intToRGB = (i: number): string => {
    const c = (i & 0x00ffffff).toString(16).toUpperCase();
    return '00000'.substring(0, 6 - c.length) + c;
};

export const generateBitmapAvatar = (username: string): string => {
    const hash = hashCode(username);
    const color = `#${intToRGB(hash)}`;
    
    // Create a small 8x8 canvas
    const size = 8;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // Background is transparent or very dark
    ctx.clearRect(0, 0, size, size);
    
    // Fill the grid based on hash bits
    ctx.fillStyle = color;
    
    // We only fill half the grid and mirror it for that "identicon" look
    for (let x = 0; x < size / 2; x++) {
        for (let y = 0; y < size; y++) {
            // Use the hash to decide if this pixel is filled
            // We use different bits for each pixel
            const bit = (hash >> (x * size + y)) & 1;
            if (bit) {
                // Draw pixel and its mirrored counterpart
                ctx.fillRect(x, y, 1, 1);
                ctx.fillRect(size - 1 - x, y, 1, 1);
            }
        }
    }
    
    // Return as a high-quality data URL
    // We use image/png for clean pixel edges
    return canvas.toDataURL('image/png');
};
