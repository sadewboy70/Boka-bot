const { cmd } = require('../command')

if (!global.autoReplies) global.autoReplies = {}

cmd({
    pattern: "areply",
    desc: "Add/remove/view auto replies in memory",
    category: "settings",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { args, from, reply }) => {
    try {
        let action = args[0]?.toLowerCase()

        if (!action || action === 'list') {
            let list = Object.keys(global.autoReplies)
              .map(k => `• ${k} → ${global.autoReplies[k]}`)
              .join('\n')
            return reply(`🤖 *Auto Reply List*\n\n${list || 'Empty'}\n\n.areply add hi hello\n.areply del hi`)
        }

        if (action === 'add') {
            let key = args[1]?.toLowerCase()
            let value = args.slice(2).join(' ')
            if (!key ||!value) return reply('Usage:.areply add hi hello machan')

            global.autoReplies[key] = value
            return reply(`✅ Added: *${key}* → ${value}`)
        }

        if (action === 'del') {
            let key = args[1]?.toLowerCase()
            if (!global.autoReplies[key]) return reply('Keyword na bn')

            delete global.autoReplies[key]
            return reply(`🗑️ Deleted: *${key}*`)
        }

    } catch (e) {
        reply('❌ Error: ' + e.message)
    }
})

// Listener eka hadanawa - cmd wala thiyana conn ekenma
if (!global.autoReplyListener) {
    global.autoReplyListener = true

    cmd({}, async (conn) => {
        conn.ev.on('messages.upsert', async (msg) => {
            try {
                let m = msg.messages[0]
                if (!m ||!m.message || m.key.fromMe) return

                let text = (
                    m.message.conversation ||
                    m.message.extendedTextMessage?.text ||
                    ''
                ).toLowerCase().trim()

                if (!text) return

                console.log('[AutoReply] Got:', text) // Terminal eke balanna

                if (global.autoReplies[text]) {
                    await conn.sendMessage(m.key.remoteJid, { text: global.autoReplies[text] }, { quoted: m })
                    console.log('[AutoReply] Sent:', global.autoReplies[text])
                    return
                }

                for (let key in global.autoReplies) {
                    if (text.includes(key)) {
                        await conn.sendMessage(m.key.remoteJid, { text: global.autoReplies[key] }, { quoted: m })
                        console.log('[AutoReply] Sent:', global.autoReplies[key])
                        break
                    }
                }

            } catch (e) {
                console.log('[AutoReply Error]:', e.message)
            }
        })
        console.log('[AutoReply] Listener ON ✅')
    })
                }
