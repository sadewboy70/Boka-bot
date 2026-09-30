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

        // 🟢 APIs 3ක් පාවිච්චි කරනවා (එකක් වැඩ නැත්තන් අනිත් එකෙන් auto ගන්න)
        const apis = [
            `https://new-api-yt.vercel.app/api/mp3?url=${encodeURIComponent(data.url)}`,
            `https://api.giftedtech.my.id/api/download/ytmp3?url=${encodeURIComponent(data.url)}&apikey=gifted`,
            `https://itzpire.com/download/youtube?url=${encodeURIComponent(data.url)}`
        ];

        let audioUrl = null;

        for (const api of apis) {
            try {
                const res = await axios.get(api, { timeout: 10000 });
                const d = res.data;

                // 1. new-api-yt API එක check කිරීම
                if (d?.download) { 
                    audioUrl = d.download; break; 
                }
                // 2. giftedtech API එක check කිරීම
                if (d?.result?.download_url) { 
                    audioUrl = d.result.download_url; break; 
                }
                // 3. itzpire API එක check කිරීම
                if (d?.data?.download?.mp3 || d?.data?.audio || d?.data?.url) { 
                    audioUrl = d.data.download?.mp3 || d.data.audio || d.data.url; break; 
                }
            } catch (e) {
                // මේ API එක අවුල් නම් ඊලඟ එක try කරනවා (Auto Fallback)
                console.log(`API Fetch Error: ${api}`);
            }
        }

        if (!audioUrl) {
            return reply("❌ *සින්දුව ඩවුන්ලෝඩ් කිරීමට නොහැකි විය. (APIs ක්‍රියා විරහිතයි)*");
        }

        // 📥 File එකක් විදිහට Save නොකර කෙලින්ම URL එකෙන් යවනවා!
        // මේකෙන් 0 Seconds අවුල එන්නෙත් නෑ, Heroku වල Memory පිරෙන්නෙත් නෑ.
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
