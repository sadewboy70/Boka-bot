const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// ඔයා දුන්න AI Models ඔක්කොම මෙතන තියෙනවා 🧠
const aiModels = [
    "gpt", "claude", "mistral", "gemini", "deepseek", "venice", "groq", "cohere",
    "llama", "mixtral", "phi", "qwen", "falcon", "vicuna", "openchat", "wizard",
    "zephyr", "codellama", "starcoder", "dolphin", "nous", "openhermes", "neural",
    "solar", "yi", "tinyllama", "orca", "command", "nemotron", "internlm",
    "chatglm", "wormgpt", "blackbox", "replit", "notegpt", "notegpt-deepseek", "notegpt-pro"
];

cmd({
    pattern: "ai",
    alias: aiModels, // ඒ නම ගහපු ගමන් මේ කමාන්ඩ් එක වැඩ කරනවා
    desc: "All-in-One AI Chat",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, command }) => {
    try {
        // User type කරපු එක හෝ Reply කරපු මැසේජ් එකේ Text එක ගන්නවා
        let query = q || 
            (mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) || 
            (mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text);
        
        if (!query) return reply("💭 *කරුණාකර ප්‍රශ්නයක් ඇතුළත් කරන්න!*\n💡 _උදා: .gpt Hello කොහොමද?_");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // User ගහපු කමාන්ඩ් එක අනුව Model එක තෝරනවා (ex: .claude ගහුවොත් claude AI එක වැඩ කරනවා)
        let targetModel = command.toLowerCase();
        if (targetModel === 'ai') targetModel = 'gpt'; // Default .ai ගහුවොත් GPT වැඩ කරනවා

        const apiKey = "wxa_f_92eb2d554e"; // ඔයා දුන්න API Key එක
        const apiUrl = `https://apix.wolvarex.com/api/ai/${targetModel}?q=${encodeURIComponent(query)}&key=${apiKey}`;

        // API එකෙන් රිප්ලයි එක ගන්නවා
        const response = await axios.get(apiUrl, { timeout: 45000 });
        
        if (response.data && response.data.status && response.data.result) {
            const aiReply = response.data.result;
            const botName = config.BOT_NAME || "SADEW-MINI";

            // 🎀 Aesthetic ඩිසයින් එක
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
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            reply("❌ *API දෝෂයක්. කරුණාකර වෙනත් AI Model එකක් උත්සාහ කරන්න.*");
        }
    } catch (e) {
        console.error("AI Error:", e.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ *දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.*");
    }
});
