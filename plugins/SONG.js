const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const config = require('../config');

cmd({
    pattern: "song",
    alias: ["play", "audio", "ytmp3"],
    desc: "YouTube Song Downloader",
    category: "download",
    react: "🎶",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {
    try {
        if (!q) {
            return reply("🎵 *කරුණාකර සින්දුවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න.*");
        }

        const botName = config.BOT_NAME || "SADEW-MINI";

        // 🟢 1. YOUTUBE SEARCH 🟢
        const search = await yts(q);
        if (!search || !search.videos || !search.videos.length) {
            return reply("❌ *සින්දුව සොයා ගැනීමට නොහැකි විය.*");
        }
        const data = search.videos[0];

        // Thumbnail එක යැවීම
        await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption:
`╭━━〔 *🎵 𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 🎵* 〕━━⬣
┃
┃ • *🎶 Title:* ${data.title}
┃ 
┃ • *⏱ Duration:* ${data.timestamp}
┃
┃ • *👀 Views:* ${data.views}
┃
┃ ✨ 𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚...
╰━━━━━━━━━━━━━━━━━━⬣

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`
        }, { quoted: mek });

        // 🟢 2. WHITESHADOW API REQUEST 🟢
        // ඔයා දුන්න සුපිරි API එක සහ Token එක
        const apiUrl = `https://whiteshadow-x-api.onrender.com/api/download/ytmp3?url=${encodeURIComponent(data.url)}&quality=320&apitoken=4ehG6P`;

        const response = await axios.get(apiUrl, { timeout: 30000 });
        const res = response.data;

        // 🟢 3. VALIDATE API RESPONSE 🟢
        if (!res || !res.success || !res.result || !res.result.download_url) {
            console.log("Invalid API Response:", res);
            return reply("❌ *API සේවාදායකයේ දෝෂයක්. කරුණාකර පසුව උත්සාහ කරන්න.*");
        }

        // savetube.vip CDN Link එක
        const downloadUrl = res.result.download_url;
        console.log("✅ Using WhiteShadow CDN Link:", downloadUrl);

        // 🟢 4. SEND AUDIO TO WHATSAPP 🟢
        // මේක CDN Link එකක් නිසා 0 seconds එන්නෙත් නෑ, IP Block වෙන්නෙත් නෑ!
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: `${data.title}.mp3`
        }, { quoted: mek });

    } catch (e) {
        console.error("Global Song Error:", e.message);
        reply("❌ *දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.*");
    }
});
