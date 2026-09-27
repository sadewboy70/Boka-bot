const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "whois",
    alias: ["userinfo"],
    react: "👤",
    desc: "Get user info",
    category: "info",
    filename: __filename
},
async(conn, mek, m, { from, quoted, pushname, reply }) => {
    const user = quoted ? quoted.sender : m.sender;
    const num = user.split('@')[0];
    
    let info = `
*👤 ${config.BOT_NAME || 'HASHAN-MD-MINI'} USER INFO*

*📎 Name:* ${pushname}
*📱 Number:* ${num}
*🔗 Jid:* ${user}
*🟢 Status:* Active

*Created by MR HASHAN*
`
    await reply(info);
})
