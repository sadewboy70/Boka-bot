const { cmd } = require('../command')
const fs = require('fs')

// 1. Broadcast
cmd({ pattern: "broadcast", desc: "Send msg to all chats", category: "owner", react: "📢", filename: __filename },
async (conn, mek, m, { from, q, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    if (!q) return reply("Msg eka denna")
    let chats = Object.keys(await conn.groupFetchAllParticipating())
    reply(`📢 Sending to ${chats.length} groups...`)
    for (let id of chats) {
        await conn.sendMessage(id, { text: `📢 *BROADCAST*\n\n${q}` }).catch(()=>{})
        await new Promise(r => setTimeout(r, 1000))
    }
    reply("✅ Done")
})

// 2. Block/Unblock
cmd({ pattern: "block", desc: "Block user", category: "owner", react: "🚫", filename: __filename },
async (conn, mek, m, { from, q, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    let jid = q? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted? m.quoted.sender : m.sender
    await conn.updateBlockStatus(jid, 'block')
    reply(`✅ Blocked ${jid}`)
})

cmd({ pattern: "unblock", desc: "Unblock user", category: "owner", react: "✅", filename: __filename },
async (conn, mek, m, { from, q, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    let jid = q? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted? m.quoted.sender : m.sender
    await conn.updateBlockStatus(jid, 'unblock')
    reply(`✅ Unblocked ${jid}`)
})

// 3. Get Profile Pic
cmd({ pattern: "pp", desc: "Get profile pic", category: "owner", react: "🖼️", filename: __filename },
async (conn, mek, m, { from, q }) => {
    let jid = q? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted? m.quoted.sender : m.sender
    try {
        let pp = await conn.profilePictureUrl(jid, 'image')
        await conn.sendMessage(from, { image: { url: pp }, caption: `🖼️ Profile Pic` })
    } catch { reply("❌ No PP") }
})

// 4. Restart Bot
cmd({ pattern: "restart", desc: "Restart bot", category: "owner", react: "🔄", filename: __filename },
async (conn, mek, m, { from, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    reply("🔄 Restarting...")
    process.exit(1)
})

// 5. Eval
cmd({ pattern: "eval", desc: "Run JS code", category: "owner", react: "💻", filename: __filename },
async (conn, mek, m, { from, q, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    if (!q) return reply("Code eka denna")
    try {
        let res = await eval(q)
        reply(`💻 *Result:*\n${require('util').inspect(res)}`)
    } catch (e) { reply(`❌ Error:\n${e.message}`) }
})

// 6. Get Group List
cmd({ pattern: "grouplist", desc: "List all groups", category: "owner", react: "👥", filename: __filename },
async (conn, mek, m, { from, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    let groups = await conn.groupFetchAllParticipating()
    let list = Object.values(groups).slice(0, 15).map(g => `👥 ${g.subject}\n🆔 ${g.id}`).join('\n\n')
    reply(`📊 *Groups:* ${Object.keys(groups).length}\n\n${list}`)
})

// 7. Leave Group
cmd({ pattern: "leave", desc: "Leave group", category: "owner", react: "🚪", filename: __filename },
async (conn, mek, m, { from, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    if (!from.endsWith('@g.us')) return reply("Group eke witharak")
    await conn.groupLeave(from)
    reply("🚪 Left group")
})

// 8. Promote/Demote
cmd({ pattern: "promote", desc: "Make admin", category: "owner", react: "👑", filename: __filename },
async (conn, mek, m, { from, q, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    let jid = q? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted?.sender
    await conn.groupParticipantsUpdate(from, [jid], 'promote')
    reply(`👑 Promoted ${jid}`)
})

cmd({ pattern: "demote", desc: "Remove admin", category: "owner", react: "⬇️", filename: __filename },
async (conn, mek, m, { from, q, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    let jid = q? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted?.sender
    await conn.groupParticipantsUpdate(from, [jid], 'demote')
    reply(`⬇️ Demoted ${jid}`)
})

// 9. Set Bot Name & Bio
cmd({ pattern: "setname", desc: "Set bot name", category: "owner", react: "✏️", filename: __filename },
async (conn, mek, m, { from, q, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    if (!q) return reply("Name eka denna")
    await conn.updateProfileName(q)
    reply(`✅ Name changed to ${q}`)
})

cmd({ pattern: "setbio", desc: "Set bot bio", category: "owner", react: "📝", filename: __filename },
async (conn, mek, m, { from, q, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    if (!q) return reply("Bio eka denna")
    await conn.updateProfileStatus(q)
    reply(`✅ Bio changed to ${q}`)
})

// 10. Bot Info
cmd({ pattern: "botinfo", desc: "Bot system info", category: "owner", react: "📊", filename: __filename },
async (conn, mek, m, { from }) => {
    const os = require('os')
    let text = `
╭─════════─╮
│ 📊 *BOT INFO* 📊
╰─════════─╯

┏━━━━━━━━━━━━━━┓
┃ 🖥️ *OS* : ${os.platform()}
┃ 💾 *RAM* : ${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)}MB
┃ ⏳ *UPTIME* : ${Math.floor(process.uptime()/3600)}h ${Math.floor((process.uptime()%3600)/60)}m
┃ 📦 *NODE* : ${process.version}
┗━━━━━━━━┛
    `
    reply(text)
})

// 11. Clear Chat
cmd({ pattern: "clearchat", desc: "Clear chat", category: "owner", react: "🗑️", filename: __filename },
async (conn, mek, m, { from, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    await conn.chatModify({ delete: true }, from)
    reply("🗑️ Chat cleared")
})

// 12. Save Media
cmd({ pattern: "save", desc: "Save quoted media", category: "owner", react: "💾", filename: __filename },
async (conn, mek, m, { from, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    if (!m.quoted) return reply("Reply karala save karanna")
    let media = await conn.downloadMediaMessage(m.quoted)
    fs.writeFileSync(`./saved_${Date.now()}`, media)
    reply("💾 Saved to bot storage")
})

// 13. Block All Unknown
cmd({ pattern: "blockall", desc: "Block non-contacts", category: "owner", react: "🚫", filename: __filename },
async (conn, mek, m, { from, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    let chats = Object.keys(await conn.fetchChats())
    let count = 0
    for (let chat of chats) {
        if (!chat.endsWith('@g.us') &&!chat.includes('@newsletter')) {
            await conn.updateBlockStatus(chat, 'block').catch(()=>{})
            count++
        }
    }
    reply(`🚫 Blocked ${count} unknown chats`)
})

// 14. Get Contact Info
cmd({ pattern: "getcontact", desc: "Get contact info", category: "owner", react: "📇", filename: __filename },
async (conn, mek, m, { from, q }) => {
    let jid = q? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted?.sender
    let contact = await conn.onWhatsApp(jid)
    reply(`📇 *Exists:* ${contact[0]?.exists}\n📱 *JID:* ${jid}`)
})

// 15. Toggle Anti-Call
cmd({ pattern: "anticall", desc: "Auto reject calls", category: "owner", react: "📞", filename: __filename },
async (conn, mek, m, { from, q, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only")
    global.anticall = q === 'on'
    reply(`📞 AntiCall: ${global.anticall? 'ON' : 'OFF'}`)
})
