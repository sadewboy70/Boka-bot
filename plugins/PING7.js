const { cmd } = require("../command");
const config = require('../config');

cmd({
    pattern: "ping7",
    alias: ["speed7", "pi"],
    react: "⚡",
    desc: "Check bot speed",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {

    try {

        const start = Date.now();

        let sent = await conn.sendMessage(from, {
            text: "⚡ Checking bot speed..."
        }, { quoted: mek });

        const end = Date.now();
        const ping = end - start;

        const text = `
⚡ *${config.BOT_NAME || 'DCT-MD'} SPEED TEST*

🏓 Ping: ${ping} ms
🤖 Status: Online
⚙️ Engine: Baileys v7 RC
📡 Server: Active
`;

        // ✅ Safe Button Version (templateButtons)
        await conn.sendMessage(from, {
            text: text,
            footer: `⚡ ${config.BOT_NAME || 'DCT-MD'} BOT`,
            templateButtons: [
                {
                    index: 1,
                    quickReplyButton: {
                        displayText: "📂 MENU",
                        id: ".menu"
                    }
                },
                {
                    index: 2,
                    quickReplyButton: {
                        displayText: "🤖 AI CHAT",
                        id: ".ai hi"
                    }
                },
                {
                    index: 3,
                    quickReplyButton: {
                        displayText: "🎵 SONG",
                        id: ".song"
                    }
                }
            ]
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Ping error occurred");
    }

});
