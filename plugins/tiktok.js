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
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        let query = q || args.join(" ");
        
        if (!query && mek.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            let quoted = mek.message.extendedTextMessage.contextInfo.quotedMessage;
            query = quoted.conversation || quoted.extendedTextMessage?.text || "";
        }

        if (!query) return reply("🔗 *ᴘʟᴇᴀꜱᴇ ꜱᴇɴᴅ ᴀ ᴛɪᴋᴛᴏᴋ ʟɪɴᴋ!*");

        const urlMatch = query.match(/https?:\/\/[^\s]*tiktok\.com[^\s]*/i);
        
        if (!urlMatch) {
            return reply("❌ *ɪɴᴠᴀʟɪᴅ ᴛɪᴋᴛᴏᴋ ʟɪɴᴋ!*");
        }

        const finalUrl = urlMatch[0];

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let videoUrl, title, channelName, views, likes;

        try {
            // 🟢 1. PRIMARY API (TikWM)
            const tikwmRes = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(finalUrl)}&hd=1`, { timeout: 4000 });
            const tikdata = tikwmRes.data;

            if (!tikdata || tikdata.code !== 0 || !tikdata.data) {
                throw new Error("TikWM Fail");
            }
            
            const data = tikdata.data;
            videoUrl = data.hdplay || data.play;
            title = data.title || "No Description";
            channelName = data.author?.nickname || "Unknown";
            views = data.play_count || 0;
            likes = data.digg_count || 0;

        } catch (err) {
            console.log("TikWM Failed, instantly switching to Backup API...");
            
            // 🟢 2. BACKUP API (Kavindu API)
            const kavinduRes = await axios.get(`https://kavindu-download-web.vercel.app/api/tiktok?url=${encodeURIComponent(finalUrl)}`, { timeout: 10000 });
            const kavdata = kavinduRes.data;

            // 🛑 මෙන්න මෙතන තමා කලින් වැරදිලා තිබ්බේ. (kavdata.code !== 0) විදිහට හැදුවා.
            if (!kavdata || kavdata.code !== 0 || !kavdata.data) {
                return reply("❌ *Main API & Backup API දෙකම මේ වෙලාවේ වැඩ කරන්නේ නෑ!*");
            }

            const data = kavdata.data;
            videoUrl = data.hdplay || data.play || data.nowm || data.video;
            title = data.title || data.description || "No Description";
            channelName = data.author?.nickname || data.author || "Unknown Channel";
            views = data.play_count || "N/A (Backup API)"; 
            likes = data.digg_count || "N/A (Backup API)";
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
