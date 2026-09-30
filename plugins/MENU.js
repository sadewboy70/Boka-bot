const { cmd, commands } = require("../command");
const config = require("../config");

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
    return `${d}d ${h}h ${m}m ${s}s`;
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
    "8": { title: "🎉 FUN & GAMES", items: ["animegirl1", "joke", "veryjoke", "quote", "fact", "8ball", "truth", "dare", "ship", "hug", "kiss", "slap", "roast", "compliment", "roll", "flip", "pick", "rate", "meme", "laugh", "cry", "angry", "love", "sleep", "happy", "magic", "loli", "dog", "cat", "fox", "hack", "y3prank", "yprank", "tik", "igprank", "fbprank", "avatar", "dick", "gayrate", "simp", "waifu", "neko", "process", "adarey", "sticker1", "tictactoe", "hangman", "rps", "slots", "boom", "zombie", "lie", "slime", "scary", "secret", "egg", "friend", "day", "shuffle", "bodytemp", "myanimal", "myjob", "wealth", "coffee", "color", "smoke", "lines"] },
    "9": { title: "💎 PREMIUM CMDS", items: ["buypremium", "vipinfo", "setvip", "removevip"] },
    "10": { title: "🔞 NSFW MENU", items: ["nsfw", "rule34", "hentai", "xvideos", "pornhub"] }
};

function buildCategoryText(key) {
    const cat = categories[key];
    if (!cat) return "❌ Invalid Option";
    const lines = cat.items.map(c => ` ➲ ${config.PREFIX || '.'}${c}`).join("\n");
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
        const slDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Colombo', year: 'numeric', month: 'long', day: 'numeric' });
        const slTimeNow = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const uptime = formatUptime(process.uptime());
        const totalCmds = commands.length;
        const randomImg = menuImages[Math.floor(Math.random() * menuImages.length)];
        const botName = config.BOT_NAME || "SADEW-MD-MINI";

        const menuText = `
┏━━━━━━ 🤖 ${botName} 🤖 ━━━━━━┓
┃
┃ 👤 User   : ${pushname}
┃ 🔖 Mode   : Public
┃ 📅 Date   : ${slDate}
┃ ⏰ Time   : ${slTimeNow}
┃ ⚡ Uptime : ${uptime}
┃ 📦 Cmds   : ${totalCmds}
┃ 🔰 Prefix : ${prefix}
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛

╭─────『 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄𝐒 』─────
│ 1️⃣ 📥 Download Menu
│ 2️⃣ 🧠 AI Commands
│ 3️⃣ 👥 Group Manage
│ 4️⃣ ⚙️ Admin Menu
│ 5️⃣ 🔧 Tools & Edits
│ 6️⃣ 👑 Owner Area
│ 7️⃣ 📁 Other Cmds
│ 8️⃣ 🎉 Fun & Games
│ 9️⃣ 💎 Premium Menu
│ 🔟 🔞 NSFW Menu
╰──────────────────────────

> 📌 Reply with a number (1-10) or click the buttons below.
> 💫 Powered by Sadew Rashmika
`;

        // Setting up interactive buttons (WhatsApp UI natively supports max 3-5 standard buttons, but using standard template for 10)
        let buttonMessage = {
            image: { url: randomImg },
            caption: menuText,
            footer: "S A D E W - M I N I",
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

        // Note: For 10 options, standard WhatsApp limits buttons to 3. 
        // We will send the menu and listen for the reply number just like before, which works 100% on all modified/standard WA versions.
        const sentMsg = await conn.sendMessage(from, buttonMessage, { quoted: mek });
        const messageID = sentMsg.key.id;

        const listener = async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message) return;

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const replyId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;

            if (replyId !== messageID) return;

            const categoryNum = (text || "").trim();
            if (categories[categoryNum]) {
                const txt = buildCategoryText(categoryNum);
                const nextRandomImg = menuImages[Math.floor(Math.random() * menuImages.length)];

                await conn.sendMessage(from, {
                    image: { url: nextRandomImg },
                    caption: txt,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363395674230271@newsletter",
                            newsletterName: "SADEW - MD - MINI",
                            serverMessageId: 1
                        }
                    }
                }, { quoted: msg });
            }
        };

        conn.ev.on("messages.upsert", listener);

    } catch (e) {
        console.log(e);
    }
});
