const config = require('../config');
const { cmd, commands } = require('../command');
const moment = require('moment-timezone');

// Random images list
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

// Helper to get runtime format
function formatUptime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    let dDisplay = d > 0 ? `${d}d ` : "";
    let hDisplay = h > 0 ? `${h}h ` : "";
    let mDisplay = m > 0 ? `${m}m ` : "";
    let sDisplay = s > 0 ? `${s}s` : "0s";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

// ── ALL COMMANDS, GROUPED INTO CATEGORIES ──
const categories = {
    "1": { title: "📥 DOWNLOAD MENU", items: ["tiktok", "fb", "song", "video", "ig", "yt", "ysprank", "sublk", "twitter", "xnxx", "xndl", "apk", "cinesubz", "cinesubz2", "play", "paper", "pdl", "gitclone", "movie", "thenkiri", "cartoon", "cinetv", "lyrics", "ytchannel", "ttsearch", "pinterest", "sitecode", "getdp", "imgurl", "steal"] },
    "2": { title: "🧠 AI COMMANDS", items: ["ai", "athal", "aiimg2", "translate", "img", "meta", "sticker", "toimg", "toaudio", "toptt", "anime0", "anime", "manga", "waifupic"] },
    "3": { title: "👥 GROUP MANAGE", items: ["kick", "kick2", "add", "del", "invite", "warn", "jid", "forward", "tagall", "setpp", "admins", "promote", "demote", "unmute", "open", "close", "mute", "revoke", "link", "grouplink", "setsubject", "setdesc", "groupinfo", "ginfo", "gstatus", "online", "poll", "vote", "presults", "pclose", "antilink"] },
    "4": { title: "⚙️ ADMIN MENU", items: ["save", "listsave", "broadcast", "block", "unblock", "blockall", "pp", "restart", "shutdown", "eval", "setvar", "getvar", "grouplist", "leave", "setname", "setbio", "botinfo", "clearchat", "getcontact", "anticall", "kickall", "settings", "mode", "autoreact", "autostatus", "autotyping", "antidelete", "welcome", "goodbye", "autoblock", "statusreply", "setprefix", "setlogo", "setalivemsg", "setwelcomemsg", "setgoodbyemsg", "setstatusreply", "blacklist", "areply"] },
    "5": { title: "🔧 TOOLS & EDITS", items: ["say", "repeat", "upper", "lower", "reverse", "length", "count", "b64enc", "b64dec", "binary", "hex", "md5", "sha1", "sha256", "sha384", "sha512", "md4", "ripemd", "hmac", "crc32", "urlenc", "urldec", "escape", "unescape", "jsonparse", "jsonstring", "base64url", "hexdump", "binarydump", "ascii", "charcode", "unicode", "random", "mock", "clap", "vowel", "leet", "fliptext", "space", "zalgo", "fancy", "lenny", "shrug", "removebg", "enhance", "colour", "timer", "remind", "note", "getnote", "delnote", "afk", "titlecase", "camelcase", "snakecase", "kebabcase", "removeemoji", "removenum", "removespace", "dupline", "sortline", "revline", "swapcase", "strikethru", "underline", "wide", "smallcaps", "bubble", "square", "mirror", "zigzag", "usee", "qr", "short", "password"] },
    "6": { title: "👑 OWNER AREA", items: ["owner", "system", "report", "whois", "srepo"] },
    "7": { title: "📁 OTHER CMDS", items: ["weather", "quran", "bible", "sqrt", "pow", "sin", "cos", "tan", "log", "ln", "abs", "ceil", "floor", "round", "gcd", "lcm", "prime", "fib", "avg", "sum", "min", "max", "epoch", "isotime", "utc", "timezone", "timezoneconv", "weekday", "month", "year", "leap", "daynum", "weeknum", "addday", "subday", "diffday", "timestamp", "countdown", "age", "daylight", "millis", "seconds"] },
    "8": { title: "🎵 SONG & MUSIC", items: ["song", "music", "mp3", "audio", "lyrics", "playlist"] },
    "9": { title: "🖼️ AI IMAGE MENU", items: ["dalle", "pixabay", "picsum", "flickr", "dog", "cat", "bingimg"] },
    "10": { title: "🎬 TV SERIES & MOVIES", items: ["cinesubz", "cinesubz2", "tv", "movielk", "moviepro", "sinhalasub", "kdrama", "sublk", "hanime", "cinesend", "bais"] }
};

function buildCategoryText(key, prefix) {
    const cat = categories[key];
    if (!cat) return "❌ Invalid Option";
    const lines = cat.items.map(c => ` ➲ ${prefix}${c}`).join("\n");
    return `
╭───❖《 ${cat.title} 》❖───
${lines}
╰───────────────────`;
}

