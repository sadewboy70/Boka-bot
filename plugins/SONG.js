const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const os = require('os');
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

        // 🟢 2. PROXIED API REQUESTS (To bypass GitHub IP Block) 🟢
        let downloadUrl = '';

        // 🎯 API 1: Cloudflare Worker API (googlevideo ලින්ක් එක Cloudflare හරහා හංගලා දෙයි)
        try {
            const workerApi = `https://ytdl.udmodzz.workers.dev/?url=${encodeURIComponent(data.url)}&type=aud`;
            const res1 = await axios.get(workerApi, { timeout: 20000 });
            if (res1.data && res1.data.links && res1.data.links["128kbps"]) {
                downloadUrl = res1.data.links["128kbps"]; 
                console.log("✅ Using Cloudflare Worker Proxy Link");
            }
        } catch (e1) {
            console.log("⚠️ Worker API Failed. Switching to Backup...");
        }

        // 🎯 API 2: David Cyril Proxy API (ඔවුන්ගේ සර්වර් එක හරහා ඩවුන්ලෝඩ් කරලා දෙන එකක්)
        if (!downloadUrl) {
            try {
                const proxyApi = `https://apis.davidcyril.name.ng/download/ytmp33?url=${encodeURIComponent(data.url)}`;
                const res2 = await axios.get(proxyApi, { timeout: 20000 });
                if (res2.data?.success && res2.data?.result?.download_url) {
                    downloadUrl = res2.data.result.download_url;
                    console.log("✅ Using Server Proxy Link");
                }
            } catch (e2) {
                console.log("⚠️ Backup Proxy API Failed.");
            }
        }

        if (!downloadUrl) {
            return reply("❌ *Server කාර්යබහුලයි. කරුණාකර පසුව උත්සාහ කරන්න.*");
        }

        // 🟢 3. DOWNLOAD & SEND AUDIO 🟢
        const tempPath = path.join(os.tmpdir(), `song_${Date.now()}.mp3`);

        try {
            // දැන් මේ ලින්ක් එක Proxied එකක් නිසා GitHub IP එකෙන් Block වෙන්නේ නෑ!
            const audioStream = await axios({
                method: 'GET',
                url: downloadUrl,
                responseType: 'stream',
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
                timeout: 60000
            });

            const writer = fs.createWriteStream(tempPath);
            audioStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // WhatsApp එකට යැවීම
            await conn.sendMessage(from, {
                audio: fs.readFileSync(tempPath),
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: `${data.title}.mp3`
            }, { quoted: mek });

            // යැව්වට පස්සේ Temp file එක මකනවා
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

        } catch (downloadErr) {
            console.error("Download Stream Error:", downloadErr.message);
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            
            // 🟢 FALLBACK 🟢
            try {
                await conn.sendMessage(from, {
                    audio: { url: downloadUrl },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: `${data.title}.mp3`
                }, { quoted: mek });
            } catch (fallbackErr) {
                reply("❌ *සින්දුව යැවීමට නොහැකි විය.*");
            }
        }

    } catch (e) {
        console.error("Global Song Error:", e.message);
        reply("❌ *දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.*");
    }
});
