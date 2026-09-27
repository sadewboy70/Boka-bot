const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "zanta_5RBAHnr9IK0tLrCCUqKuhQZu";

// 1. Search Papers Command
cmd({
    pattern: "paper",
    desc: "Search past papers",
    category: "download",
},
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("❌ හොයන්න ඕනේ විෂය හෝ නම දෙන්න (උදා: .paper maths)");
    
    try {
        reply("⏳ සොයමින් පවතී...");
        
        const res = await axios.get(`https://api.zanta-mini.store/api/paper/search?apiKey=${API_KEY}&url=${encodeURIComponent(q)}`);
        const data = res.data.result; 

        if (!data || data.length === 0) return reply("❌ කිසිවක් හමු නොවීය.");

        let msg = "🔎 *DCT BOT - PAPER SEARCH*\n\n";
        
        data.slice(0, 5).map((v, i) => {
            msg += `*${i + 1}. ${v.title}*\n🔗 ${v.url}\n\n`;
        });
        
        msg += "📥 ඩවුන්ලෝඩ් කිරීමට: .pdl [url]";
        reply(msg);
    } catch (e) {
        reply("❌ දෝෂයක් සිදුවුණා: " + e.message);
    }
});

// 2. Download Paper Command (Document විදියට යවන ක්‍රමය)
cmd({
    pattern: "pdl",
    desc: "Download paper as document",
    category: "download",
},
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("❌ කරුණාකර ලින්ක් එක දෙන්න.");

    try {
        reply("⏳ පේපර් එක බාගත වෙමින් පවතී... ටිකක් ඉන්න.");
        
        const res = await axios.get(`https://api.zanta-mini.store/api/paper/dl?apiKey=${API_KEY}&url=${encodeURIComponent(q)}`);
        
        if (res.data && res.data.success === true) {
            const dlUrl = res.data.download_url;
            const fileName = res.data.title + ".pdf";

            // PDF ඩොකියුමන්ට් එක යවනවා
            await conn.sendMessage(m.chat, { 
                document: { url: dlUrl }, 
                fileName: fileName, 
                mimetype: 'application/pdf',
                caption: `✅ *සාර්ථකයි!*\n📄 *Title:* ${res.data.title}` 
            }, { quoted: mek });
            
        } else {
            reply("❌ පේපර් එක බාගත කළ නොහැක. ලින්ක් එක පරීක්ෂා කරන්න.");
        }
    } catch (e) {
        reply("❌ දෝෂයක්: " + e.message);
    }
});
