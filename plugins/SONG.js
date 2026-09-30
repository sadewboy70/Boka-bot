const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
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

        // 🟢 2. SEND THUMBNAIL AND DETAILS 🟢
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

        // 🟢 3. NEW API REQUEST (Supun API) 🟢
        const apiKey = "supun-ecjevwrksqz9q5m6rnbmgmqe";
        const apiUrl = `https://supunofc.site/api/download/ytmp3-down?url=${encodeURIComponent(data.url)}&apikey=${apiKey}`;

        const response = await axios.get(apiUrl, { timeout: 25000 });
        const res = response.data;

        // 🟢 4. VALIDATE API RESPONSE 🟢
        if (!res || !res.success || !res.result || res.result.length === 0) {
            console.log("Invalid API Response:", res);
            return reply("❌ *API දෝෂයක්. කරුණාකර පසුව උත්සාහ කරන්න.*");
        }

        // Get the first audio track download URL
        const audioUrl = res.result[0].downloadUrl;
        const fileName = `${data.title}.mp3`;

        console.log("AUDIO DOWNLOAD URL =>", audioUrl);

        // 🟢 5. DOWNLOAD & SEND AUDIO (Anti-Block Proxy Method) 🟢
        const filePath = path.join(__dirname, `song_${Date.now()}.mp3`);

        try {
            // Buffer හරහා Download කිරීම (Heroku/Railway වගේ සර්වර්ස් වල Block වෙන එක වළක්වන්න)
            const audioRes = await axios({
                url: audioUrl,
                method: "GET",
                responseType: "arraybuffer",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "*/*",
                    "Referer": "https://www.youtube.com/"
                },
                timeout: 60000 // ලොකු සින්දු එහෙම ගන්න වෙලා යන නිසා Timeout එක 60s කළා
            });

            // WRITE FILE TO DISK
            fs.writeFileSync(filePath, audioRes.data);

            // SEND AUDIO TO WHATSAPP
            await conn.sendMessage(from, {
                audio: fs.readFileSync(filePath),
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: fileName
            }, { quoted: mek });

            // DELETE TEMP FILE
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

        } catch (downloadErr) {
            console.error("Audio Download/Send Error:", downloadErr);
            
            // Local download ෆේල් වුණොත්, කෙලින්ම URL එකෙන් WhatsApp එකට යවන්න ට්‍රයි කරනවා (Fallback)
            try {
                await conn.sendMessage(from, {
                    audio: { url: audioUrl },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: fileName
                }, { quoted: mek });
            } catch (fallbackErr) {
                console.error("Fallback Send Error:", fallbackErr);
                reply("❌ *සින්දුව යැවීමට නොහැකි විය. Server එක කාර්යබහුලයි.*");
            }

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

    } catch (e) {
        console.error("Global Song Error:", e);
        reply("❌ *දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.*");
    }
});
