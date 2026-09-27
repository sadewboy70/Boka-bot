const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "apk",
    desc: "Download Android APKs",
    category: "download",
},
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("✨ *APK DOWNLOADER*\n\n*Usage:*\n`.apk [app_name]`\n\n*Example:*\n`.apk whatsapp`");

    try {
        await reply("⏳ *Searching for your app...*");

        const res = await axios.get(`https://apis.davidcyriltech.my.id/download/apk?text=${encodeURIComponent(q)}`);
        
        if (res.data && res.data.status === true) {
            const data = res.data.apk;
            
            // ලස්සන UI එකක් සහිත Caption එක
            const uiCaption = `📱 *ANDROID APK DOWNLOADER*

📦 *Name:* ${data.name}
🆔 *Package:* ${data.package}
📅 *Version:* ${data.lastUpdated}
🔗 *Source:* Aptoide

─────────────────
✅ *Uploading APK file...*
*Please wait a moment.*`;

            // 1. Thumbnail එකත් එක්ක UI එක යවනවා
            await conn.sendMessage(m.chat, { 
                image: { url: data.icon }, 
                caption: uiCaption 
            }, { quoted: mek });

            // 2. RAM එක බේරගන්න Direct URL Stream එක පාවිච්චි කරනවා
            await conn.sendMessage(m.chat, { 
                document: { url: data.downloadLink }, 
                mimetype: 'application/vnd.android.package-archive',
                fileName: data.name + ".apk",
                caption: `📥 *Downloading:* ${data.name}`
            }, { quoted: mek });
            
        } else {
            reply("❌ *APK not found!* Please check the spelling.");
        }
    } catch (e) {
        reply(`❌ *Error:* ${e.message}\n\n*Note:* The file might be too large or the server is busy.`);
    }
});