cmd({
    pattern: "menu",
    react: "🚀",
    desc: "Interactive Bot Menu",
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
        const botName = config.BOT_NAME || "SADEW-MD-MINI";
        const mode = config.MODE || "public";

        const menuText = `┌──⟡ 🤖  ⟡ ꜱ ᴀ ᴅ ᴇ ᴡ - ᴍ ɪ ɴ ɪ ⟡  ⟡──
┊
┠⪼✿ ✦ 👤 𝙽𝙰𝙼𝙴   : ${pushname}
┠⪼✿ ✦ 🔖 𝙼𝙾𝙳𝙴   : ${mode}
┠⪼✿ ✦ 📅 𝙳𝙰𝚃𝙴   : ${slDate}
┠⪼✿ ✦ ⏰ 𝚃𝙸𝙼𝙴   : ${slTimeNow}
┠⪼✿ ✦ ⚡ 𝚄𝙿𝚃𝙸𝙼𝙴 : ${uptime}
┠⪼✿ ✦ 📦 𝙿𝙻𝚄𝙶𝙸𝙽𝚂: 𝙲𝙼𝙳 = ${totalCmds}
┠⪼✿ ✦ 🔰 𝙿𝚁𝙴𝙵𝙸𝚇 : ${prefix}
┊
└──⟡ ━━━━━━━━━━━━━━━━ ⟡
┏━━━━『 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝙸𝙴𝚂 』━━━━━
┣⪼ ❖ 1.  📥 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙼𝙴𝙽𝚄
┣⪼ ❖ 2.  🧠 𝙰𝙸 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂
┣⪼ ❖ 3.  👥 𝙶𝚁𝙾𝚄𝙿 𝙼𝙰𝙽𝙰𝙶𝙴
┣⪼ ❖ 4.  ⚙️ 𝙰𝙳𝙼𝙸𝙽 𝙼𝙴𝙽𝚄
┣⪼ ❖ 5.  🔧 𝚃𝙾𝙾𝙻𝚂 & 𝙴𝙳𝙸𝚃𝚂
┣⪼ ❖ 6.  👑 𝙾𝚆𝙽𝙴𝚁 𝙰𝚁𝙴𝙰
┣⪼ ❖ 7.  📁 𝙾𝚃𝙷𝙴𝚁 𝙲𝙼𝙳𝚂
┣⪼ ❖ 8.  🎵 𝚂𝙾𝙽𝙶 & 𝙼𝚄𝚂𝙸𝙲
┣⪼ ❖ 9.  🖼️ 𝙰𝙸 𝙸𝙼𝙰𝙶𝙴 𝙼𝙴𝙽𝚄
┣⪼ ❖ 10. 🎬 𝚃𝚅 𝚂𝙴𝚁𝙸𝙴𝚂 & 𝙼𝙾𝚅𝙸𝙴𝚂
┗━━━━━━━━━━━━━━━━━━━━━━━━━
⊱ ─────── { 𑁍 } ─────── ⊰
╰┈⪼ 𝚁𝙴𝙿𝙻𝚈 𝚆𝙸𝚃𝙷 𝙰 𝙽𝚄𝙼𝙱𝙴𝚁 (1-10) 𝙾𝚁 𝚃𝙰𝙿 𝙰 𝙱𝚄𝚃𝚃𝙾𝙽 ⪻
⊱ ─────── { 𑁍 } ─────── ⊰
╰┈⪼ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈🔮 ⟡ ꜱ ᴀ ᴅ ᴇ ᴡ - ᴍ ɪ ɴ ɪ ⟡ 🔮⪻
⊱ ─────── { 𑁍 } ─────── ⊰`;

        // 🟢 NATIVE BUTTON GENERATOR 🟢
        // @dnuzi/baileys වලට Support කරන විදිහට Type 1 Buttons 10ම හදනවා.
        const menuButtons = Object.entries(categories).map(([num, cat]) => {
            return {
                buttonId: num, // Button ID එක Category අංකයමයි (1, 2, 3...)
                buttonText: { displayText: cat.title },
                type: 1
            };
        });

        const buttonMessage = {
            image: { url: randomImg },
            caption: menuText,
            footer: "🔮 ⟡ ꜱ ᴀ ᴅ ᴇ ᴡ - ᴍ ɪ ɴ ɪ ⟡ 🔮",
            buttons: menuButtons,
            headerType: 4,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363395674230271@newsletter",
                    newsletterName: "SADEW - MD - MINI",
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

            // Check if it's a Button Reply or a Text Reply
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

            // Optional: Message ID එකටම Reply කරලා තියෙනවද බලන්න
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
