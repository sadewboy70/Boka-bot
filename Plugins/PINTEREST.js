const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pinterest",
    desc: "Search images from Pinterest",
    category: "search",
},
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("✨ *PINTEREST SEARCH*\n\n*Usage:*\n`.pin [search_term]`\n\n*Example:*\n`.pin cat`");

    try {
        await reply("⏳ *Searching on Pinterest...*");

        const res = await axios.get(`https://apis.davidcyriltech.my.id/search/pinterest?text=${encodeURIComponent(q)}`);
        
        // දත්ත තිබේදැයි පරීක්ෂා කිරීම සහ ආරක්ෂිතව අගයන් ලබා ගැනීම
        if (res.data?.success === true && Array.isArray(res.data.result) && res.data.result.length > 0) {
            const results = res.data.result.slice(0, 5); 
            
            let caption = `🖼 *Pinterest Search Results*\n*Query:* ${q}\n\n`;
            
            // ලූප් එක තුළ දත්ත null වුවද ප්‍රශ්නයක් නොවන සේ හැඩගැන්වීම
            results.forEach((item, index) => {
                const name = item.fullName || "Unknown";
                const uploader = item.uploader || "Unknown";
                caption += `*${index + 1}.* ${name} (@${uploader})\n`;
            });

            // මුල් පින්තූරය යැවීම
            await conn.sendMessage(m.chat, { 
                image: { url: results[0].image }, 
                caption: caption 
            }, { quoted: mek });

            // ඉතිරි පින්තූර පරතරයක් සහිතව යැවීම
            for (let i = 1; i < results.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 800));
                await conn.sendMessage(m.chat, { 
                    image: { url: results[i].image },
                    caption: `*${i + 1}.* ${results[i].fullName || "Pinterest Image"}`
                }, { quoted: mek });
            }
            
        } else {
            reply("❌ *No images found!*");
        }
    } catch (e) {
        // එරර් එකක් ආවොත් බොට් ක්‍රෑෂ් නොවී මෙතැනදී දැනුම් දේ
        console.error("Pinterest Error:", e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
