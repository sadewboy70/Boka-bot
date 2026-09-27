const mongoose = require('mongoose');
const os = require("os");
const axios = require("axios");
const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

// 🗄️ MongoDB Schema
const SettingsSchema = new mongoose.Schema({
    jid: { type: String, unique: true },
    PREFIX: { type: String, default: config.PREFIX || '.' },
    BOT_NAME: { type: String, default: config.BOT_NAME || 'DCT-MD-MINI-V6' },
    AUTO_REACT: { type: Boolean, default: config.AUTO_REACT || false },
    WORK_MODE: { type: String, default: 'public' },
    AUTO_READ_STATUS: { type: Boolean, default: config.AUTO_READ_STATUS || false },
    AUTO_TYPING: { type: Boolean, default: config.AUTO_TYPING || false },
    ALIVE_LOGO: { type: String, default: 'https://i.ibb.co/YBtjMpQx/1ed923b3376b.jpg' },
    ALIVE_MSG: { type: String, default: '' },
    ANTILINK: { type: Boolean, default: false },
    ANTIDELETE: { type: Boolean, default: false },
    WELCOME: { type: Boolean, default: false },
    GOODBYE: { type: Boolean, default: false },
    WELCOME_MSG: { type: String, default: '👋 Welcome @user to *@group* !' },
    GOODBYE_MSG: { type: String, default: '👋 @user left *@group* . Goodbye!' },
    AUTO_STATUS_REPLY: { type: Boolean, default: false },
    AUTO_STATUS_REPLY_TEXT: { type: String, default: 'Thanks for viewing my status! 🙏' },
    AUTO_REPLY: { type: Boolean, default: false },
    AUTO_REPLY_LIST: { type: Array, default: [] },
    AUTO_BLOCK: { type: Boolean, default: false },
    BLACKLIST: { type: [String], default: [] },
    ALWAYS_ONLINE: { type: Boolean, default: false }
});
const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', SettingsSchema);

// Newsletter model eka pair.js eke dan register wela thiyenne — methanadi aluthin schema
// define karanne na, mongoose model registry eken tamai reuse karanne (channel react
// commands walata use wenawa).
const NewsletterSchema = new mongoose.Schema({
    jid: { type: String, unique: true, required: true },
    emojis: { type: [String], default: ['❤️', '🔥', '😎'] },
    addedAt: { type: Date, default: Date.now },
    ownerNumber: { type: String, default: null },
    expiresAt: { type: Date, default: null }
});
const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);

// ── HELPER ──
const normalizeJid = (id) => {
    if (!id || typeof id !== 'string') return '';
    return (id.split('@')[0].split(':')[0]) + '@s.whatsapp.net';
};
const cleanNum = (id) => {
    if (!id || typeof id !== 'string') return '';
    return id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
};

