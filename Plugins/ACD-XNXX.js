const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "zanta_5RBAHnr9IK0tLrCCUqKuhQZu";

// 1. Search Command
cmd({
    pattern: "xnxx",
    desc: "Search XNXX videos",
    category: "download",
},
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("❌ හොයන්න ඕනේ නම දෙන්න (උදා: .xnxx sri lanka)");
    
    try {
        reply("⏳ සොයමින් පවතී...");
        
        const res = await axios.get(`https://api.zanta-mini.store/api/xnxx/search?apiKey=${API_KEY}&url=${encodeURIComponent(q)}`);
        const data = res.data.results; 

        if (!data || data.length === 0) return reply("❌ කිසිවක් හමු නොවීය.");

        let msg = "🔎 *DCT BOT - XNXX SEARCH*\n\n";
        
        // results 10ක් දක්වා පෙන්නනවා
        data.slice(0, 10).map((v, i) => {
            msg += `*${i + 1}. ${v.title}*\n🔗 ${v.url}\n\n`;
        });
        
        reply(msg + "📥 ඩවුන්ලෝඩ් කිරීමට: .xndl [url]");
    } catch (e) {
        reply("❌ දෝෂයක්: " + e.message);
    }
});

// 2. Download Command
cmd({
    pattern: "xndl",
    desc: "Download XNXX video",
    category: "download",
},
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("❌ කරුණාකර වීඩියෝ ලින්ක් එක දෙන්න.");

    try {
        reply("⏳ වීඩියෝව බාගත වෙමින්...");
        
        const res = await axios.get(`https://api.zanta-mini.store/api/xnxx/dl?apiKey=${API_KEY}&url=${encodeURIComponent(q)}`);
        
        if (res.data && res.data.status === true) {
            const dlData = res.data.data;
            const caption = `✅ *XNXX Download Success*\n\n🎬 *Title:* ${dlData.title}\n⏱ *Duration:* ${dlData.duration}\n\n📥 *Download Link:* ${dlData.download_link}`;
            
            await conn.sendMessage(m.chat, { text: caption }, { quoted: mek });
        } else {
            reply("❌ වීඩියෝව බාගත කළ නොහැක. ලින්ක් එක පරීක්ෂා කරන්න.");
        }
    } catch (e) {
        reply("❌ දෝෂයක්: " + e.message);
    }
});
