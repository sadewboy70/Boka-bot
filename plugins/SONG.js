const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const config = require('../config'); // config.js එක සම්බන්ධ කිරීම

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

        // config.js එකෙන් බොට්ගේ නම ගැනීම
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

        // NEW API REQUEST URL (ඔයා දුන්න අලුත් API එක)
        const apiUrl = `https://new-api-yt.vercel.app/api/mp3?url=${encodeURIComponent(data.url)}`;

        const response = await axios.get(apiUrl, { timeout: 15000 });
        let res = response.data;

        if (typeof res === "string") {
            res = JSON.parse(res);
        }

        // CHECK IF THE RESPONSE IS SUCCESSFUL
        if (!res || res.status !== "success" || !res.download) {
            console.log("Invalid API Response:", res);
            return reply("❌ *API දෝෂයක්. කරුණාකර පසුව උත්සාහ කරන්න.*");
        }

        const audioUrl = res.download;
        const fileName = `${data.title}.mp3`;

        console.log("AUDIO DOWNLOAD URL =>", audioUrl);

        // TEMP FILE PATH
        const filePath = path.join(__dirname, `song_${Date.now()}.mp3`);

        try {
            // 🛡️ PROXY DOWNLOAD METHOD (Buffer හරහා ඩවුන්ලෝඩ් කිරීම)
            const audioRes = await axios({
                url: audioUrl,
                method: "GET",
                responseType: "arraybuffer",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "*/*"
                },
                timeout: 30000
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
            
            // Local download එක ෆේල් වුණොත් විතරක් කෙලින්ම URL එකෙන් යවන්න ට්‍රයි කරනවා
            try {
                await conn.sendMessage(from, {
                    audio: { url: audioUrl },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: fileName
                }, { quoted: mek });
            } catch (fallbackErr) {
                console.error("Fallback Send Error:", fallbackErr);
                reply("❌ *සින්දුව යැවීමට නොහැකි විය.*");
            }

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

    } catch (e) {
        console.error("Global Error:", e);
        reply("❌ *දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.*");
    }
});
