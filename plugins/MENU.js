const config = require('../config');
const { cmd, commands } = require('../command');
const moment = require('moment-timezone');

// Random images list (ඔයා දුන්න පින්තූර ටික)
const menuImages = [
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783328021/zanta_media_uploads/tnuazopka24oahpvh3mc.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783327996/zanta_media_uploads/vfq2mrf2hwkzhjerc3zz.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783327966/zanta_media_uploads/nca5y1t1fl5klruuxehp.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783328043/zanta_media_uploads/d0svlrulezrpif4mfl9w.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1780590033/zanta_media_uploads/dttqjshprca9zvqcpbwg.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783328053/zanta_media_uploads/mtifkjupz6kvdistsqit.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783332950/zanta_media_uploads/sxkybgfhhi5gtkqsns2z.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783332958/zanta_media_uploads/yxtvp8zwoju8xsvghzr7.jpg'
];

// Helper to get runtime format (Small format)
function formatUptime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    let dDisplay = d > 0 ? `${d}ᴅ ` : "";
    let hDisplay = h > 0 ? `${h}ʜ ` : "";
    let mDisplay = m > 0 ? `${m}ᴍ` : "0ᴍ";
    return dDisplay + hDisplay + mDisplay;
}

// ── NEW CLEAN CATEGORIES (No heavy big-bot cmds) ──
const categories = {
    "1": { title: "📥 ᴅᴏᴡɴʟᴏᴀᴅꜱ", items: ["song", "video", "tiktok", "facebook", "insta", "gdrive", "mediafire"] },
    "2": { title: "🧠 ᴀɪ ꜰᴇᴀᴛᴜʀᴇꜱ", items: ["ai", "chatgpt", "gemini", "ask", "imagine"] },
    "3": { title: "👥 ɢʀᴏᴜᴘ ᴍᴇɴᴜ", items: ["kick", "add", "promote", "demote", "tagall", "hidetag", "link"] },
    "4": { title: "⚙️ ᴀᴅᴍɪɴ ᴏɴʟʏ", items: ["mute", "unmute", "lock", "unlock", "setname", "setdesc"] },
    "5": { title: "🔧 ᴛᴏᴏʟꜱ ᴍᴇɴᴜ", items: ["sticker", "styletext", "qr", "translate", "length", "weather"] },
    "6": { title: "👑 ᴏᴡɴᴇʀ ᴢᴏɴᴇ", items: ["restart", "block", "unblock", "setprefix", "eval", "broadcast"] },
    "7": { title: "🧩 ꜰᴜɴ & ɢᴀᴍᴇꜱ", items: ["ship", "love", "slap", "hug", "hack", "truth", "dare", "friend"] },
    "8": { title: "🖼️ ᴡᴀʟʟᴘᴀᴘᴇʀꜱ", items: ["pinterest", "wallpaper", "animepic", "dog", "cat"] },
    "9": { title: "🎬 ᴍᴏᴠɪᴇ ꜱᴇᴀʀᴄʜ", items: ["movie", "imdb", "series", "sinhalasub"] },
    "10": { title: "🔊 ᴠᴏɪᴄᴇ ᴍᴇɴᴜ", items: ["tts", "voice", "sing", "audio"] }
};

function buildCategoryText(key, prefix) {
    const cat = categories[key];
    if (!cat) return "❌ ɪɴᴠᴀʟɪᴅ ᴏᴘᴛɪᴏɴ";
    const lines = cat.items.map(c => ` ◦ ${prefix}${c}`).join("\n");
    return `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ ${cat.title}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
${lines}

> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0 🎐`;
}

cmd({
    pattern: "menu",
    react: "🫧",
    desc: "Aesthetic Mini Menu",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, pushname, prefix }) => {
    try {
        // Sri Lanka Date & Time Setup
        const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
        const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');
        
        const uptime = formatUptime(process.uptime());
        const totalCmds = commands.length;
        const randomImg = menuImages[Math.floor(Math.random() * menuImages.length)];
        const mode = config.MODE || "ᴘᴜʙʟɪᴄ";

        // 🟢 AESTHETIC SMALL-CAPS MENU DESIGN 🟢
        const menuText = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ 🎐 ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴍᴅ 🎐
┊
┊ 🪽 ᴜꜱᴇʀ : ${pushname}
┊ ☁️ ᴍᴏᴅᴇ : ${mode}
┊ ❄️ ᴅᴀᴛᴇ : ${slDate}
┊ ⏱️ ᴛɪᴍᴇ : ${slTimeNow}
┊ ⚡ ᴜᴘᴛɪᴍᴇ : ${uptime}
┊ 🧩 ᴄᴍᴅꜱ : ${totalCmds}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

> ᴛᴀᴘ ᴀ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ ᴛᴏ ᴠɪᴇᴡ ᴄᴏᴍᴍᴀɴᴅꜱ ⬇️`;

        // Generate Type 1 Buttons for all 10 categories (Supported by @dnuzi)
        const menuButtons = Object.entries(categories).map(([num, cat]) => {
            return {
                buttonId: num, 
                buttonText: { displayText: cat.title },
                type: 1
            };
        });

        const buttonMessage = {
            image: { url: randomImg },
            caption: menuText,
            footer: "🌸 ꜱ ᴀ ᴅ ᴇ ᴡ - ᴍ ɪ ɴ ɪ 🌸",
            buttons: menuButtons,
            headerType: 4,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363395674230271@newsletter",
                    newsletterName: "ꜱ ᴀ ᴅ ᴇ ᴡ - ᴍ ɪ ɴ ɪ",
                    serverMessageId: 1
                }
            }
        };

        const sentMsg = await conn.sendMessage(from, buttonMessage, { quoted: mek });
        const messageID = sentMsg.key.id;

        // 🟢 LISTENER FOR BUTTON CLICKS OR TEXT REPLIES 🟢
        const listener = async ({ messages }) => {
            const replyMsg = messages[0];
            if (!replyMsg.message) return;

            let text = "";
            if (replyMsg.message.buttonsResponseMessage) {
                text = replyMsg.message.buttonsResponseMessage.selectedButtonId;
            } else if (replyMsg.message.templateButtonReplyMessage) {
                text = replyMsg.message.templateButtonReplyMessage.selectedId;
            } else {
                text = replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text;
            }

            const replyId = replyMsg.message.extendedTextMessage?.contextInfo?.stanzaId || 
                            replyMsg.message.buttonsResponseMessage?.contextInfo?.stanzaId ||
                            replyMsg.message.templateButtonReplyMessage?.contextInfo?.stanzaId;

            if (replyId !== messageID) return;

            const categoryNum = (text || "").trim();
            if (categories[categoryNum]) {
                const txt = buildCategoryText(categoryNum, prefix);
                const nextRandomImg = menuImages[Math.floor(Math.random() * menuImages.length)];

                await conn.sendMessage(from, {
                    image: { url: nextRandomImg },
                    caption: txt,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: replyMsg });
            }
        };

        conn.ev.on("messages.upsert", listener);

    } catch (e) {
        console.log(e);
    }
});
