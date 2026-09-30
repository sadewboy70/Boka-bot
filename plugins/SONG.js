const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const config = require('../config');

cmd({
    pattern: "song",
    alias: ["play", "audio"],
    desc: "YouTube Song Downloader",
    category: "download",
    react: "⬇️",
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
        const search = await yts(q);

        if (!search || !search.videos || !search.videos.length) {
            return reply("❌ *සින්දුව සොයා ගැනීමට නොහැකි විය.*");
        }

        const data = search.videos[0];

        // SEND THUMBNAIL AND DETAILS
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

        // 🟢 ඔයා දුන්න අලුත් API එක (API Key එකත් එක්ක)
        const apiUrl = `https://supunofc.site/api/download/ytmp3-down?url=${encodeURIComponent(data.url)}&apikey=supun-ecjevwrksqz9q5m6rnbmgmqe`;
        
        const response = await axios.get(apiUrl, { timeout: 15000 });
        let res = response.data;

        if (typeof res === "string") {
            res = JSON.parse(res);
        }

        let audioUrl = null;

        // 🟢 ඔයාගේ JSON Result එකෙන් Audio Track එක හොයාගන්නවා
        if (res && res.success && res.result && Array.isArray(res.result)) {
            // "Audio Track" තියෙන පලවෙනි ලින්ක් එක තෝරගන්නවා
            const track = res.result.find(t => t.type === "Audio Track" && t.downloadUrl) || res.result[0];
            if (track && track.downloadUrl) {
                audioUrl = track.downloadUrl;
            }
        }

        if (!audioUrl) {
            return reply("❌ *සින්දුව ඩවුන්ලෝඩ් කිරීමට නොහැකි විය. (API Error)*");
        }

        // 📥 0.0s අවුල නැතුව සින්දුව කෙලින්ම යැවීම
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: `${data.title}.mp3`
        }, { quoted: mek });

    } catch (e) {
        console.error("Global Error:", e);
        reply("❌ *දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.*");
    }
});