// ── 1️⃣ ALIVE ──
cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "👋",
    filename: __filename
},
async (conn, mek, m, { from, reply, botName }) => {
    try {
        const targetBotJid = normalizeJid(conn.user?.id || from);
        let settings = await UserSettings.findOne({ jid: targetBotJid });

        const displayName   = settings?.BOT_NAME || botName || config.BOT_NAME || 'DCT-MD-MINI-V6';
        const displayPrefix = settings?.PREFIX || config.PREFIX || '.';
        const displayMode   = settings?.WORK_MODE
            ? settings.WORK_MODE.charAt(0).toUpperCase() + settings.WORK_MODE.slice(1)
            : 'Public';
        const aliveLogo = settings?.ALIVE_LOGO || 'https://i.ibb.co/YBtjMpQx/1ed923b3376b.jpg';

        const number = "13135550002";
        const jid    = number + "@s.whatsapp.net";

        let thumb = Buffer.from([]);
        try {
            const ppUrl  = await conn.profilePictureUrl(jid, "image");
            const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
            thumb = Buffer.from(ppResp.data, "binary");
        } catch (err) {}

        const contactCard = {
            key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: "status@broadcast" },
            message: {
                contactMessage: {
                    displayName: displayName,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${displayName}\nORG:MRHASHU\nTEL;type=CELL;type=VOICE;waid=${number}:+94 70 489 6880\nEND:VCARD`,
                    jpegThumbnail: thumb
                }
            }
        };

        let status = '';
        if (settings?.ALIVE_MSG) {
            status = settings.ALIVE_MSG
                .replace(/%name/g, displayName)
                .replace(/%prefix/g, displayPrefix)
                .replace(/%mode/g, displayMode)
                .replace(/%runtime/g, runtime(process.uptime()))
                .replace(/%ram/g, `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB`);
        } else {
            status = `
╭───────────────◉
│ *🤖 ${displayName} IS ALIVE*
├───────────────◉
│ ✨ Bot is Active & Online!
│ 
│ 🧠 𝗢𝗪𝗡𝗘𝗥: ${displayName}
│ ⚡ 𝗩𝗘𝗥𝗦𝗜𝗢𝗡: *5.0.0*
│ 📝 𝗣𝗥𝗘𝗙𝗜𝗫: ${displayPrefix}
│ 📳 𝗠𝗢𝗗Ｅ: ${displayMode}
│ 💾 𝗥𝗔𝗠: *${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB*
│ 🖥️ 𝗛𝗢𝗦𝗧: 𝗥𝗮𝗶𝗹𝘄𝗮𝘆 𝗣𝗿𝗼
│ ⌛ 𝗨𝗣𝗧𝗜𝗠𝗘: *${runtime(process.uptime())}*
╰────────────────◉

> ⚡ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 *${displayName}*
`;
        }

        await conn.sendMessage(from, { video: { url: aliveLogo }, mimetype: 'video/mp4', ptv: true }, { quoted: contactCard });
        await conn.sendMessage(from, {
            image: { url: aliveLogo },
            caption: status,
            footer: `© ${displayName} 2026`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363395674230271@newsletter',
                    newsletterName: displayName,
                    serverMessageId: 143
                }
            }
        }, { quoted: contactCard });
        await conn.sendMessage(from, { audio: { url: "https://files.catbox.moe/6figid.mp3" }, mimetype: 'audio/mpeg', ptt: false }, { quoted: contactCard });

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
                if (filter(msg)) { conn.ev.off('messages.upsert', handler); resolve(msg); }
            };
            conn.ev.on('messages.upsert', handler);
            setTimeout(() => { conn.ev.off('messages.upsert', handler); resolve(null); }, 30000);
        });
        if (!replyMsg) return;
        const replyText = (replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text).trim();
        if (replyText === "1") await reply(`🏓 Pong! ${displayName} is alive.`);
        else if (replyText === "2") {
            const fakeMek = { ...replyMsg, body: `${displayPrefix}menu` };
            conn.ev.emit("messages.upsert", { messages: [fakeMek], type: "notify" });
        }
    } catch (err) {
        console.error("❌ Alive cmd error:", err);
        reply("❌ Error in alive command: " + err.message);
    }
});

// ── 2️⃣ SETTINGS (SHOW PANEL) ──
cmd({
    pattern: 'settings',
    alias: ['config', 'set'],
    react: '⚙️',
    category: 'owner',
    desc: 'View bot settings panel.',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, prefix, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const configOwner = config.OWNER_NUMBER ? cleanNum(config.OWNER_NUMBER) : '';
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender, mek?.key?.participant].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id)) || (configOwner && cleanedSenders.includes(configOwner)) || cleanedSenders.includes(cleanNum(rawBotJid));
        if (!isAuthorized) return reply('❌ *You are not owner.*');

        let targetBotJid = normalizeJid(rawBotJid || from);

        // remote control by main admin: .settings 9471xxxxxxx
        if (args[0] && /^\d{10,}$/.test(args[0].replace(/[^0-9]/g, ''))) {
            if (!cleanedSenders.some(id => mainAdmins.includes(id)))
                return reply('❌ *Only the bot owner can remote control other bots!*');
            targetBotJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }

        let s = await UserSettings.findOne({ jid: targetBotJid });
        if (!s) s = await UserSettings.create({ jid: targetBotJid });

        const msg = `╭⚡ *BOT SETTINGS* ⚙️
│
│ 🤖 *TARGET:* @${targetBotJid.split('@')[0]}
│
├🛡️ *CURRENT STATE*
│ 🔹 *Prefix:* [ ${s.PREFIX} ]
│ 🔹 *Bot Name:* ${s.BOT_NAME}
│ 🔹 *Work Mode:* ${s.WORK_MODE.toUpperCase()}
│ 🔹 *Auto React:* ${s.AUTO_REACT ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Auto Status Read:* ${s.AUTO_READ_STATUS ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Auto Typing:* ${s.AUTO_TYPING ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Anti-Link:* ${s.ANTILINK ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Anti-Delete:* ${s.ANTIDELETE ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Welcome:* ${s.WELCOME ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Goodbye:* ${s.GOODBYE ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Auto Status Reply:* ${s.AUTO_STATUS_REPLY ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Auto Reply (no-prefix):* ${s.AUTO_REPLY ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Auto Block:* ${s.AUTO_BLOCK ? '🟢 ON' : '🔴 OFF'}
│ 🔹 *Always Online:* ${s.ALWAYS_ONLINE ? '🟢 ON' : '🔴 OFF'}
│
├💡 *COMMANDS*
│ ${prefix}mode public / private / groups
│ ${prefix}autoreact on / off
│ ${prefix}autostatus on / off
│ ${prefix}autotyping on / off
│ ${prefix}antilink on / off
│ ${prefix}antidelete on / off
│ ${prefix}welcome on / off
│ ${prefix}goodbye on / off
│ ${prefix}autoblock on / off
│ ${prefix}statusreply on / off
│ ${prefix}alwaysonline on / off
│ ${prefix}autoreply on / off / add / del
│ ${prefix}setchannel / delchannel / channels
│
├✍️ *TEXT SETTINGS*
│ ${prefix}setprefix [key]
│ ${prefix}setname [text]
│ ${prefix}setlogo [URL]
│ ${prefix}setalivemsg [text]
│ ${prefix}setwelcomemsg [text]
│ ${prefix}setgoodbyemsg [text]
│ ${prefix}setstatusreply [text]
│ ${prefix}blacklist add [number]
│ ${prefix}blacklist remove [number]
│
╰───────────────◉
> *© POWERED BY ${s.BOT_NAME || config.BOT_NAME || 'DCT-MD'} FREE BOT ┃ ⚖️*`;

        await sock.sendMessage(from, { text: msg, mentions: [targetBotJid] }, { quoted: mek });
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// ── 3️⃣ MODE COMMAND ──
cmd({
    pattern: 'mode',
    react: '🌐',
    category: 'owner',
    desc: 'Set work mode: public / private / groups',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const configOwner = config.OWNER_NUMBER ? cleanNum(config.OWNER_NUMBER) : '';
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id)) || (configOwner && cleanedSenders.includes(configOwner));
        if (!isAuthorized) return reply('❌ *You are not owner.*');

        const val = (args[0] || '').toLowerCase();
        if (!['public', 'private', 'groups'].includes(val))
            return reply('❌ Use: *public*, *private*, or *groups*\nExample: .mode public');

        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });
        s.WORK_MODE = val;
        await s.save();
        if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
        const labels = { public: '🌍 Public', private: '🔒 Private', groups: '👥 Groups Only' };
        return reply(`✅ *Work Mode set to ${labels[val]}*`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

// ── 4️⃣ TOGGLE COMMANDS (on/off) ──
const toggleCmds = [
    { pattern: 'autoreact',    field: 'AUTO_REACT',        label: 'Auto React' },
    { pattern: 'autostatus',   field: 'AUTO_READ_STATUS',  label: 'Auto Status Read' },
    { pattern: 'autotyping',   field: 'AUTO_TYPING',       label: 'Auto Typing' },
    { pattern: 'antilink',     field: 'ANTILINK',          label: 'Anti-Link' },
    { pattern: 'antidelete',   field: 'ANTIDELETE',        label: 'Anti-Delete' },
    { pattern: 'welcome',      field: 'WELCOME',           label: 'Welcome' },
    { pattern: 'goodbye',      field: 'GOODBYE',           label: 'Goodbye' },
    { pattern: 'autoblock',    field: 'AUTO_BLOCK',        label: 'Auto Block' },
    { pattern: 'statusreply',  field: 'AUTO_STATUS_REPLY', label: 'Auto Status Reply' },
    { pattern: 'alwaysonline', field: 'ALWAYS_ONLINE',     label: 'Always Online' },
];

for (const t of toggleCmds) {
    cmd({
        pattern: t.pattern,
        react: '⚙️',
        category: 'owner',
        desc: `Toggle ${t.label} on or off`,
        filename: __filename
    },
    async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
        try {
            const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
            const configOwner = config.OWNER_NUMBER ? cleanNum(config.OWNER_NUMBER) : '';
            const rawBotJid = sock.user?.id || botNumber2 || '';
            const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
            const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id)) || (configOwner && cleanedSenders.includes(configOwner));
            if (!isAuthorized) return reply('❌ *You are not owner.*');

            const val = (args[0] || '').toLowerCase();
            if (!['on', 'off'].includes(val))
                return reply(`❌ Use: .${t.pattern} on  or  .${t.pattern} off`);

            const jid = normalizeJid(rawBotJid || from);
            let s = await UserSettings.findOne({ jid });
            if (!s) s = await UserSettings.create({ jid });
            s[t.field] = val === 'on';
            await s.save();
            if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
            return reply(`✅ *${t.label}* ${val === 'on' ? '🟢 ON' : '🔴 OFF'}`);
        } catch (e) { reply(`❌ Error: ${e.message}`); }
    });
}

// ── 5️⃣ TEXT SETTING COMMANDS ──
cmd({
    pattern: 'setprefix',
    react: '✏️',
    category: 'owner',
    desc: 'Change bot prefix',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id));
        if (!isAuthorized) return reply('❌ *You are not owner.*');
        const val = args[0];
        if (!val) return reply('❌ Provide a prefix. Example: .setprefix !');
        if (val.length > 1) return reply('❌ Prefix must be a single character!');
        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });
        s.PREFIX = val;
        await s.save();
        if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
        return reply(`✅ *Prefix updated to:* [ ${val} ]`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

cmd({
    pattern: 'setname',
    react: '✏️',
    category: 'owner',
    desc: 'Change bot name',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id));
        if (!isAuthorized) return reply('❌ *You are not owner.*');
        const val = args.join(' ');
        if (!val) return reply('❌ Provide a name. Example: .setname MyBot');
        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });
        s.BOT_NAME = val;
        await s.save();
        if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
        return reply(`✅ *Bot Name updated to:* ${val}`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

cmd({
    pattern: 'setlogo',
    react: '🖼️',
    category: 'owner',
    desc: 'Change alive logo URL',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id));
        if (!isAuthorized) return reply('❌ *You are not owner.*');
        const val = args[0];
        if (!val || !val.startsWith('http')) return reply('❌ Provide a valid URL. Example: .setlogo https://...');
        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });
        s.ALIVE_LOGO = val;
        await s.save();
        if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
        return reply(`✅ *Alive Logo updated!*`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

cmd({
    pattern: 'setalivemsg',
    react: '✏️',
    category: 'owner',
    desc: 'Set custom alive message',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id));
        if (!isAuthorized) return reply('❌ *You are not owner.*');
        const val = args.join(' ');
        if (!val) return reply('❌ Provide a message.\nPlaceholders: %name %prefix %mode %runtime %ram');
        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });
        s.ALIVE_MSG = val;
        await s.save();
        if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
        return reply(`✅ *Alive Message updated!*`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

cmd({
    pattern: 'setwelcomemsg',
    react: '👋',
    category: 'owner',
    desc: 'Set custom welcome message',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id));
        if (!isAuthorized) return reply('❌ *You are not owner.*');
        const val = args.join(' ');
        if (!val) return reply('❌ Provide text. Use @user and @group as placeholders.');
        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });
        s.WELCOME_MSG = val;
        await s.save();
        if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
        return reply(`✅ *Welcome Message updated!*`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

cmd({
    pattern: 'setgoodbyemsg',
    react: '👋',
    category: 'owner',
    desc: 'Set custom goodbye message',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id));
        if (!isAuthorized) return reply('❌ *You are not owner.*');
        const val = args.join(' ');
        if (!val) return reply('❌ Provide text. Use @user and @group as placeholders.');
        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });
        s.GOODBYE_MSG = val;
        await s.save();
        if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
        return reply(`✅ *Goodbye Message updated!*`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

cmd({
    pattern: 'setstatusreply',
    react: '✏️',
    category: 'owner',
    desc: 'Set auto status reply text',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id));
        if (!isAuthorized) return reply('❌ *You are not owner.*');
        const val = args.join(' ');
        if (!val) return reply('❌ Provide reply text.');
        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });
        s.AUTO_STATUS_REPLY_TEXT = val;
        await s.save();
        if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
        return reply(`✅ *Status Reply text updated!*\n_Use .statusreply on to activate._`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

// ── 6️⃣ BLACKLIST COMMAND ──
cmd({
    pattern: 'blacklist',
    react: '🚫',
    category: 'owner',
    desc: 'Add or remove from blacklist',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id));
        if (!isAuthorized) return reply('❌ *You are not owner.*');

        const action = (args[0] || '').toLowerCase();
        const num = (args[1] || '').replace(/[^0-9]/g, '');

        if (!['add', 'remove', 'list'].includes(action))
            return reply('❌ Use: .blacklist add [number] / .blacklist remove [number] / .blacklist list');

        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });

        if (action === 'list') {
            if (!s.BLACKLIST.length) return reply('📋 *Blacklist is empty.*');
            return reply(`📋 *Blacklist:*\n${s.BLACKLIST.map((n, i) => `${i + 1}. ${n}`).join('\n')}`);
        }
        if (!num) return reply('❌ Provide a number. Example: .blacklist add 947xxxxxxx');
        if (action === 'add') {
            if (!s.BLACKLIST.includes(num)) s.BLACKLIST.push(num);
            await s.save();
            if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
            return reply(`✅ *${num}* added to blacklist.\n_Use .autoblock on to enforce._`);
        }
        if (action === 'remove') {
            s.BLACKLIST = s.BLACKLIST.filter(n => n !== num);
            await s.save();
            if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
            return reply(`✅ *${num}* removed from blacklist.`);
        }
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

// ── 7️⃣ WORK MODE MIDDLEWARE ──
commands.push({
    on: "body",
    function: async (sock, mek, m, { isOwner, sender, senderNumber, botNumber2 } = {}) => {
        try {
            const rawBotJid = sock.user?.id || botNumber2 || '';
            if (!rawBotJid) return;
            const jid = normalizeJid(rawBotJid);
            let settings = await UserSettings.findOne({ jid });
            if (!settings) return;

            const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
            const configOwner = config.OWNER_NUMBER ? cleanNum(config.OWNER_NUMBER) : '';
            const cleanedSenders = [sender, senderNumber, m?.sender, mek?.key?.participant].filter(Boolean).map(s => cleanNum(s));
            const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id)) || (configOwner && cleanedSenders.includes(configOwner)) || cleanedSenders.includes(cleanNum(rawBotJid));

            if (settings.WORK_MODE === 'public' && !isAuthorized) return;
            if (settings.WORK_MODE === 'public' && !mek?.key?.remoteJid?.endsWith('@g.us')) return;
        } catch (e) {}
    }
});

// ── 8️⃣ AUTO REPLY MANAGER (no-prefix keyword triggers) ──
cmd({
    pattern: 'autoreply',
    alias: ['ar'],
    react: '💬',
    category: 'owner',
    desc: 'Manage no-prefix keyword auto-reply triggers',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const configOwner = config.OWNER_NUMBER ? cleanNum(config.OWNER_NUMBER) : '';
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const cleanedSenders = [sender, senderNumber, m?.sender, mek?.key?.participant].filter(Boolean).map(s => cleanNum(s));
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id)) || (configOwner && cleanedSenders.includes(configOwner)) || cleanedSenders.includes(cleanNum(rawBotJid));
        if (!isAuthorized) return reply('❌ *You are not owner.*');

        const jid = normalizeJid(rawBotJid || from);
        let s = await UserSettings.findOne({ jid });
        if (!s) s = await UserSettings.create({ jid });

        const sub = (args[0] || '').toLowerCase();

        if (sub === 'on' || sub === 'off') {
            s.AUTO_REPLY = sub === 'on';
            await s.save();
            if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
            return reply(`✅ *Auto Reply* ${sub === 'on' ? '🟢 ON' : '🔴 OFF'}`);
        }

        if (sub === 'add') {
            const raw = args.slice(1).join(' ');
            const [trigger, ...respParts] = raw.split('|');
            const response = respParts.join('|').trim();
            if (!trigger || !trigger.trim() || !response)
                return reply('❌ *Format:* .autoreply add trigger|response\n\n📌 Example: .autoreply add hi|hii 👋');
            const cleanTrigger = trigger.trim();
            const list = Array.isArray(s.AUTO_REPLY_LIST) ? s.AUTO_REPLY_LIST.filter(p => p.trigger.toLowerCase() !== cleanTrigger.toLowerCase()) : [];
            list.push({ trigger: cleanTrigger, response });
            s.AUTO_REPLY_LIST = list;
            s.markModified('AUTO_REPLY_LIST');
            s.AUTO_REPLY = true; // trigger ekak add kaloth automatic ma feature eka ON karanawa
            await s.save();
            if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
            return reply(`✅ *Auto-Reply Added* (Auto Reply is now 🟢 ON)\n\n*Trigger:* ${cleanTrigger}\n*Response:* ${response}`);
        }

        if (['del', 'delete', 'remove'].includes(sub)) {
            const trigger = args.slice(1).join(' ').trim();
            if (!trigger) return reply('❌ *Format:* .autoreply del trigger');
            const before = Array.isArray(s.AUTO_REPLY_LIST) ? s.AUTO_REPLY_LIST : [];
            const filtered = before.filter(p => p.trigger.toLowerCase() !== trigger.toLowerCase());
            if (filtered.length === before.length) return reply(`❌ *"${trigger}"* trigger ekak hoyaganna bari una.`);
            s.AUTO_REPLY_LIST = filtered;
            s.markModified('AUTO_REPLY_LIST');
            await s.save();
            if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
            return reply(`🗑️ *Removed trigger:* ${trigger}`);
        }

        if (sub === 'clear') {
            s.AUTO_REPLY_LIST = [];
            s.markModified('AUTO_REPLY_LIST');
            await s.save();
            if (global.settingsCache) global.settingsCache.del(jid); // pair.js cache eka ithamama invalidate karanawa
            return reply('🗑️ *All auto-reply triggers cleared.*');
        }

        // default → show status + list + help
        const list = Array.isArray(s.AUTO_REPLY_LIST) ? s.AUTO_REPLY_LIST : [];
        const listText = list.length
            ? list.map((p, i) => `│ ${i + 1}. \`${p.trigger}\` ➜ ${p.response}`).join('\n')
            : '│ _No triggers yet._';

        return reply(`╭⚡ *AUTO REPLY MANAGER* 💬
│
│ Status: ${s.AUTO_REPLY ? '🟢 ON' : '🔴 OFF'}
│
├💡 *COMMANDS*
│ .autoreply on / off
│ .autoreply add trigger|response
│ .autoreply del trigger
│ .autoreply clear
│
├📂 *CURRENT TRIGGERS*
${listText}
╰───────────────◉
_Prefix ekak nathuwama trigger eka type kalama automatic reply eka enawa._`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

// ── 9️⃣ CHANNEL AUTO-REACT MANAGER ──
cmd({
    pattern: 'setchannel',
    alias: ['addchannel'],
    react: '📢',
    category: 'owner',
    desc: 'Add a WhatsApp channel for auto-react',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const configOwner = config.OWNER_NUMBER ? cleanNum(config.OWNER_NUMBER) : '';
        const cleanedSenders = [sender, senderNumber, m?.sender, mek?.key?.participant].filter(Boolean).map(s => cleanNum(s));
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id)) || (configOwner && cleanedSenders.includes(configOwner)) || cleanedSenders.includes(cleanNum(rawBotJid));
        if (!isAuthorized) return reply('❌ *You are not owner.*');

        const inputRaw = args.join(' ').trim();
        if (!inputRaw) return reply('❌ *Format:* .setchannel <channel link / jid>\n\n📌 Example: .setchannel https://whatsapp.com/channel/0029XXXXXXXX');

        let channelJid = null;
        if (/whatsapp\.com\/channel\//i.test(inputRaw)) {
            const inviteId = inputRaw.match(/channel\/([\w-]+)/)?.[1];
            const meta = await sock.newsletterMetadata("invite", inviteId).catch(() => null);
            channelJid = meta?.id;
        } else if (/@newsletter$/i.test(inputRaw)) {
            channelJid = inputRaw;
        } else if (/^\d{12,}$/.test(inputRaw)) {
            channelJid = `${inputRaw}@newsletter`;
        }

        if (!channelJid) return reply('❌ *Invalid channel link/jid eka.*');

        await Newsletter.findOneAndUpdate(
            { jid: channelJid },
            { jid: channelJid },
            { upsert: true, setDefaultsOnInsert: true }
        );

        try { await sock.newsletterFollow(channelJid); } catch (e) {}

        return reply(`✅ *Channel Added for Auto-React*\n\n\`${channelJid}\``);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});

cmd({
    pattern: 'delchannel',
    react: '📢',
    category: 'owner',
    desc: 'Remove a channel from auto-react list',
    filename: __filename
},
async (sock, mek, m, { from, args, sender, senderNumber, reply, isOwner, botNumber2 }) => {
    try {
        const mainAdmins = [cleanNum(config.OWNER_NUMBER || ''), cleanNum(config.OWNER_LID || '')].filter(Boolean); // ⚠️ security fix: wena kenekuge backdoor number/LID ain kala, dan oyage OWNER_NUMBER/OWNER_LID witharai
        const configOwner = config.OWNER_NUMBER ? cleanNum(config.OWNER_NUMBER) : '';
        const cleanedSenders = [sender, senderNumber, m?.sender, mek?.key?.participant].filter(Boolean).map(s => cleanNum(s));
        const rawBotJid = sock.user?.id || botNumber2 || '';
        const isAuthorized = isOwner || cleanedSenders.some(id => mainAdmins.includes(id)) || (configOwner && cleanedSenders.includes(configOwner)) || cleanedSenders.includes(cleanNum(rawBotJid));
        if (!isAuthorized) return reply('❌ *You are not owner.*');

        const list = await Newsletter.find().lean();
        const idx = parseInt(args[0], 10);
        if (!list.length) return reply('❌ *Channel list eka empty.*');
        if (!idx || idx < 1 || idx > list.length) {
            return reply(`❌ *Format:* .delchannel number\n\n${list.map((c, i) => `${i + 1}. ${c.jid}`).join('\n')}`);
        }
        const target = list[idx - 1];
        await Newsletter.deleteOne({ jid: target.jid });
        return reply(`🗑️ *Removed channel:* ${target.jid}`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});


cmd({
    pattern: 'channels',
    react: '📢',
    category: 'owner',
    desc: 'List channels being auto-reacted to',
    filename: __filename
},
async (sock, mek, m, { reply }) => {
    try {
        const list = await Newsletter.find().lean();
        if (!list.length) return reply('📋 *No channels added yet.* Use .setchannel <link> to add one.');
        return reply(`📢 *AUTO-REACT CHANNELS*\n\n${list.map((c, i) => `${i + 1}. ${c.jid}`).join('\n')}\n\n_Add:_ .setchannel <link>\n_Remove:_ .delchannel <number>`);
    } catch (e) { reply(`❌ Error: ${e.message}`); }
});
