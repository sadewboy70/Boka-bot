const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

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
            return reply("🎵 Give a song name or YouTube link.");
        }

        // SEARCH SONG
        const search = await yts(q);

        if (!search || !search.videos || !search.videos.length) {
            return reply("❌ Song not found.");
        }

        const data = search.videos[0];

        // SEND THUMBNAIL AND DETAILS
        await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption:
`╭━━〔 *🎵 𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 🎵* 〕━━⬣
┃
┃ • *🎶 ${data.title}*
┃ 
┃ • *⏱ ${data.timestamp}*
┃
┃ • *👀 ${data.views} Views*
┃
┃ ✨ 𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚...
╰━━━━━━━━━━━━━━━━━━⬣
*𝗖𝗢𝗡𝗡𝗘𝗖𝗧 𝗕𝗢𝗧 𝗙𝗥𝗘𝗘 🤍✨*
*https://dct-freebot.pages.dev*

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴄᴛ ꜰʀᴇᴇ ʙᴏᴛ*`
        }, { quoted: mek });

        // NEW API REQUEST URL
        const apiUrl = `https://vajiraofc-apis.vercel.app/api/ytmp3?apikey=hashimdtech@gmail.com:vajira-97489&url=${encodeURIComponent(data.url)}&quality=256`;

        const response = await axios.get(apiUrl, { timeout: 15000 });
        let res = response.data;

        // If response is a string, parse it to JSON object
        if (typeof res === "string") {
            res = JSON.parse(res);
        }

        // CHECK IF THE RESPONSE IS SUCCESSFUL
        if (!res || res.success !== true || !res.data || !res.data.download || !res.data.download.url) {
            console.log("Invalid API Response:", res);
            return reply("❌ Failed to get download link from API.");
        }

        const audioUrl = res.data.download.url;
        const fileName = res.data.download.filename || `${data.title}.mp3`;

        console.log("AUDIO DOWNLOAD URL =>", audioUrl);

        // TEMP FILE PATH
        const filePath = path.join(__dirname, `song_${Date.now()}.mp3`);

        try {
            // DOWNLOAD AUDIO USING BUFFER (SOMETIMES STREAMING GETS BLOCKED)
            const audioRes = await axios({
                url: audioUrl,
                method: "GET",
                responseType: "arraybuffer",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "*/*",
                    "Origin": "https://vajiraofc-apis.vercel.app"
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
            
            // Try sending directly via URL if local downloading fails
            try {
                await conn.sendMessage(from, {
                    audio: { url: audioUrl },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: fileName
                }, { quoted: mek });
            } catch (fallbackErr) {
                console.error("Fallback Send Error:", fallbackErr);
                reply("❌ Failed to download or send the audio file.");
            }

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

    } catch (e) {
        console.error("Global Error:", e);
        reply("❌ Download process failed.");
    }
});
