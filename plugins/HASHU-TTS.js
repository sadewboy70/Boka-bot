const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "tiktoksearch",
    alias: ["tks", "tsearch"],
    desc: "Search TikTok Videos",
    category: "search",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🔎 *කරුණාකර සෙවුම් පදයක් (Search Query) ලබා දෙන්න.*\n💡 _උදා: .tks trending dance_");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const botName = config.BOT_NAME || "SADEW-MINI";
        
        // 🟢 නිවැරදි කළ API URL එක (/api/search/tiktok) 🟢
        const apiUrl = `https://kavindu-download-web.vercel.app/api/search/tiktok?q=${encodeURIComponent(q)}`;
        
        const response = await axios.get(apiUrl, { timeout: 15000 });
        const res = response.data;

        if (!res || (!res.result && !res.data)) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ *ප්‍රතිඵල කිසිවක් හමු නොවීය.*");
        }

        const searchResults = res.result || res.data; 

        if (!Array.isArray(searchResults) || searchResults.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ *ප්‍රතිඵල කිසිවක් හමු නොවීය.*");
        }

        let msgText = `╭━━〔 *🎵 𝗧𝗜𝗞𝗧𝗢𝗞 𝗦𝗘𝗔𝗥𝗖𝗛 🎵* 〕━━⬣\n┃\n┃ • *🔍 Query:* ${q}\n┃\n`;

        let limit = Math.min(searchResults.length, 5);
        for (let i = 0; i < limit; i++) {
            const video = searchResults[i];
            
            const title = video.title || video.desc || video.description || "No Title";
            const author = video.author || video.author_name || video.creator || "Unknown";
            const url = video.url || video.video_url || video.link || "Link not available";
            
            msgText += `*${i + 1}.* 👤 *Author:* ${author}\n📝 *Title:* ${title.substring(0, 50)}...\n🔗 *Link:* ${url}\n\n`;
        }

        msgText += `╰━━━━━━━━━━━━━━━━━━⬣\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`;

        await conn.sendMessage(from, { text: msgText }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("TikTok Search Error:", e.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ *දෝෂයක් ඇතිවිය:* ${e.message}`);
    }
});
