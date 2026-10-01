const { cmd } = require('../command');
const axios = require('axios');
const fsSync = require('fs');
const os = require('os');
const path = require('path');

cmd({
    pattern: "tiktok",
    alias: ["tt"],
    react: "📥",
    desc: "Download TikTok videos (Fast Auto-Fallback)",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const query = args[0];
        if (!query) return reply("🔗 *ᴘʟᴇᴀꜱᴇ ꜱᴇɴᴅ ᴀ ᴛɪᴋᴛᴏᴋ ʟɪɴᴋ!*");

        if (!/(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/.test(query)) {
            return reply("❌ *ɪɴᴠᴀʟɪᴅ ᴛɪᴋᴛᴏᴋ ʟɪɴᴋ!*");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let videoUrl, title, channelName, views, likes;

        // 🟢 1. PRIMARY API (TikWM) - තත්පර 4ක Timeout එකක් දීල තියෙන්නේ
        try {
            const tikwmRes = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(query)}&hd=1`, { timeout: 4000 });
            const tikdata = tikwmRes.data;

            if (!tikdata || tikdata.code !== 0 || !tikdata.data) {
                throw new Error("TikWM Limit Reached or Blocked");
            }
            
            const data = tikdata.data;
            videoUrl = data.hdplay || data.play;
            title = data.title || "No Description";
            channelName = data.author?.nickname || "Unknown";
            views = data.play_count || 0;
            likes = data.digg_count || 0;

        } catch (err) {
            console.log("TikWM Failed/Timeout, instantly switching to Kavindu API...");
            
            // 🟢 2. BACKUP API (Kavindu API) - පළවෙනි එක Fail වුණොත් මේක වැඩ කරනවා
            const kavinduRes = await axios.get(`https://kavindu-download-web.vercel.app/api/tiktok?url=${encodeURIComponent(query)}`, { timeout: 10000 });
            const kavdata = kavinduRes.data;

            if (!kavdata || kavdata.status !== true || !kavdata.data) {
                return reply("❌ *Main API & Backup API දෙකම මේ වෙලාවේ වැඩ කරන්නේ නෑ!*");
            }

            const data = kavdata.data;
            videoUrl = data.nowm || data.hdplay || data.play || data.video;
            title = data.title || data.description || "No Description";
            channelName = data.author?.nickname || data.author || "Unknown Channel";
            views = "N/A (Backup API)"; // Backup එකෙන් views එන්නේ නැති නිසා
            likes = "N/A (Backup API)";
        }

        if (!videoUrl) return reply("❌ *ᴠɪᴅᴇᴏ ʟɪɴᴋ ɴᴏᴛ ꜰᴏᴜɴᴅ!*");
        
        if (!videoUrl.startsWith('http')) {
            videoUrl = `https://www.tikwm.com${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
        }

        const caption = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ 🎐 ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ 🎐
┊
┊ 🎬 *ᴛɪᴛʟᴇ* : ${title.substring(0, 50)}...
┊ 👤 *ᴄʜᴀɴɴᴇʟ* : ${channelName}
┊ 👁️ *ᴠɪᴇᴡꜱ* : ${views.toLocaleString()}
┊ ❤️ *ʟɪᴋᴇꜱ* : ${likes.toLocaleString()}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0 🎐`;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        const tempVideoPath = path.join(os.tmpdir(), `tiktok_${Date.now()}.mp4`);
        
        const responseStream = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const writer = fsSync.createWriteStream(tempVideoPath);
        responseStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await conn.sendMessage(from, {
            video: fsSync.readFileSync(tempVideoPath),
            mimetype: 'video/mp4',
            caption: caption,
            fileName: `Sadew_Mini_${Date.now()}.mp4`
        }, { quoted: mek });

        if (fsSync.existsSync(tempVideoPath)) fsSync.unlinkSync(tempVideoPath);
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("TikTok Error:", e.message);
        reply(`❌ *ᴇʀʀᴏʀ:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
