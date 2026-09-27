const config = require('../config')
const { cmd, commands } = require('../command')

// බොට් රන් වෙන වෙලාවෙ විතරක් ඩේටා තියාගන්න variable එකක් (Memory storage)
let autoReplyStatus = true // Default ඔන් එකේ තියෙන්නේ

// 1. AUTO REPLY ON/OFF කරන්න කමාන්ඩ් එක
cmd({
    pattern: "autoreply",
    react: "🤖",
    desc: "Turn auto reply on or off",
    category: "main",
    filename: __filename
},
async(conn, mek, m, { from, args, isOwner, isMe, reply }) => {
try {
    if (!isOwner && !isMe) return reply("❌ Only the Bot Owner can use this command!")
    if (!args[0]) return reply("💡 Use: `.autoreply on` or `.autoreply off`")

    let status = args[0].toLowerCase()
    if (status === 'on') {
        autoReplyStatus = true
        return reply("🟢 Auto Reply System has been turned *ON*.")
    } else if (status === 'off') {
        autoReplyStatus = false
        return reply("🔴 Auto Reply System has been turned *OFF*.")
    } else {
        return reply("❌ Invalid option! Use `.autoreply on` or `.autoreply off`")
    }
} catch (e) {
    reply(`${e}`)
}
})

// 2. "HI" වලට විතරක් රිප්ලයි වෙන ලොජික් එක
cmd({
    on: "body" // මැසේජ් එක කියවනවා
},
async(conn, mek, m, { from, body, isCmd, isGroup, sender, senderNumber, pushname, reply }) => {
try {
    // සිස්ටම් එක ඕෆ් නම්, කමාන්ඩ් එකක් නම්, නැත්නම් බොට් විසින්ම දාන මැසේජ් එකක් නම් රිප්ලයි කරන්නේ නැහැ
    if (!autoReplyStatus || isCmd || m.key.fromMe) return

    // එන මැසේජ් එක හිස්තැන් අයින් කරලා lowercase කරගන්නවා චෙක් කරන්න ලේසි වෙන්න
    const cleanMessage = body ? body.toLowerCase().trim() : ''

    // ---- [ EXACT MATCH AUTO REPLIES ] ----
    
    // කවුරු හරි "hi" හෝ "hello" විතරක්ම එව්වොත්:
    if (cleanMessage === 'hi' || cleanMessage === 'hello') {
        let replyMsg = `👋 Hi ${pushname}, hello! How can I help you?\n\n> © 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧 `
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    if (cleanMessage === 'gm' || cleanMessage === 'good moring') {
        let replyMsg = `*GOOD MORNING* 🙂🤍\n\n> © 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    if (cleanMessage === 'gn' || cleanMessage === 'good night') {
        let replyMsg = `*GOOD NIGHT* 🙂🤍\n\n> © 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }


    if (cleanMessage === 'sawi' || cleanMessage === 'mine') {
        let replyMsg = `*Ow ow sawii patiya thamay mage pana ekit adre tharn eywth dnne na thama 🙂💗*\n\n> © 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    if (cleanMessage === 'alive' || cleanMessage === 'bot') {
        let replyMsg = `*𝗛𝗔𝗦𝗛𝗔𝗡-𝗠𝗗-𝗠𝗜𝗡𝗜 𝗔𝗟𝗜𝗩𝗘 𝗡𝗢𝗪 🙂🤍*\n\n> © 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }


    if (cleanMessage === 'mm' || cleanMessage === 'mmm') {
        let replyMsg = `*මොකද ම්ම් ගාන්නෙ 🫡✨*\n\n> © 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    if (cleanMessage === 'hmm' || cleanMessage === 'hm') {
        let replyMsg = `*හ්ම් තමා 🫡🩵*\n\n> © 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }


    if (cleanMessage === 'mk' || cleanMessage === 'mokada karanne') {
        let replyMsg = `*👋 anee ${pushname}, මොනවත් නෑ අනේ මන් ඉතින් ඔහේ ඉන්නවා 🙂🤍*\n\n> © 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    // කවුරු හරි "bot" හෝ "බොටා" කියලා විතරක්ම එව්වොත්:
    if (cleanMessage === 'bot' || cleanMessage === 'බොටා') {
        let replyMsg = `⚡ Yes, I'm online! Type *.menu* to see my commands.\n\n> © 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    // 💡 මෙතනින් එහාට වෙන කිසිම මැසේජ් එකකට (Default away message එකක්) ක්‍රියාත්මක වෙන්නේ නැත!
    // ඒ නිසා දැන් ස්පෑම් වෙන්නේ නෑ 100%.

} catch (e) {
    console.log("Auto Reply Error: ", e)
}
})
