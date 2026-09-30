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

        // YOUTUBE SEARCH
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

        // 🟢 ඔයාගේ API එක (API Key, Proxy මුකුත් ඕනේ නෑ)
        const apiUrl = `https://new-api-yt.vercel.app/api/mp3?url=${encodeURIComponent(data.url)}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });
        let res = response.data;

        if (typeof res === "string") {
            res = JSON.parse(res);
        }

        // CHECK API RESPONSE
        if (!res || res.status !== "success" || !res.download) {
            throw new Error("Invalid API Response");
        }

        const audioUrl = res.download;
        const fileName = `${data.title}.mp3`;
        const filePath = path.join(__dirname, `song_${Date.now()}.mp3`);

        try {
            // 📥 කිසිම Proxy එකක් නැතුව කෙලින්ම ඩවුන්ලෝඩ් කරනවා
            const audioRes = await axios({
                url: audioUrl,
                method: "GET",
                responseType: "arraybuffer",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept": "*/*"
                },
                timeout: 30000
            });

            // බ්ලොක් වෙලා බොරු HTML Page එකක් ආවද බලනවා
            const contentType = audioRes.headers['content-type'];
            if (contentType && (contentType.includes('text/html') || contentType.includes('application/json'))) {
                throw new Error("API Returned invalid content (Blocked by YouTube).");
            }

            fs.writeFileSync(filePath, audioRes.data);

            const stats = fs.statSync(filePath);
            if (stats.size < 1024) { 
                throw new Error("Downloaded file is empty.");
            }

            const actualMimeType = (contentType && contentType.includes('audio')) ? contentType : "audio/mpeg";

            // SEND AUDIO TO WHATSAPP
            // 👈 Buffer එක වෙනුවට URL Path එක දුන්නම තත්පර 0 පෙන්නන එක හරියනවා!
            await conn.sendMessage(from, {
                audio: { url: filePath },
                mimetype: actualMimeType,
                ptt: false,
                fileName: fileName
            }, { quoted: mek });

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

        } catch (downloadErr) {
            console.error("Primary Download Error:", downloadErr.message);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            
            // 🔄 Main API එක Heroku වල අවුල් ගියොත් Auto වැඩ කරන්න Fallback එකක්
            try {
                const fallbackApi = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(data.url)}`;
                const fallbackRes = await axios.get(fallbackApi, { timeout: 15000 });
                
                if (fallbackRes.data?.status && fallbackRes.data?.result?.download_url) {
                    await conn.sendMessage(from, {
                        audio: { url: fallbackRes.data.result.download_url },
                        mimetype: "audio/mpeg",
                        ptt: false,
                        fileName: fileName
                    }, { quoted: mek });
                } else {
                    throw new Error("Fallback API failed.");
                }
            } catch (fallbackErr) {
                console.error("Fallback Send Error:", fallbackErr.message);
                reply("❌ *සින්දුව ඩවුන්ලෝඩ් කිරීමට නොහැකි විය.*");
            }
        }

    } catch (e) {
        console.error("Global Error:", e);
        reply("❌ *දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.*");
    }
});
