const { cmd } = require('../command')
const config = require('../config')

cmd({ 
    pattern: "post", 
    desc: "Send bot release announcement", 
    category: "info", 
    react: "🚀", 
    filename: __filename 
},
async (conn, mek, m, { from, reply }) => {
    try {
        let text = `
╭━━━━━━━━━━━━━━╮
┃  ⚡ 𝐇𝐀𝐒𝐇𝐀𝐍 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐑𝐄𝐋𝐄𝐀𝐒𝐄 ⚡
╰━━━━━━━━╯

*🇱🇰 Sinhala:*
⚡ Hashan Mini WhatsApp Bot නිල වශයෙන් නිකුත් විය!
ඔයාගේ WhatsApp එක Auto-manage, Status Download, Group Control කරගන්න පුළුවන්. 

🔗 https://gpt-mini-bot-production.up.railway.app/
` + '```Limit: 50 slots only```' + `

*🇬🇧 English:*
⚡ HASHAN MINI WHATSAPP BOT IS OFFICIALLY RELEASED!
Auto-manage WhatsApp, download statuses, control groups & more. 

🔗 https://gpt-mini-bot-production.up.railway.app/
` + '```Only 50 slots available```' + `

*🇮🇳 Tamil:*
⚡ HASHAN MINI WHATSAPP BOT அதிகாரப்பூர்வமாக வெளியிடப்பட்டது!
WhatsApp-ஐ தானாக நிர்வகிக்க, Status Download, Group Control செய்யலாம்.

🔗 https://gpt-mini-bot-production.up.railway.app/
` + '```50 பேருக்கு மட்டுமே Limit```' + `

╭━━━━━━━━━━━━━━╮
┃  ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʜᴀꜱʜᴀɴ-ᴍᴅ ᴍɪɴɪ ʙᴏᴛ ⛦
╰━━━━━━━━╯
        `.trim()

        await conn.sendMessage(from, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363423795377621@newsletter', // optional, remove if u dont have channel
                    newsletterName: config.BOT_NAME || 'HASHAN-MD MINI',
                    serverMessageId: -1
                }
            }
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply("❌ Error: " + e.message)
    }
})
