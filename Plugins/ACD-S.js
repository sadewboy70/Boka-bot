const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Temp folder
const TMP = path.join(__dirname, '../tmp');
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

// Image â†’ WebP sticker
function imageToSticker(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white@0',
                '-vcodec', 'libwebp',
                '-lossless', '1',
                '-qscale', '100',
                '-preset', 'default',
                '-loop', '0',
                '-an',
                '-vsync', '0'
            ])
            .format('webp')
            .on('end', resolve)
            .on('error', reject)
            .save(outputPath);
    });
}

// Video/GIF â†’ Animated WebP sticker
function videoToSticker(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .inputOptions(['-t', '10'])
            .outputOptions([
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white@0,fps=15',
                '-vcodec', 'libwebp',
                '-lossless', '0',
                '-qscale', '70',
                '-preset', 'default',
                '-loop', '0',
                '-an',
                '-vsync', '0'
            ])
            .format('webp')
            .on('end', resolve)
            .on('error', reject)
            .save(outputPath);
    });
}

cmd({
    pattern: 'sticker1',
    alias: ['s', 'stiker', 'sti'],
    desc: 'Image/Video/GIF sticker à·„à¶¯à¶±à·€à·',
    category: 'fun',
    react: 'ðŸŽ­',
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // m.quoted object à¶‘à¶š check à¶šà¶»à¶±à·€à· (msg.js structure à¶‘à¶šà¶§ match)
        const isQuoted = m.quoted && m.quoted.msg;
        const qType = isQuoted ? m.quoted.type : null;

        const isImage = qType === 'imageMessage';
        const isVideo = qType === 'videoMessage';

        if (!isImage && !isVideo) {
            return reply('ðŸ“Œ *Image, Video à·„à· GIF à¶‘à¶šà¶§ reply à¶šà¶»à¶½à· .sticker à¶¯à·à¶±à·Šà¶±!*');
        }

        await reply('â³ Sticker à·„à¶¯à¶±à·€à·...');

        const rand = Date.now();
        let buffer, inputPath, outputPath;

        // m.quoted.download() - msg.js à¶‘à¶šà·š à¶¯à·à¶½à· à¶­à·’à¶ºà·™à¶±à·€à·
        if (isImage) {
            buffer = await m.quoted.download();
            inputPath  = path.join(TMP, `${rand}.jpg`);
            outputPath = path.join(TMP, `${rand}.webp`);
            fs.writeFileSync(inputPath, buffer);
            await imageToSticker(inputPath, outputPath);
        } else {
            buffer = await m.quoted.download();
            inputPath  = path.join(TMP, `${rand}.mp4`);
            outputPath = path.join(TMP, `${rand}.webp`);
            fs.writeFileSync(inputPath, buffer);
            await videoToSticker(inputPath, outputPath);
        }

        const stickerBuffer = fs.readFileSync(outputPath);

        await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });

        // Cleanup
        try { fs.unlinkSync(inputPath); } catch(_) {}
        try { fs.unlinkSync(outputPath); } catch(_) {}

    } catch (e) {
        console.error('[STICKER ERROR]', e);
        reply(`âŒ Error: ${e.message}`);
    }
});
