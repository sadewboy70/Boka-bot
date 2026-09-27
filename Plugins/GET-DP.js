const { cmd } = require('../command');

cmd({
    pattern: "getdp",
    desc: "Get profile picture by number or reply",
    category: "tools",
},
async (conn, mek, m, { q, reply }) => {
    // 1. අංකයක් දීලා තියෙනවද බලනවා (q කියන්නේ උඹ ගහන අංකය)
    let target = '';
    
    if (q) {
        // උඹ ගැහූ අංකය පිරිසිදු කරනවා (අකුරු වෙන් කරලා අංකය විතරක් ගන්න)
        const number = q.replace(/[^0-9]/g, '');
        target = number + '@s.whatsapp.net';
    } else if (m.quoted) {
        // රිප්ලයි එකක් නම්
        target = m.quoted.sender;
    } else {
        // රිප්ලයි එකකුත් නැති, අංකෙකුත් නැති නම් තමන්ගේ එක
        target = m.sender;
    }
    
    try {
        // 2. Profile picture URL එක ගන්නවා
        const ppUrl = await conn.profilePictureUrl(target, 'image');
        
        // 3. DP එක යවනවා
        await conn.sendMessage(m.chat, { 
            image: { url: ppUrl }, 
            caption: `✅ *DP එක ගත්තා හූ හූ 🥹🤍:* ${q || 'You/Quoted User'}` 
        }, { quoted: mek });
        
    } catch (e) {
        reply("❌ *Error :* Could not find profile picture. (User might have it private or invalid number)");
    }
});
