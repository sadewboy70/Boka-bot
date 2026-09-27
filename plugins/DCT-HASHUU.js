const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');
const axios = require("axios");

cmd({
    pattern: "hashan",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // Fake Contact Card for quoting
        const number = "94704896880";
        const jid = number + "@s.whatsapp.net";

        let thumb = Buffer.from([]);
        try {
            const ppUrl = await conn.profilePictureUrl(jid, "image");
            const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
            thumb = Buffer.from(ppResp.data, "binary");
        } catch (err) {
            console.log("❗ Couldn't fetch profile picture:", err.message);
        }

        const contactCard = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "WHITESHADOW AI ✨",
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:WHITESHADOW AI ✨
ORG:WHITESHADOW
TEL;type=CELL;type=VOICE;waid=${number}:+94 70 489 6880
END:VCARD`,
                    jpegThumbnail: thumb
                }
            }
        };

        const status = `
╭───────────────◉
│ *🤖 ${config.BOT_NAME || 'HASHAN-MD'} STATUS*
├───────────────◉
│✨ Bot is Active & Online!
│🧠 Owner: ${config.OWNER_NAME}
│⚡ Version: 4.0.0
│📝 Prefix: [${config.PREFIX}]
│📳 Mode: [${config.MODE}]
│💾 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖥️ Host: ${os.hostname()}
│⌛ Uptime: ${runtime(process.uptime())}
╰────────────────◉
> POWERED BY DCT MINI

*Reply with:*
1️⃣ Ping
2️⃣ Menu
`;

        // Video Note first
        await conn.sendMessage(from, {
            video: { url: "https://i.ibb.co/YBtjMpQx/1ed923b3376b.jpg" },
            mimetype: 'video/mp4',
            ptv: true
        }, { quoted: contactCard });

        // Alive status message
        await conn.sendMessage(from, {
            image: { url: "https://i.ibb.co/YBtjMpQx/1ed923b3376b.jpg" },
            caption: status,
            footer: `© HASHAN 2025`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363397446799567@newsletter',
                    newsletterName: '👾ᏔᎻᎥᏆᎬՏᎻᎪᎠᎾᏇ ᎷᎠ👾',
                    serverMessageId: 143
                }
            }
        }, { quoted: contactCard });

        // Voice (playable audio)
        await conn.sendMessage(from, {
            audio: { url: "https://files.catbox.moe/6figid.mp3" },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: contactCard });

        // Wait for reply (Ping/Menu)
        const filter = (message) => {
            if (!message.message) return false;
            if (message.key.remoteJid !== from) return false;
            if (message.key.fromMe) return false;
            const text = message.message.conversation || message.message.extendedTextMessage?.text || "";
            return ["1", "2"].includes(text.trim());
        };

        const replyMsg = await new Promise((resolve) => {
            const handler = (chatUpdate) => {
                const msg = chatUpdate.messages[0];
                if (filter(msg)) {
                    conn.ev.off('messages.upsert', handler);
                    resolve(msg);
                }
            };
            conn.ev.on('messages.upsert', handler);
            setTimeout(() => {
                conn.ev.off('messages.upsert', handler);
                resolve(null);
            }, 30000);
        });

        if (!replyMsg) return;

        const replyText = (replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text).trim();

        if (replyText === "1") {
            await reply("🏓 Pong! Bot is alive.");
        } else if (replyText === "2") {
            // trigger menu command manually
            const fakeMek = { ...replyMsg, body: `${config.PREFIX}menu` };
            conn.ev.emit("messages.upsert", { messages: [fakeMek], type: "notify" });
        }

    } catch (err) {
        console.error("❌ Alive cmd error:", err);
        reply("❌ Error in alive command: " + err.message);
    }
});
