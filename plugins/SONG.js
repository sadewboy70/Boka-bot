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

        // 🟢 2. PROXY STREAM APIs (Bypasses GitHub/Google 403 Blocks) 🟢
        // මේ APIs වලින් එන්නේ googlevideo.com නෙමෙයි, කෙලින්ම එයාලගේ සර්වර් එකෙන් Stream කරන MP3 එකක්.
        
        let downloadUrl = '';

        try {
            // Proxy API 1: Dreaded API (Direct Audio Buffer Stream)
            // මේකෙදි URL එකම Stream එකක් විදිහට වැඩ කරනවා
            const apiUrl1 = `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(data.url)}`;
            const testRes = await axios.head(apiUrl1, { timeout: 15000 }); 
            if(testRes.status === 200) {
                downloadUrl = apiUrl1;
                console.log("✅ Using Proxy API 1 (Dreaded Stream)");
            }
        } catch (e) {
            console.log("⚠️ Proxy API 1 Failed");
        }

        if (!downloadUrl) {
            try {
                // Proxy API 2: Vreden API (Savetube CDN link එක දෙනවා)
                const apiUrl2 = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(data.url)}`;
                const res2 = await axios.get(apiUrl2, { timeout: 15000 });
                if (res2.data?.result?.download?.url) {
                    downloadUrl = res2.data.result.download.url;
                    console.log("✅ Using Proxy API 2 (Vreden CDN)");
                }
            } catch (e) {
                console.log("⚠️ Proxy API 2 Failed");
            }
        }

        if (!downloadUrl) {
            try {
                // Proxy API 3: Dark Yasiya (SL API)
                const apiUrl3 = `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(data.url)}`;
                const res3 = await axios.get(apiUrl3, { timeout: 15000 });
                if (res3.data?.result?.dl_link) {
                    downloadUrl = res3.data.result.dl_link;
                    console.log("✅ Using Proxy API 3 (Dark Yasiya)");
                }
            } catch (e) {
                console.log("⚠️ Proxy API 3 Failed");
            }
        }

        if (!downloadUrl) {
            return reply("❌ *Server කාර්යබහුලයි. කරුණාකර පසුව උත්සාහ කරන්න.*");
        }

        // 🟢 3. SEND AUDIO TO WHATSAPP 🟢
        // දැන් මේක Direct Proxy URL එකක් නිසා 0 seconds එන්නේ නෑ!
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
