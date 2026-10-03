const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "fb",
    alias: ["facebook", "fbdl"],
    react: "📥",
    desc: "Download Facebook videos using Kurox API (Direct Stream)",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const fullArgs = args.join(" ");
        if (!fullArgs) return reply("🔗 *කරුණාකර Facebook Video Link එකක් ලබා දෙන්න!*");

        // ලින්ක් එකක් විතරක් වෙන් කරගැනීම (අකුරු මැද ලින්ක් එකක් තිබ්බත් වැඩ කරනවා)
        const urlMatch = fullArgs.match(/https?:\/\/[^\s]+/i);
        if (!urlMatch) return reply("🔗 *කරුණාකර Facebook Video Link එකක් ලබා දෙන්න!*");
        const fbUrl = urlMatch[0];

        // ඕනෑම Facebook ලින්ක් ෆෝමැට් එකක් අඳුරගැනීම (share/r, fb.watch, fb.gg ඔක්කොම සපෝට්)
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
        const title = res.data.title || "Facebook Video";
        const caption = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ 📘 *FACEBOOK DOWNLOADER* 
┊
┊ 🎬 *Title:* ${title.substring(0, 50)}...
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0`;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        // 🟢 RAM එක පාවිච්චි කරන්නේ නැතුව කෙලින්ම API URL එකෙන් WhatsApp එකට Stream කිරීම
        await conn.sendMessage(from, {
            document: { url: videoUrl }, 
            mimetype: 'video/mp4',
            fileName: `Sadew_Mini_FB_${Date.now()}.mp4`,
            caption: caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Facebook DL Error:", e);
        reply(`❌ *Error:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
