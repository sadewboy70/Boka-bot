const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const config = require('../config');

cmd({
    pattern: "song",
    desc: "YouTube Song Downloader",
    category: "download",
    react: "🎶",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply("🎵 *කරුණාකර සින්දුවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න.*");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const botName = config.BOT_NAME || "SADEW MINI";

        // 🟢 1. YOUTUBE SEARCH (yt-search හරහා විස්තර ගැනීම) 🟢
        const search = await yts(q);
        if (!search || !search.videos || !search.videos.length) {
            return reply("❌ *සින්දුව සොයා ගැනීමට නොහැකි විය.*");
        }
        const data = search.videos[0];

        // Description එක ගොඩක් දිග නම් අකුරු 150 කට කපනවා (WhatsApp Caption Limit එක නිසා)
        const desc = data.description ? (data.description.length > 150 ? data.description.substring(0, 150) + "..." : data.description) : "විස්තරයක් නොමැත";

        // ලස්සනට විස්තර ටික පෙළගස්වලා Caption එක හදනවා
        const caption = `╭━━〔 *🎵 𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 🎵* 〕━━⬣
┃
┃ • *🎶 Title:* ${data.title}
┃ • *⏱ Duration:* ${data.timestamp}
┃ • *👀 Views:* ${data.views.toLocaleString()}
┃ • *👤 Channel:* ${data.author.name}
┃ • *🔗 Link:* ${data.author.url}
┃
┃ • *📝 Description:* ${desc}
┃
┃ ✨ 𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚...
╰━━━━━━━━━━━━━━━━━━⬣

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`;

        // Thumbnail එකයි විස්තර ටිකයි මුලින්ම යවනවා
        await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption: caption
        }, { quoted: mek });

        // 🟢 2. WOLVAREX API REQUEST 🟢
        // ඔයා දුන්න අලුත් API එක (id සහ url දෙකම yt-search එකෙන් අරන් දෙනවා)
        const apiUrl = `https://apix.wolvarex.com/api/music/ytmp3-download?id=${data.videoId}&url=${encodeURIComponent(data.url)}&provider=ytmp3&key=wxa_f_92eb2d554e`;

        const response = await axios.get(apiUrl, { timeout: 60000 });
        const res = response.data;

        // 🟢 3. VALIDATE API RESPONSE 🟢
        if (!res || res.success !== true) {
            return reply("❌ *API සේවාදායකයේ දෝෂයක්. කරුණාකර පසුව උත්සාහ කරන්න.*");
        }

        // ඔයා කිව්වා වගේ බොට්ලට IP Block නොවී වැඩ කරන්න proxyURL එක පාවිච්චි කරනවා
        // proxyURL එක අවුල් ගියොත් විතරක් downloadURL එක ගන්නවා
        const downloadUrl = res.proxyURL || res.downloadURL;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        // 🟢 4. SEND AUDIO TO WHATSAPP 🟢
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: `${data.title}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Song Error:", e.message);
        reply("❌ *දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.*");
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
