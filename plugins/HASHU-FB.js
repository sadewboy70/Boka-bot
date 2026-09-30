const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "fb",
    alias: ["facebook", "fbdl"],
    desc: "Download Facebook Videos",
    category: "download",
    react: "📘",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q || (!q.includes('facebook.com') && !q.includes('fb.watch') && !q.includes('fb.gg'))) {
            return reply("🔗 *කරුණාකර නිවැරදි Facebook Video ලින්ක් එකක් ලබා දෙන්න.*");
        }

        const botName = config.BOT_NAME || "SADEW-MINI";
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let videoData = null;
        let hdUrl = null;
        let sdUrl = null;
        let title = "Facebook Video";

        // 🎯 API 1: Siputzx API (Highly Stable)
        try {
            const res1 = await axios.get(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(q)}`, { timeout: 15000 });
            if (res1.data?.status && res1.data?.data) {
                const data = res1.data.data;
                hdUrl = data.urls.find(u => u.quality === 'HD')?.url || data.urls[0]?.url;
                sdUrl = data.urls.find(u => u.quality === 'SD')?.url || hdUrl;
                title = data.title || title;
                videoData = true;
                console.log("✅ Using Siputzx FB API");
            }
        } catch (e) {}

        // 🎯 API 2: Vreden API (Backup 1)
        if (!videoData) {
            try {
                const res2 = await axios.get(`https://api.vreden.my.id/api/facebook?url=${encodeURIComponent(q)}`, { timeout: 15000 });
                if (res2.data?.result) {
                    const data = res2.data.result;
                    hdUrl = data.hd || data.sd || data.url;
                    sdUrl = data.sd || hdUrl;
                    title = data.title || title;
                    videoData = true;
                    console.log("✅ Using Vreden FB API");
                }
            } catch (e) {}
        }

        // 🎯 API 3: David Cyril API (Backup 2)
        if (!videoData) {
            try {
                const res3 = await axios.get(`https://apis.davidcyril.name.ng/download/facebook?url=${encodeURIComponent(q)}`, { timeout: 15000 });
                if (res3.data?.success && res3.data?.result) {
                    const data = res3.data.result;
                    hdUrl = data.video_hd || data.video_sd;
                    sdUrl = data.video_sd || hdUrl;
                    title = data.title || title;
                    videoData = true;
                    console.log("✅ Using David Cyril FB API");
                }
            } catch (e) {}
        }

        if (!videoData || !hdUrl) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ *වීඩියෝව ලබාගත නොහැක. මෙය Private Group එකක වීඩියෝවක් විය හැක.*");
        }

        const caption = 
`╭━━〔 *📘 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 📘* 〕━━⬣
┃
┃ • *🎬 Title:* ${title.substring(0, 60)}...
┃ 
┃ ✨ 𝗩𝗜𝗗𝗘𝗢 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚...
╰━━━━━━━━━━━━━━━━━━⬣

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        // 🟢 SEND HD VIDEO TO WHATSAPP 🟢
        try {
            await conn.sendMessage(from, {
                video: { url: hdUrl },
                caption: caption,
                mimetype: "video/mp4",
                fileName: `Sadew_FB_${Date.now()}.mp4`
            }, { quoted: mek });
            
            await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

        } catch (vidErr) {
            console.log("HD Video sending failed. Trying SD...");
            // HD එක යවන්න බැරි වුණොත් (සයිස් එක වැඩි නම්) SD Quality එක යවන්න ට්‍රයි කරනවා
            if (sdUrl && sdUrl !== hdUrl) {
                await conn.sendMessage(from, {
                    video: { url: sdUrl },
                    caption: caption + "\n_(Sent in SD quality due to file size)_",
                    mimetype: "video/mp4",
                    fileName: `Sadew_FB_SD_${Date.now()}.mp4`
                }, { quoted: mek });
                await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
            } else {
                throw vidErr;
            }
        }

    } catch (e) {
        console.error("Global FB Error:", e.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ *දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.*");
    }
});
