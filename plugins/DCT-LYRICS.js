const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "zanta_5RBAHnr9IK0tLrCCUqKuhQZu";

cmd({
    pattern: "lyrics",
    desc: "Search song lyrics",
    category: "search",
},
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("❌ ගීතයේ නම දෙන්න (උදා: .lyrics Lelena)");
    
    try {
        reply("⏳ ගීතයේ පදමාලාව සොයමින් පවතී...");
        
        const res = await axios.get(`https://api.zanta-mini.store/api/lirycs?apiKey=${API_KEY}&query=${encodeURIComponent(q)}`);
        
        if (res.data && res.data.success === true) {
            const data = res.data.result;
            const caption = `🎵 *${data.title}*\n\n🔗 ${data.url}\n\n📜 *Lyrics:*\n\n${data.lyrics}`;
            
            // පින්තූරෙ යැවීමට උත්සාහ කිරීම
            try {
                await conn.sendMessage(m.chat, { 
                    image: { url: data.thumbnail }, 
                    caption: caption 
                }, { quoted: mek });
            } catch (e) {
                // පින්තූරෙ ලෝඩ් වුණේ නැත්නම් පද ටික විතරක් යැවීම
                await conn.sendMessage(m.chat, { text: caption }, { quoted: mek });
            }
            
        } else {
            reply("❌ ගීතය සොයාගත නොහැක.");
        }
    } catch (e) {
        reply("❌ දෝෂයක්: " + e.message);
    }
});
