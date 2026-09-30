const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// AI Models ඔක්කොම මෙතන තියෙනවා 🧠
const aiModels = [
    "gpt", "claude", "mistral", "gemini", "deepseek", "venice", "groq", "cohere",
    "llama", "mixtral", "phi", "qwen", "falcon", "vicuna", "openchat", "wizard",
    "zephyr", "codellama", "starcoder", "dolphin", "nous", "openhermes", "neural",
    "solar", "yi", "tinyllama", "orca", "command", "nemotron", "internlm",
    "chatglm", "wormgpt", "blackbox", "replit", "notegpt", "notegpt-deepseek", "notegpt-pro",
    "ai", "darkai"
];

// 🟢 Loop එකක් හරහා හැම AI එකක්ම වෙනම Command එකක් විදිහට Auto Register කරනවා 🟢
aiModels.forEach(model => {
    cmd({
        pattern: model,
        desc: `Chat with ${model.toUpperCase()} AI`,
        category: "ai", // 👈 මේක නිසා Menu එකේ AI category එකට ඔටෝම යනවා
        react: "🧠",
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply, command }) => {
        try {
            let query = q || 
                (mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) || 
                (mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text);
            
            if (!query) return reply(`💭 *කරුණාකර ප්‍රශ්නයක් ඇතුළත් කරන්න!*\n💡 _උදා: .${model} Hello කොහොමද?_`);

            await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

            let targetModel = command.toLowerCase();
            if (targetModel === 'ai' || targetModel === 'darkai') targetModel = 'gpt'; 
            
            const botName = config.BOT_NAME || "SADEW-MINI";
            const apiKey = "wxa_f_92eb2d554e"; 
            
            // API Request URL
            const apiUrl = `https://apix.wolvarex.com/api/ai/${targetModel}?q=${encodeURIComponent(query)}&key=${apiKey}`;

            const response = await axios.get(apiUrl, { timeout: 45000 });
            const res = response.data;

            if (res && res.status === true && res.result) {
                let aiReply = res.result;

                // WormGPT වල "WormGPT: " කියලා එන කෑල්ල අයින් කරනවා
                aiReply = aiReply.replace(/^WormGPT:\s*/i, '').trim();

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
                console.log("Invalid API Response:", res);
                await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                reply(`❌ *API Response Error:* දත්ත ලබාගැනීමට නොහැකි විය.`);
            }

        } catch (e) {
            console.error("AI Error:", e.message);
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            reply(`❌ *දෝෂයක් ඇතිවිය:* ${e.message}`);
        }
    });
});
