const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "tagall",
    alias: ["everyone"],
    react: "📢",
    desc: "Tag all group members",
    category: "group",
    filename: __filename
},
async(conn, mek, m, { from, isGroup, isAdmins, participants, reply, q }) => {
    if (!isGroup) return reply("ගෲප් එකකදී පමණක් භාවිතා කරන්න.");
    if (!isAdmins) return reply("මෙය භාවිතා කිරීමට ඔබ Admin කෙනෙකු විය යුතුය! 🚫");

    let message = q ? q : "Attention Everyone!";
    let txt = `*📢 ${config.BOT_NAME || 'HASHAN-MD-MINI'} TAG-ALL*\n\n*Message:* ${message}\n\n`;
    
    for (let mem of participants) {
        txt += `🤍 @${mem.id.split('@')[0]}\n`;
    }

    await conn.sendMessage(from, { 
        text: txt, 
        mentions: participants.map(a => a.id) 
    }, { quoted: mek });
})
