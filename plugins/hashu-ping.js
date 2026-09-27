const { cmd } = require('../command');

/*
 * PING COMMAND
 * -----------------------------------------------------------
 * Usage: .ping
 *
 * Sends "Testing Ping" first, then EDITS that same message
 * (using Baileys message-edit) to show the actual speed.
 * Needs a reasonably recent @whiskeysockets/baileys version
 * that supports message edits (yours does, since it's pulled
 * straight from the GitHub repo in your package.json).
 * -----------------------------------------------------------
 */

cmd({
    pattern: 'ping',
    alias: ['speed'],
    react: '⚡',
    desc: 'Check bot response speed',
    category: 'main',
    filename: __filename
}, async (client, message, m, { from, reply }) => {
    try {
        const start = Date.now();

        const sent = await client.sendMessage(from, { text: '```Testing Ping```' }, { quoted: message });

        const speed = Date.now() - start;

        await client.sendMessage(from, {
            text: `⚡ *Ping: ${speed} ms*`,
            edit: sent.key
        });
    } catch (e) {
        console.log(e);
        reply(`*Ping command eka run karanna baa una.*\n\nError: ${e.message}`);
    }
});
