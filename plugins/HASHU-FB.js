const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "fb",
    alias: ["facebook", "fbdl"],
    react: "📥",
    desc: "Download Facebook videos using Kurox API (Direct HD Video)",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const fullArgs = args.join(" ");
        if (!fullArgs) return reply("🔗 *කරුණාකර Facebook Video Link එකක් ලබා දෙන්න!*");

        const urlMatch = fullArgs.match(/https?:\/\/[^\s]+/i);
        if (!urlMatch) return reply("🔗 *කරුණාකර Facebook Video Link එකක් ලබා දෙන්න!*");
        const fbUrl = urlMatch[0];

        if (!fbUrl.includes('facebook') && !fbUrl.includes('fb')) {
            return reply("❌ *මෙය නිවැරදි Facebook Link එකක් නොවේ!*");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const apiKey = "kx_27d485da9d2ec5dcfe3b37fa8713a8e0";
        const apiUrl = `https://api.kurox.site/api/v1/facebook?apiKey=${apiKey}&url=${encodeURIComponent(fbUrl)}&type=video`;

        const res = await axios.get(apiUrl, {
            headers: {
                "X-API-KEY": apiKey
            },
            timeout: 60000 
        });

        if (!res.data || res.data.status !== true || !res.data.url) {
            return reply("❌ *වීඩියෝ දත්ත ලබාගැනීමට නොහැකි විය. Link එක නැවත පරීක්ෂා කරන්න!*");
        }

        const videoUrl = res.data.url;
        // Caption එකට සම්පූර්ණ විස්තරයම එකතු කිරීම
        const title = res.data.title || "Facebook Video"; 
        const quality = res.data.quality || "HD";

        // ඔයාගේ config.js එකේ තියෙන SADEW -MD-MINI-V6 නම මෙතනට ඔටෝ එනවා
        const botName = config.BOT_NAME || "SADEW MINI";

        const caption = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ 📘 *FACEBOOK DOWNLOADER* 
┊
┊ 🎬 *Description:* ${title}
┊ ✨ *Quality:* ${quality}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

> ${botName}`;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        // 🟢 mimetype එක අනිවාර්ය කර ඇත, එබැවින් Caption එක drop වන්නේ නැත.
        await conn.sendMessage(from, {
            video: { url: videoUrl }, 
            caption: caption,
            mimetype: 'video/mp4',
            fileName: `Sadew_Mini_FB_${Date.now()}.mp4`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Facebook DL Error:", e);
        reply(`❌ *Error:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
