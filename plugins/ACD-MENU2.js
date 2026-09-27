const config = require('../config')
const { cmd, commands } = require('../command')
const os = require('os')

cmd({
    pattern: "menu3",
    alias: ["help2", "list2"],
    desc: "All commands list.",
    category: "main",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        const botName = config.BOT_NAME || "ᴅᴄᴛ-ᴍᴅ-ᴍɪɴɪ";
        const logo = "https://i.ibb.co/YBtjMpQx/1ed923b3376b.jpg";

        // Animation
        const frames = [
            "✨ ʜᴇʏ " + pushname,
            "✨ ʜᴇʏ " + pushname + " ᴡᴀɪᴛ...",
            "📟 ꜰᴇᴛᴄʜɪɴɢ ᴄᴏᴍᴀɴᴅꜱ...",
            "📊 ᴏᴘᴛɪᴍɪᴢɪɴɢ ᴍᴇɴᴜ...",
            "📜 *ᴅᴄᴛ-ᴍᴅ-ᴍɪɴɪ ᴍᴇɴᴜ ʟᴏᴀᴅᴇᴅ!*"
        ];

        let { key } = await conn.sendMessage(from, { text: "⏳" });

        for (let frame of frames) {
            await new Promise(res => setTimeout(res, 400));
            await conn.sendMessage(from, { text: frame, edit: key });
        }

        // Commands sort karana eka
        const categories = {};
        commands.forEach(cmd => {
            if (!cmd.dontAddCommandList && cmd.pattern) {
                if (!categories[cmd.category]) {
                    categories[cmd.category] = [];
                }
                categories[cmd.category].push(cmd.pattern);
            }
        });

        // Premium Menu Text
        let menuText = `
╭─════════════════─╮
│  👨‍💻 *𝐃𝐂𝐓 𝐅𝐑𝐄𝐄 𝐁𝐎𝐓*   
│  👑 *PREMIUM MENU* 
╰─════════════════─╯

┏━━━━━━━━━━━━━━┓
┃  👋 *HELLO*  : ${pushname}
┃  🤖 *BOT*     : ${botName}
┃  📟 *RAM*     : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB
┃  ⏳ *UPTIME*  : ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m
┃  📊 *CMDS*    : ${commands.length}
┗━━━━━━━━┛
`

        for (const category in categories) {
            menuText += `
┏━━━〔 🔥 *${category.toUpperCase()}* 〕━━━┓
`
            categories[category].forEach(cmdName => {
                menuText += `┃  🌩️ .${cmdName}\n`
            })
            menuText += `┗━━━━━━━━━━━┛\n`
        }

        menuText += `
╭─────────────────────────────────╮
│  💎 *Premium Modules* : Active
│  🚀 *Response* : Instant
│  🛡️ *Security* : Max Protection
│  🔥 *Owner* : Mr Hashuu
╰─────────────────────────────────╯

🔗 *Connect Free Here* : https://dct.fwh.is

✨ *ENJOY PREMIUM FREE BOT* ✨

> 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐂𝐓 𝐌𝐃 𝐌𝐈𝐍𝐈 𝐕1 🌩️💗
`

        await conn.sendMessage(from, { delete: key });

        try {
            return await conn.sendMessage(from, {
                image: { url: logo },
                caption: menuText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    externalAdReply: {
                        title: "𝐃𝐂𝐓-𝐌𝐃",
                        body: "Tap to Connect Free",
                        thumbnailUrl: logo,
                        sourceUrl: "https://dct.fwh.is",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: mek });
        } catch (imgErr) {
            console.log("Image fetch failed, sending text only:", imgErr.message);
            return await conn.sendMessage(from, { text: menuText }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
})
