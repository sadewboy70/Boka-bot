const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "song", // 🟢 මෙතන song විතරයි තියෙන්නේ, වෙන කිසිම කමාන්ඩ් නමක් නෑ
    react: "🎵",
    desc: "Download YouTube Audio using Kurox API",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const query = args.join(" ");
        if (!query) return reply("🔍 *කරුණාකර සින්දුවේ නම හෝ Link එකක් ලබා දෙන්න!*");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const apiKey = "kx_27d485da9d2ec5dcfe3b37fa8713a8e0";
        const apiUrl = `https://api.kurox.site/api/v1/youtube?apiKey=${apiKey}&query=${encodeURIComponent(query)}`;

        const res = await axios.get(apiUrl, {
            headers: {
                "X-API-KEY": apiKey,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            timeout: 60000 
        });

        if (!res.data || res.data.status !== 200 || !res.data.result) {
            return reply("❌ *සින්දුව සොයාගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න!*");
        }

        const data = res.data.result;
        const title = data.title || "Unknown Song";
        const duration = data.duration || "N/A";
        const author = data.author?.name || "Unknown Artist";
        const thumbUrl = data.thumbnail;
        const audioUrl = data.download?.audio_mp3;

        if (!audioUrl) {
            return reply("❌ *Audio Download Link එක ලබාගත නොහැක!*");
        }

        const botName = config.BOT_NAME || "SADEW MINI";

        const caption = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ 🎵 *SADEW YT DOWNLOADER* 🎵
┊
┊ 🎧 *Title:* ${title}
┊ 👤 *Channel:* ${author}
┊ ⏱️ *Duration:* ${duration}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

> ${botName}`;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        // Thumbnail එක සහ විස්තරය
        await conn.sendMessage(from, {
            image: { url: thumbUrl },
            caption: caption
        }, { quoted: mek });

        // Audio එක යැවීම
        await conn.sendMessage(from, {
            audio: { url: audioUrl }, 
            mimetype: 'audio/mpeg',
            ptt: false, 
            fileName: `${title}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Song DL Error:", e);
        reply(`❌ *Error:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
