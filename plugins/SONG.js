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

        // 🟢 APIs List (වැඩ කරන හොඳම APIs ටික මුලට දාලා තියෙන්නේ)
        const apis = [
            `https://api.giftedtech.my.id/api/download/ytmp3?url=${encodeURIComponent(data.url)}&apikey=gifted`,
            `https://itzpire.com/download/youtube?url=${encodeURIComponent(data.url)}`,
            `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(data.url)}`,
            `https://new-api-yt.vercel.app/api/mp3?url=${encodeURIComponent(data.url)}` // ඔයාගේ පරණ API එක අන්තිමටම දැම්මා
        ];

        let audioUrl = null;

        for (const api of apis) {
            try {
                const res = await axios.get(api, { timeout: 10000 });
                const d = res.data;
                let tempUrl = null;

                if (d?.result?.download_url) tempUrl = d.result.download_url; // giftedtech / dark-yasiya
                else if (d?.data?.download?.mp3) tempUrl = d.data.download.mp3; // itzpire
                else if (d?.data?.audio) tempUrl = d.data.audio; // itzpire fallback
                else if (d?.download) tempUrl = d.download; // new-api-yt

                if (tempUrl) {
                    // 🛑 ERROR CHECK: WhatsApp එකට යවන්න කලින් File එක හිස්ද (0.0s ද) කියලා බලනවා!
                    try {
                        const check = await axios.head(tempUrl, { timeout: 5000 });
                        const contentLength = check.headers['content-length'];
                        
                        // File එක 1000 Bytes (1KB) වලට වඩා අඩු නම් ඒක 0.0s (හිස්) සින්දුවක්.
                        if (contentLength && parseInt(contentLength) < 1000) {
                            console.log(`[Warning] API gave an empty file (${contentLength} bytes). Skipping...`);
                            continue; // මේ ලින්ක් එක බොරු එකක්. ඊලඟ API එකට යනවා!
                        }
                    } catch (headErr) {
                        // 404 Not Found ආවොත් හරි, Block කරලා නම් හරි මේ API එක skip කරනවා
                        console.log(`[Warning] API URL is broken or blocked. Skipping...`);
                        continue; 
                    }

                    // මේ හරියට ආවා කියන්නේ File එක 100% වැඩ. ඒක අරගන්නවා!
                    audioUrl = tempUrl;
                    break; 
                }
            } catch (e) {
                console.log(`[Warning] API is offline, trying next...`);
            }
        }

        if (!audioUrl) {
            return reply("❌ *සින්දුව ඩවුන්ලෝඩ් කිරීමට නොහැකි විය. (APIs අවහිර කර ඇත)*");
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
