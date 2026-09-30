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

        // 🟢 API Request (User-Agent එකත් එක්කම යවනවා බ්ලොක් නොවෙන්න)
        const apiUrl = `https://supunofc.site/api/download/ytmp3-down?url=${encodeURIComponent(data.url)}&apikey=supun-ecjevwrksqz9q5m6rnbmgmqe`;
        
        const response = await axios.get(apiUrl, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 20000 
        });
        
        let res = response.data;
        if (typeof res === "string") {
            res = JSON.parse(res);
        }

        let audioUrl = null;
        if (res && res.success && res.result && Array.isArray(res.result)) {
            const track = res.result.find(t => t.type === "Audio Track" && t.downloadUrl) || res.result[0];
            if (track && track.downloadUrl) {
                audioUrl = track.downloadUrl;
            }
        }

        if (!audioUrl) {
            return reply("❌ *API එකෙන් Download Link එක ලබා දුන්නේ නැත.*");
        }

        // 📥 File එක Manual Download කිරීම (Baileys වලින් එන IP Block Error මගහරින්න)
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

        // 🛑 File එක හිස් එකක්ද කියලා බලනවා
        const stats = fs.statSync(tempPath);
        if (stats.size < 1000) {
            fs.unlinkSync(tempPath);
            return reply("❌ *Download වූ File එක හිස්‍ ය. (Google IP Block).*");
        }

        // 🚀 WhatsApp එකට යැවීම (0.0s එන්නේ නැති වෙන්න Local Path එක දෙනවා)
        await conn.sendMessage(from, {
            audio: { url: tempPath },
            mimetype: "audio/mpeg",
            ptt: false,
            fileName: `${data.title}.mp3`
        }, { quoted: mek });

        // යවලා ඉවර උනාට පස්සේ File එක මකනවා (Memory පිරෙන්නේ නෑ)
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }

    } catch (e) {
        console.error("Global Error:", e);
        // දැන් ඇත්තම Error එක මොකක්ද කියලා WhatsApp එකට එනවා 👇
        reply(`❌ *Error:* ${e.message}`);
    }
});
