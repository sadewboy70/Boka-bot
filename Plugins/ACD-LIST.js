const { cmd } = require('../command')
const config = require('../config')

cmd({
    pattern: "developer",
    desc: "Show bot owner info",
    category: "info",
    react: "⭐",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        let ownerText = `
╭━━━━━━━━━━━━━━━╮
┃ 👑 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 👑
╰━━━━━━━━━━━━━━━╯

╭──〔 *OWNER* 〕──╮
┃ Name : Hashan
┃ Country : 🇱🇰 Sri Lanka
┃ Status : Active
╰─────────────────╯

╭──〔 *CONTACT* 〕──╮
┃ WhatsApp : wa.me/94716042889
┃ YouTube : youtube.com/@HashanMD
┃ GitHub : github.com/HASHU-MD
╰──────────────────╯

╭──〔 *NOTE* 〕──╮
┃ Don't spam owner
┃ For business only
┃ Respect each other
╰────────────────╯

_Thank you for using ${config.BOT_NAME || 'Hashan-MD MINI'}_ ❤️
`

        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/vbo0vq.png' },
            caption: ownerText,
            footer: `© 2025 ${config.BOT_NAME || 'Hashan-MD MINI'}`
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
        await conn.sendMessage(from, { text: "❌ Error: " + e.message }, { quoted: mek })
    }
})
