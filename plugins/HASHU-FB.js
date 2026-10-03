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
        const fbUrl = args[0];
        if (!fbUrl) return reply("🔗 *කරුණාකර Facebook Video Link එකක් ලබා දෙන්න!*");

        if (!fbUrl.includes('facebook.com') && !fbUrl.includes('fb.watch') && !fbUrl.includes('fb.gg')) {
            return reply("❌ *මෙය නිවැරදි Facebook Link එකක් නොවේ!*");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // API Request යැවීම
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

        // 🟢 RAM Buffer එකක් නැතුව කෙලින්ම URL එක හරහා Direct Stream කිරීම
        await conn.sendMessage(from, {
            document: { url: videoUrl }, // කෙලින්ම API එකෙන් ආපු ලින්ක් එක දෙනවා
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
