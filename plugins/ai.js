const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// AI Models 37 (Aliases)
const aiModels = [
    "gpt", "claude", "mistral", "gemini", "deepseek", "venice", "groq", "cohere",
    "llama", "mixtral", "phi", "qwen", "falcon", "vicuna", "openchat", "wizard",
    "zephyr", "codellama", "starcoder", "dolphin", "nous", "openhermes", "neural",
    "solar", "yi", "tinyllama", "orca", "command", "nemotron", "internlm",
    "chatglm", "wormgpt", "blackbox", "replit", "notegpt", "notegpt-deepseek", "notegpt-pro",
    "ai"
];

cmd({
    pattern: "ai",
    alias: aiModels, 
    desc: "All-in-One AI Chat",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, command }) => {
    try {
        // User type කරපු text එක හෝ reply කරපු text එක
        let query = q || 
            (mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) || 
            (mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text);
        
        if (!query) return reply("💭 *කරුණාකර ප්‍රශ්නයක් ඇතුළත් කරන්න!*\n💡 _උදා: .gpt Hello කොහොමද?_");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let targetModel = command.toLowerCase();
        if (targetModel === 'ai') targetModel = 'gpt'; // Default 'ai' නම් 'gpt' වලට මාරු වීම
        
        const botName = config.BOT_NAME || "SADEW-MINI";
        const apiKey = "wxa_f_92eb2d554e"; 
        const apiUrl = `https://apix.wolvarex.com/api/ai/${targetModel}`;

        // 🟢 100% Correct Request Format (Axios Params මඟින් යැවීම)
        const response = await axios.get(apiUrl, {
            params: {
                q: query,
                key: apiKey
            },
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json"
            },
            timeout: 45000
        });

        // 🟢 Validate Response
        if (response.data && response.data.status === true && response.data.result) {
            const aiReply = response.data.result;

            const caption = 
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ 🎀 ᴀɪ ʀᴇꜱᴘᴏɴꜱᴇ 🎀
┊
┊ 🤖 ᴍᴏᴅᴇʟ : ${targetModel.toUpperCase()}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

${aiReply}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName} 🎐`;

            await conn.sendMessage(from, { text: caption }, { quoted: mek });
            await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
            
        } else {
            // API එකෙන් Result එකක් නැතුව වෙන Error එකක් ආවොත් (Full JSON එකම පෙන්වයි)
            console.log("API Invalid Response:", response.data);
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            reply(`❌ *API Response Error:* ${JSON.stringify(response.data)}`);
        }

    } catch (e) {
        console.error("Wolvarex API Error:", e.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        
        // Network හෝ Server Error එකක් නම් ඒක හරියටම පෙන්වන්න
        if (e.response) {
            reply(`❌ *Server Error:* ${e.response.status}\n${JSON.stringify(e.response.data)}`);
        } else {
            reply(`❌ *දෝෂයක් ඇතිවිය:* ${e.message}`);
        }
    }
});
