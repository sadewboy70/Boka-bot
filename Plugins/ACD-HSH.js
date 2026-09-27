const mongoose = require('mongoose');
const config = require('../config')
const { cmd, commands } = require('../command')
const os = require("os")
const { runtime } = require('../lib/functions')

// 🗄️ MongoDB Settings Schema
const SettingsSchema = new mongoose.Schema({
    jid: { type: String, unique: true },
    PREFIX: { type: String, default: config.PREFIX || '.' },
    BOT_NAME: { type: String, default: config.BOT_NAME || 'DCT-MD-MINI-V6' },
    AUTO_REACT: { type: Boolean, default: config.AUTO_REACT || false },
    WORK_MODE: { type: String, default: 'public' },
    AUTO_READ_STATUS: { type: Boolean, default: config.AUTO_READ_STATUS || false },
    AUTO_TYPING: { type: Boolean, default: config.AUTO_TYPING || false },
    ALIVE_LOGO: { type: String, default: 'https://i.ibb.co/YBtjMpQx/1ed923b3376b.jpg' },
    ALIVE_MSG: { type: String, default: '' }
});
const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', SettingsSchema);

const normalizeJid = (id) => {
    if (!id || typeof id !== 'string') return '';
    return (id.split('@')[0].split(':')[0]) + '@s.whatsapp.net';
};

cmd({
    pattern: "menu5",
    desc: "Dynamic Commands panel",
    react: '🤍',
    filename: __filename
}, async (bot, message, args, options) => {
    const { from, reply, sender, senderNumber, pushName } = options;

    try {
        // 🔍 FETCH LIVE DB SETTINGS
        const targetBotJid = normalizeJid(bot.user?.id || from);
        let liveSettings = await UserSettings.findOne({ jid: targetBotJid });
        if (!liveSettings) liveSettings = { PREFIX: config.PREFIX || '.', BOT_NAME: config.BOT_NAME || 'DCT-MD-MINI-V6' };

        const PREFIX = liveSettings.PREFIX || '.';
        const BOT_NAME = liveSettings.BOT_NAME || 'DCT-MD-MINI-V6';

        // System variables for menu
        const uptime = runtime(process.uptime());

        const text = `
╭─「  \`🤖${BOT_NAME}\`  」 ─➤* *│
*│*🥷 *Oᴡɴᴇʀ :* ${config.OWNER_NAME || 'ᴍʀ xᴅᴋɪɴɢ'}
*│*✒️ *Pʀᴇғɪx :* ${PREFIX}
*│*🧬 *Vᴇʀsɪᴏɴ :* ${config.BOT_VERSION || 'ʟᴀᴛᴇsᴛ'}
*│*🎈 *Pʟᴀᴛғᴏʀᴍ :* ${process.env.PLATFORM || 'Hᴇʀᴏᴋᴜ'}
*│*⏰ *Uᴘᴛɪᴍᴇ :* ${uptime}
*╰──────●●➤*

╭────────￫
│  🔧ғᴇᴀᴛᴜʀᴇs                  
│  [1] 👑 ᴏᴡɴᴇʀ                           
│  [2] 📥 ᴅᴏᴡɴʟᴏᴀᴅ                           
│  [3] 🛠️ ᴛᴏᴏʟs                            
│  [4] ⚙️ sᴇᴛᴛɪɴɢs                       
│  [5] 🎨 ᴄʀᴇᴀᴛɪᴠᴇ                             
╰───────￫

🎯 ᴛᴀᴘ ᴀ ᴄᴀᴛᴇɢᴏʀʏ ʙᴇʟᴏᴡ!
`.trim();

        const buttons = [
            { buttonId: `${PREFIX}owner`, buttonText: { displayText: "👑 ᴏᴡɴᴇʀ" }, type: 1 },
            { buttonId: `${PREFIX}download`, buttonText: { displayText: "📥 ᴅᴏᴡɴʟᴏᴀᴅ" }, type: 1 },
            { buttonId: `${PREFIX}tools`, buttonText: { displayText: "🛠️ ᴛᴏᴏʟs" }, type: 1 },
            { buttonId: `${PREFIX}settings`, buttonText: { displayText: "⚙️ sᴇᴛᴛɪɴɢs" }, type: 1 },
            { buttonId: `${PREFIX}creative`, buttonText: { displayText: "🎨 ᴄʀᴇᴀᴛɪᴠᴇ" }, type: 1 }
        ];

        await bot.sendMessage(from, {
            image: { url: liveSettings.ALIVE_LOGO || "https://files.catbox.moe/f9gwsx.jpg" },
            caption: text,
            footer: "*▶ ● 𝐅𝚁𝙴𝙴 𝐁𝙾𝚃 *",
            buttons,
            headerType: 4
        }, { quoted: message });

    } catch (error) {
        console.error(error);
        reply(`❌ Error: ${error.message}`);
    }
});
