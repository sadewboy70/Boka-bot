const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "me",
    react: "👤",
    category: "main",
    filename: __filename
},
async(conn, mek, m, { from, pushname, sender, reply }) => {
    const meBotName = config.BOT_NAME || 'HASHAN-MD-MINI';
    const info = `
*👤 ${meBotName} USER DETAILS*

*📎 Name:* ${pushname}
*📱 Number:* ${sender.split('@')[0]}
*🟢 Status:* Active User

*Created by MR ${meBotName} 🙂🤍*
`
    reply(info);
})
