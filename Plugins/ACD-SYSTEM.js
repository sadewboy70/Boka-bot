const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const axios = require("axios");
const config = require('../config');

cmd({
    pattern: "system",
    alias: ["status", "sys"],
    desc: "Check bot system status",
    category: "main",
    react: "🖥️",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // --- Contact Card ---
        const number = "13135550002";
        const jid = number + "@s.whatsapp.net";
        let thumb = Buffer.from([]);
        try {
            const ppUrl = await conn.profilePictureUrl(jid, "image");
            const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
            thumb = Buffer.from(ppResp.data, "binary");
        } catch (err) {}

        const sysBotName = config.BOT_NAME || 'DCT AI';
        const contactCard = {
            key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: "status@broadcast" },
            message: {
                contactMessage: {
                    displayName: `${sysBotName} ✨`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${sysBotName} ✨\nORG:MRHASHU\nTEL;type=CELL;type=VOICE;waid=${number}:+94 70 489 6880\nEND:VCARD`,
                    jpegThumbnail: thumb
                }
            }
        };

        // --- Data ---
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(2);
        const uptime = runtime(process.uptime());

        // --- Design ---
        const sysText = `╭───────────────◉
│ *🖥️ 𝐃𝐂𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎*
├───────────────◉
│ 📡 *𝗦𝗧𝗔𝗧𝗨𝗦:* 𝗢𝗡𝗟𝗜𝗡𝗘 🚀
│ ⏳ *𝗨𝗣𝗧𝗜𝗠𝗘:* ${uptime}
│ 💾 *𝗥𝗔𝗠 𝗨𝗦𝗔𝗚𝗘:* ${ramUsed}MB / ${ramTotal}MB
│ 👤 *𝗨𝗦𝗘𝗥:* @${m.sender.split('@')[0]}
│ ⚙️ *𝗠𝗢𝗗𝗘:* 𝗣𝗨𝗕𝗟𝗜𝗖
├───────────────◉
│ ✨ *𝗨𝗟𝗧𝗥𝗔 𝗙𝗔𝗦𝗧 𝗪𝗔 𝗕𝗢𝗧*
╰────────────────◉

> ⚡ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`;

        // --- Send ---
        await conn.sendMessage(from, {
            text: sysText,
            mentions: [m.sender],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363395674230271@newsletter',
                    newsletterName: '𝐃𝐂𝐓-𝐕2 𝐌𝐈𝐍𝐈',
                    serverMessageId: 143
                }
            }
        }, { quoted: contactCard });

    } catch (err) {
        console.error("❌ System cmd error:", err);
        reply("❌ Error: " + err.message);
    }
});
