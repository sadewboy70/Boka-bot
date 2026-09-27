const { cmd } = require("../command");
const config = require("../config");

const menuImage =
  config.MENU_IMAGE ||
  "https://res.cloudinary.com/dqlh378fb/image/upload/v1783510834/zanta_media_uploads/mldt5kbczjommux9p7la.jpg";

// ── ALL COMMANDS, GROUPED INTO 8 CATEGORIES ──
const categories = {
    "1": {
        title: "*📥 𝗗𝗟 𝗖𝗠𝗗𝗦 & 𝗦𝗘𝗔𝗥𝗖𝗛*",
        items: [
            "tiktok", "fb", "song", "video", "ig", "yt", "ysprank", "sublk",
            "twitter", "xnxx", "xndl", "apk", "cinesubz", "cinesubz2", "play",
            "paper", "pdl", "gitclone", "movie", "thenkiri", "cartoon",
            "cinetv", "lyrics", "ytchannel", "ttsearch", "pinterest",
            "sitecode", "getdp", "imgurl", "steal"
        ]
    },
    "2": {
        title: "*👥 𝗚𝗥𝗢𝗨𝗣 & 𝗔𝗗𝗠𝗜𝗡*",
        items: [
            "kick", "kick2", "add", "del", "invite", "warn", "jid", "forward",
            "tagall", "setpp", "admins", "promote", "demote", "unmute",
            "open", "close", "mute", "revoke", "link", "grouplink",
            "setsubject", "setdesc", "groupinfo", "ginfo", "gstatus",
            "online", "poll", "vote", "presults", "pclose", "antilink"
        ]
    },
    "3": {
        title: "*👑 𝗢𝗪𝗡𝗘𝗥 & 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦*",
        items: [
            "save", "listsave", "broadcast", "block", "unblock", "blockall",
            "pp", "restart", "shutdown", "eval", "setvar", "getvar",
            "grouplist", "leave", "setname", "setbio", "botinfo",
            "clearchat", "getcontact", "anticall", "kickall", "settings",
            "mode", "autoreact", "autostatus", "autotyping", "antidelete",
            "welcome", "goodbye", "autoblock", "statusreply", "setprefix",
            "setlogo", "setalivemsg", "setwelcomemsg", "setgoodbyemsg",
            "setstatusreply", "blacklist", "areply"
        ]
    },
    "4": {
        title: "*🛠️ 𝗧𝗢𝗢𝗟𝗦 & 𝗧𝗘𝗫𝗧*",
        items: [
            "say", "repeat", "upper", "lower", "reverse", "length", "count",
            "b64enc", "b64dec", "binary", "hex", "md5", "sha1", "sha256",
            "sha384", "sha512", "md4", "ripemd", "hmac", "crc32", "urlenc",
            "urldec", "escape", "unescape", "jsonparse", "jsonstring",
            "base64url", "hexdump", "binarydump", "ascii", "charcode",
            "unicode", "random", "mock", "clap", "vowel", "leet", "fliptext",
            "space", "zalgo", "fancy", "lenny", "shrug", "removebg",
            "enhance", "colour", "timer", "remind", "note", "getnote",
            "delnote", "afk", "titlecase", "camelcase", "snakecase",
            "kebabcase", "removeemoji", "removenum", "removespace",
            "dupline", "sortline", "revline", "swapcase", "strikethru",
            "underline", "wide", "smallcaps", "bubble", "square", "mirror",
            "zigzag", "usee", "qr", "short", "password"
        ]
    },
    "5": {
        title: "*🎉 𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘𝗦*",
        items: [
            "animegirl1", "animegirl2", "animegirl3", "animegirl4",
            "animegirl5", "animegirl6", "joke", "veryjoke", "quote", "fact",
            "8ball", "truth", "dare", "ship", "hug", "kiss", "slap", "roast",
            "compliment", "roll", "flip", "pick", "rate", "meme", "laugh",
            "cry", "angry", "love", "sleep", "happy", "magic", "loli", "dog",
            "dog2", "cat", "fox", "hack", "y3prank", "yprank", "tik",
            "igprank", "fbprank", "avatar", "dick", "gayrate", "simp",
            "waifu", "neko", "process", "adarey", "sticker1", "tictactoe",
            "hangman", "rps", "slots", "boom", "zombie", "lie", "slime",
            "scary", "secret", "egg", "friend", "day", "shuffle", "bodytemp",
            "myanimal", "myjob", "wealth", "coffee", "color", "smoke", "lines"
        ]
    },
    "6": {
        title: "*🤖 𝗔𝗜 & 𝗠𝗘𝗗𝗜𝗔*",
        items: [
            "ai", "athal", "aiimg2", "translate", "img", "meta", "sticker",
            "toimg", "toaudio", "toptt", "anime0", "anime", "manga",
            "waifupic"
        ]
    },
    "7": {
        title: "*⚙️ 𝗦𝗬𝗦𝗧𝗘𝗠 & 𝗜𝗡𝗙𝗢*",
        items: [
            "alive", "ping", "ping7", "uptime", "repo", "status", "owner",
            "react", "autoreply", "system", "hashan", "hashiya", "antibad",
            "menu2", "menu3", "menu4", "menu5", "othermenu2", "pair",
            "hostname", "platform", "arch", "freem", "totalmem", "cpus",
            "uptimeos", "nodever", "env", "pid", "cwd", "argv", "execpath",
            "tempdir", "homedir", "user", "loadavg", "network", "release",
            "type", "developer", "post", "whois", "srepo", "news", "news2",
            "calc", "report", "pingip", "whoare"
        ]
    },
    "8": {
        title: "*📐 𝗨𝗧𝗜𝗟𝗜𝗧𝗬, 𝗠𝗔𝗧𝗛 & 𝗧𝗜𝗠𝗘*",
        items: [
            "weather", "quran", "bible", "sqrt", "pow", "sin", "cos", "tan",
            "log", "ln", "abs", "ceil", "floor", "round", "gcd", "lcm",
            "prime", "fib", "avg", "sum", "min", "max", "epoch", "isotime",
            "utc", "timezone", "timezoneconv", "weekday", "month", "year",
            "leap", "daynum", "weeknum", "addday", "subday", "diffday",
            "timestamp", "countdown", "age", "daylight", "millis", "seconds"
        ]
    }
};

