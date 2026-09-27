const { cmd } = require('../command');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

/*
 * VIEW-ONCE SAVER COMMAND
 * -----------------------------------------------------------
 * Usage: Reply to a "view once" photo/video with:
 *     .vv
 *
 * Tries multiple strategies automatically. If it fails, it
 * replies with debug info directly in WhatsApp chat so you
 * don't need server log access.
 * -----------------------------------------------------------
 */

async function streamToBuffer(stream) {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

function unwrapViewOnce(msgContent) {
    if (!msgContent) return msgContent;
    if (msgContent.viewOnceMessage) return msgContent.viewOnceMessage.message;
    if (msgContent.viewOnceMessageV2) return msgContent.viewOnceMessageV2.message;
    if (msgContent.viewOnceMessageV2Extension) return msgContent.viewOnceMessageV2Extension.message;
    return msgContent;
}

async function tryViewOnce(quoted) {
    const attempts = [];

    // Strategy 1: quoted already has a working .download() method
    if (typeof quoted.download === 'function') {
        try {
            const buf = await quoted.download();
            if (buf && buf.length > 0) return { buffer: buf, strategy: 'quoted.download()' };
            attempts.push('quoted.download() returned empty buffer');
        } catch (e) {
            attempts.push('quoted.download() failed: ' + e.message);
        }
    }

    // Gather candidate "message content" objects, then unwrap view-once container from each
    const rawCandidates = [quoted.message, quoted.msg, quoted].filter(Boolean);

    for (const raw of rawCandidates) {
        const unwrapped = unwrapViewOnce(raw);
        if (!unwrapped || typeof unwrapped !== 'object') continue;

        const type = Object.keys(unwrapped).find(k =>
            ['imageMessage', 'videoMessage', 'audioMessage'].includes(k)
        );
        if (!type) {
            attempts.push(`candidate had no image/video/audio key (keys: ${Object.keys(unwrapped).join(', ')})`);
            continue;
        }

        const mediaKey = type.replace('Message', '');
        try {
            const stream = await downloadContentFromMessage(unwrapped[type], mediaKey);
            const buf = await streamToBuffer(stream);
            if (buf && buf.length > 0) return { buffer: buf, mediaKey, strategy: `unwrap -> ${type}` };
            attempts.push(`${type} -> empty buffer`);
        } catch (e) {
            attempts.push(`${type} -> ${e.message}`);
        }
    }

    return { buffer: null, attempts };
}

cmd({
    pattern: 'vv',
    alias: ['viewonce', 'reveal'],
    react: '👁️',
    desc: 'Save a replied view-once photo/video to your own chat',
    category: 'whatsapp',
    filename: __filename
}, async (client, message, m, { from, quoted, reply }) => {
    try {
        if (!quoted) {
            return reply('*View once photo/video ekakta reply wela ".vv" liyanna.*');
        }

        const result = await tryViewOnce(quoted);

        if (!result.buffer) {
            const debugText = (result.attempts || []).join('\n');
            return reply(
                `*View once media eka save karanna baa una.*\n\n` +
                `Debug info:\n${debugText}\n\n` +
                `Mee message eka copy karala apita denna.`
            );
        }

        const payload = { [result.mediaKey]: result.buffer };
        if (result.mediaKey === 'image' || result.mediaKey === 'video') {
            payload.caption = '👁️ *View Once - Revealed*';
        }

        await client.sendMessage(client.user.id, payload);
        reply(`✅ View once media eka save karala inbox ekata dana. Balanna! (via ${result.strategy})`);
    } catch (e) {
        console.log(e);
        reply(`*View once media eka save karanna baa una.*\n\nError: ${e.message}`);
    }
});

