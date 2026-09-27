const { cmd } = require('../command');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

/*
 * SAVE STATUS COMMAND
 * -----------------------------------------------------------
 * Usage: Reply to a WhatsApp status with:
 *     .save
 *
 * This version tries MULTIPLE strategies automatically to
 * find and download the media, since we don't have access to
 * your framework's exact `quoted` object shape. If everything
 * fails, it replies with the actual debug info directly in
 * WhatsApp chat (no server log access needed).
 * -----------------------------------------------------------
 */

async function streamToBuffer(stream) {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

// client.user.id often looks like "947XXXXXXXX:12@s.whatsapp.net" (device
// suffix included). Sending to that exact JID can silently fail to deliver
// to your visible chat. Strip the device part to get the real self-JID.
function getSelfJid(client) {
    const raw = client.user?.id || client.user?.jid || '';
    const number = raw.split(':')[0].split('@')[0];
    return number ? `${number}@s.whatsapp.net` : raw;
}

// Try every known shape/strategy until one works
async function trySaveMedia(quoted, mediaKey) {
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

    // Build a list of candidate raw-media-message objects to try with downloadContentFromMessage
    const candidates = [
        { label: 'quoted.message?.[type]', val: quoted.message?.[mediaKey + 'Message'] },
        { label: 'quoted[type]', val: quoted[mediaKey + 'Message'] },
        { label: 'quoted.msg', val: quoted.msg },
        { label: 'quoted.message', val: quoted.message },
        { label: 'quoted (raw)', val: quoted },
    ].filter(c => c.val);

    for (const c of candidates) {
        try {
            const stream = await downloadContentFromMessage(c.val, mediaKey);
            const buf = await streamToBuffer(stream);
            if (buf && buf.length > 0) return { buffer: buf, strategy: c.label };
            attempts.push(`${c.label} -> empty buffer`);
        } catch (e) {
            attempts.push(`${c.label} -> ${e.message}`);
        }
    }

    return { buffer: null, attempts };
}

cmd({
    pattern: 'save',
    alias: ['savestatus', 'sstatus'],
    react: '💾',
    desc: 'Save a replied WhatsApp status to your own chat',
    category: 'whatsapp',
    filename: __filename
}, async (client, message, m, { from, quoted, reply }) => {
    try {
        if (!quoted) {
            return reply('*Status ekakta reply wela ".save" liyanna.*');
        }

        const type = quoted.mtype || quoted.type || Object.keys(quoted.message || {})[0] || '';

        // Plain text status
        if (type === 'conversation' || type === 'extendedTextMessage') {
            const text = quoted.text || quoted.body || '';
            await client.sendMessage(getSelfJid(client), {
                text: `💾 *Saved Status*\n\n${text}`
            });
            return reply('✅ Status eka save karala inbox ekata dana. Balanna!');
        }

        const mediaKey = type.replace('Message', ''); // image | video | audio
        if (!['image', 'video', 'audio'].includes(mediaKey)) {
            return reply(`*Meka support karana status type ekak nemei.*\n\nDebug info: mtype = "${type}"`);
        }

        const result = await trySaveMedia(quoted, mediaKey);

        if (!result.buffer) {
            // No server log needed - dump the debug info straight into the WhatsApp reply
            const debugText = (result.attempts || []).join('\n');
            return reply(
                `*Status eka save karanna baa una.*\n\n` +
                `Debug info (mtype: ${type}):\n${debugText}\n\n` +
                `Mee message eka copy karala apita denna.`
            );
        }

        const payload = { [mediaKey]: result.buffer };
        if (mediaKey === 'image' || mediaKey === 'video') {
            payload.caption = quoted.text || quoted.caption || '';
        }

        await client.sendMessage(getSelfJid(client), payload);
        reply(`✅ Status eka save karala inbox ekata dana. Balanna! (via ${result.strategy})`);
    } catch (e) {
        console.log(e);
        reply(`*Status eka save karanna baa una.*\n\nError: ${e.message}`);
    }
});