function buildCategoryText(key) {
    const cat = categories[key];
    if (!cat) return "❌ Invalid Number";
    const lines = cat.items.map(c => `│ 🔶 .${c}`).join("\n");
    return `
╭──〔 ${cat.title} 〕──⊷
${lines}
╰────────────⊷`;
}

cmd({
    pattern: "menu",
    react: "🧬",
    desc: "Simple Menu",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from,
    pushname
}) => {

    try {

        const speed = Math.floor(Math.random() * 100);

        const categoryList = Object.entries(categories)
            .map(([num, cat]) => `│ ☘︎ ${num} ┃ ${cat.title}`)
            .join("\n");

        const menu = `
╭─ [ 🟢 *𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐔𝐒* ] ─⊷
│ 📟 *ᴠᴇʀꜱɪᴏɴ* : 6.0.0
│ ⚖️ *ᴘʟᴀᴛꜰᴏʀᴍ* : ᴄʟᴏᴜᴅ
│ 💗 *ᴏᴡɴᴇʀ* : ʜᴀꜱʜᴜ ᴅᴇᴠ
│ ⚡ *ʟᴀᴛᴇɴᴄʏ* : ${speed}ᴍꜱ
│ 👤 *ᴜꜱᴇʀ* : ${pushname}
╰────────────⊷

╭─── [ 📂 ᴄᴀᴛᴇɢᴏʀɪᴇꜱ ] ─⊷
${categoryList}
╰───────────────⊷

*https://dct-freebot.pages.dev*

> 📌 ʀᴇᴘʟʏ ᴡɪᴛʜ ɴᴜᴍʙᴇʀ (1-8)
> ✦ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴄᴛ-ᴍᴅ ᴡᴀ ʙᴏᴛ
`;

        const sentMsg = await conn.sendMessage(
            from,
            {
                image: { url: menuImage },
                caption: menu,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363395674230271@newsletter",
                        newsletterName: "𝐇𝐀𝐒𝐇𝐔 𝐃𝐄𝐕",
                        serverMessageId: 2,
                    },
                },
            },
            { quoted: mek }
        );

        const messageID = sentMsg.key.id;

        const listener = async ({ messages }) => {

            const msg = messages[0];
            if (!msg.message) return;

            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text;

            const replyId =
                msg.message.extendedTextMessage?.contextInfo?.stanzaId;

            if (replyId !== messageID) return;

            const txt = buildCategoryText((text || "").trim());
            const img = menuImage;

            await conn.sendMessage(
                from,
                {
                    image: { url: img },
                    caption: txt,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363395674230271@newsletter",
                            newsletterName: "𝐃𝐂𝐓-𝐌𝐃-𝐁𝐎𝐓",
                            serverMessageId: 2,
                        },
                    },
                },
                { quoted: msg }
            );

        };

        conn.ev.on("messages.upsert", listener);

    } catch (e) {
        console.log(e);
    }

});
