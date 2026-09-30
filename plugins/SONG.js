const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
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

        // SEND THUMBNAIL & DETAILS
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

        // 🟢 403 Error එන්නේ නැති (Proxy කරන) APIs ලැයිස්තුව
        const apis = [
            `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(data.url)}`,
            `https://itzpire.com/download/youtube?url=${encodeURIComponent(data.url)}`,
            `https://api.giftedtech.my.id/api/download/ytmp3?url=${encodeURIComponent(data.url)}&apikey=gifted`
        ];

        let audioUrl = null;

        for (const api of apis) {
            try {
                const res = await axios.get(api, { timeout: 15000 });
                const d = res.data;

                // 1. Dark Yasiya API
                if (d?.status && d?.result?.dl_link) {
                    audioUrl = d.result.dl_link;
                }
                // 2. Itzpire API
                else if (d?.data?.download?.mp3 || d?.data?.audio) {
                    audioUrl = d.data.download?.mp3 || d.data.audio;
                }
                // 3. Gifted API
                else if (d?.result?.download_url) {
                    audioUrl = d.result.download_url;
                }

                if (audioUrl) break; // හරි Link එකක් හම්බුනා නම් Loop එකෙන් අයින් වෙනවා

            } catch (e) {
                // Ignore API Error and try the next one
            }
        }

        if (!audioUrl) {
            return reply("❌ *සින්දුව ඩවුන්ලෝඩ් කිරීමට නොහැකි විය. (APIs ක්‍රියා විරහිතයි)*");
        }

        // 📥 File එක Manual Download කිරීම (0.0s සහ Error මගහරින්න)
        const tempPath = path.join(__dirname, `temp_${Date.now()}.mp3`);
        const writer = fs.createWriteStream(tempPath);

        const dlRes = await axios({
            url: audioUrl,
            method: 'GET',
            responseType: 'stream',
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': '*/*'
            },
            timeout: 30000
        });

        dlRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const stats = fs.statSync(tempPath);
        if (stats.size < 1000) {
            fs.unlinkSync(tempPath);
            return reply("❌ *Download වූ File එක හිස්‍ ය. වෙනත් සින්දුවක් උත්සාහ කරන්න.*");
        }

        // 🚀 WhatsApp එකට යැවීම
        await conn.sendMessage(from, {
            audio: { url: tempPath },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: `${data.title}.mp3`
        }, { quoted: mek });

        // යැව්වට පස්සේ File එක මකා දැමීම
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }

    } catch (e) {
        console.error("Global Error:", e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
