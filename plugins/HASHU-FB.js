const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "fb",
    alias: ["facebook", "fbdl"],
    react: "📥",
    desc: "Download Facebook videos using Kurox API",
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

        // 🟢 API එකට Browser එකකින් එනවා වගේ පෙන්නන්න User-Agent එකක් දානවා
        const res = await axios.get(apiUrl, {
            headers: {
                "X-API-KEY": apiKey,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            timeout: 60000 
        });

        if (!res.data || res.data.status !== true || !res.data.url) {
            return reply("❌ *වීඩියෝ දත්ත ලබාගැනීමට නොහැකි විය. Link එක නැවත පරීක්ෂා කරන්න!*");
        }

        const videoUrl = res.data.url;
        const title = res.data.title || "Facebook Video";
        const quality = res.data.quality || "HD";
        
        // 🟢 Title එක අකුරු 150ට වඩා දිග නම් විතරක් අගට "..." දානවා. නැත්නම් ඒ විදිහටම තියනවා.
        const displayTitle = title.length > 150 ? title.substring(0, 150) + "..." : title;
        
        const botName = config.BOT_NAME || "SADEW MINI";

        const caption = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ 📘 *FACEBOOK DOWNLOADER* 
┊
┊ 🎬 *Title:* ${displayTitle}
┊ ✨ *Quality:* ${quality}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

> ${botName}`;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        await conn.sendMessage(from, {
            video: { url: videoUrl }, 
            caption: caption,
            mimetype: 'video/mp4'
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Facebook DL Error:", e);
        reply(`❌ *Error:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
