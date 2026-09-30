const config = require('../config')
const { cmd, commands } = require('../command')
const os = require('os')

cmd({
    pattern: "menu3", // අවශ්‍ය නම් "menu3" ලෙසම තබා ගන්න
    alias: ["help2", "list2"],
    desc: "All commands list.",
    category: "main",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        // config.js හි ඇති නම ගනී, නැත්නම් "SADEW-MD-MINI" ලෙස වැටේ
        const botName = config.BOT_NAME || "SADEW-MD-MINI";
        // config.js හි ALIVE_LOGO එක ඇත්නම් එය ගනී
        const logo = config.ALIVE_LOGO || "https://i.ibb.co/YBtjMpQx/1ed923b3376b.jpg";

        // Animation
        const frames = [
            "✨ ʜᴇʏ " + pushname,
            "✨ ʜᴇʏ " + pushname + " ᴡᴀɪᴛ...",
            "📟 ꜰᴇᴛᴄʜɪɴɢ ᴄᴏᴍᴀɴᴅꜱ...",
            "📊 ᴏᴘᴛɪᴍɪᴢɪɴɢ ᴍᴇɴᴜ...",
            `📜 *${botName} ᴍᴇɴᴜ ʟᴏᴀᴅᴇᴅ!*`
        ];

        let { key } = await conn.sendMessage(from, { text: "⏳" });

        for (let frame of frames) {
            await new Promise(res => setTimeout(res, 400));
            await conn.sendMessage(from, { text: frame, edit: key });
        }

        // Commands sort කිරීම
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
│  👨‍💻 *${botName}*   
│  👑 *PREMIUM MENU* 
╰─════════════════─╯

┏━━━━━━━━━━━━━━┓
┃  👋 *HELLO*  : ${pushname}
┃  🤖 *BOT*    : ${botName}
┃  📟 *RAM*    : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB
┃  ⏳ *UPTIME* : ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m
┃  📊 *CMDS*   : ${commands.length}
┗━━━━━━━━━━━━━━┛
`

        for (const category in categories) {
            menuText += `\n┏━━━〔 🔥 *${category.toUpperCase()}* 〕━━━┓\n`
            categories[category].forEach(cmdName => {
                menuText += `┃  🌩️ .${cmdName}\n`
            })
            menuText += `┗━━━━━━━━━━━━━━┛\n`
        }

        menuText += `
╭─────────────────────────────────╮
│  💎 *Premium Modules* : Active
│  🚀 *Response* : Instant
│  🛡️ *Security* : Max Protection
│  🔥 *Owner* : Sadew Rashmika
╰─────────────────────────────────╯

🔗 *GitHub Repo* : https://github.com/sadewboy70

✨ *ENJOY PREMIUM BOT* ✨

> 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 ${botName} 🌩️💗
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
                        title: botName,
                        body: "Sadew Rashmika",
                        thumbnailUrl: logo,
                        sourceUrl: "https://github.com/sadewboy70",
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
