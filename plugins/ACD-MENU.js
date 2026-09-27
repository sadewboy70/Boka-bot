const config = require('../config')
const { cmd, commands } = require('../command')
const os = require('os')

cmd({
    pattern: "menu2",
    alias: ["panel2", "list2", "help2"],
    desc: "Show the bot's command list.",
    category: "main",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        const botName = config.BOT_NAME || "𝗗𝗖𝗧-𝗠𝗜𝗡𝗜-𝗕𝗢𝗧";
        
        // පියවර 3ක පොඩි ඇනිමේෂන් එකක්
        const frames = ["⌛ ʟᴏᴀᴅɪɴɢ ᴍᴇɴᴜ...", "📟 ꜰᴇᴛᴄʜɪɴɢ ᴄᴏᴍᴍᴀɴᴅꜱ...", "✨ ᴀʟᴍᴏꜱᴛ ᴛʜᴇʀᴇ..."];
        let { key } = await conn.sendMessage(from, { text: "📜" });
        
        for (let frame of frames) {
            await new Promise(res => setTimeout(res, 300));
            await conn.sendMessage(from, { text: frame, edit: key });
        }

        // Category අනුව කමාන්ඩ් වර්ග කිරීම
        const menu = {};
        commands.map((com) => {
            if (com.pattern && !com.dontAddCommandList) {
                if (!menu[com.category]) menu[com.category] = [];
                menu[com.category].push(com.pattern);
            }
        });

        // Menu එක සැකසීම
        let menuText = `
👋 *ʜᴇʟʟᴏ, ${pushname}!*

🤖 *ʙᴏᴛ ɴᴀᴍᴇ:* ${botName}
⏳ *ᴜᴘᴛɪᴍᴇ:* ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m
📊 *ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅꜱ:* ${commands.length}
━━━━━━━━━━━━━━━━━━━━━━━━
`;

        for (const category in menu) {
            menuText += `\n✨ *${category.toUpperCase()} ᴍᴇɴᴜ* ✨\n`;
            for (const plugin of menu[category]) {
                menuText += `> ⚡ .${plugin}\n`;
            }
        }

        menuText += `
━━━━━━━━━━━━━━━━━━━━━━━━
> *𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧-𝗠𝗗 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧 💗👨‍💻*`;

        // අවසාන වශයෙන් පින්තූරයක් සමඟ හෝ මැසේජ් එකක් ලෙස යැවීම
        // මෙතන Image URL එකක් දාන්න පුළුවන්
        await conn.sendMessage(from, { 
            image: { url: "https://i.ibb.co/4nfQSR27/d8df19de8961.jpg" }, // ඔයාගෙ Logo එක මෙතනට දාන්න
            caption: menuText,
            edit: key 
        });

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
})
