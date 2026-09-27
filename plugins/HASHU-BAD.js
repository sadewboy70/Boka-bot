const config = require('../config')
const { cmd, commands } = require('../command')

// බොට් රන් වෙන වෙලාවෙ විතරක් ඩේටා තියාගන්න variable එකක් (Memory storage)
let autoReplyStatus = true // Default ඔන් එකේ තියෙන්නේ

// 1. AUTO REPLY ON/OFF කරන්න කමාන්ඩ් එක
cmd({
    pattern: "antibad",
    react: "👨‍💻",
    desc: "Turn auto reply on or off",
    category: "main",
    filename: __filename
},
async(conn, mek, m, { from, args, isOwner, isMe, reply }) => {
try {
    if (!isOwner && !isMe) return reply("❌ Only the Bot Owner can use this command!")
    if (!args[0]) return reply("💡 Use: `.antibad on` or `.antibad off`")

    let status = args[0].toLowerCase()
    if (status === 'on') {
        autoReplyStatus = true
        return reply("👨‍💻 anti bad has been turned *ON*.")
    } else if (status === 'off') {
        autoReplyStatus = false
        return reply("👨‍💻 anti bad has been turned *OFF*.")
    } else {
        return reply("❌ Invalid option! Use `.antibad on` or `.antibad off`")
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
    if (cleanMessage === 'pakaya' || cleanMessage === 'paka') {
        let replyMsg = `*කවුද පොන්නයො පකයා මුලින් බලපන් නගිනවද කියලා 🤝😂*`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    if (cleanMessage === 'ponnaya' || cleanMessage === 'ponni') {
        let replyMsg = `*මම පොන්නයනම් අද උබ මෙතන නෑ හුත්තෝ 🤝😂👍*`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    if (cleanMessage === 'wesi' || cleanMessage === 'baduwa') {
        let replyMsg = `*එතකොට මමද බඩුව 😂👍*`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }


    if (cleanMessage === 'sawani' || cleanMessage === 'mine') {
        let replyMsg = `*Ow ow sawii patiya thamay mage pana ekit adre tharn eywth dnne na thama 🙂💗*\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʜᴀꜱʜᴀɴ-ᴍᴅ ᴍɪɴɪ`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    if (cleanMessage === 'kezu' || cleanMessage === 'Eranda') {
        let replyMsg = `*හේ DCT එකේ මගෙත් හොදම යාලුවෙක් හරිද 🙂💗*`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }


    if (cleanMessage === 'Hm' || cleanMessage === 'Hmm') {
        let replyMsg = `*Mokad Hmm Kiynne 💗✨*\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʜᴀꜱʜᴀɴ-ᴍᴅ ᴍɪɴɪ`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    if (cleanMessage === 'naginawada' || cleanMessage === 'hukapan') {
        let replyMsg = `*උබේ නගින්නෙ නැති එක කැරිම අව්ල 🤝😂*`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }


    if (cleanMessage === 'Moko' || cleanMessage === 'moko karanne') {
        let replyMsg = `👋 anee ${pushname}, Monwth Na Ane Ohe Innawa Man 🙂🤍\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʜᴀꜱʜᴀɴ-ᴍᴅ ᴍɪɴɪ`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    // කවුරු හරි "bot" හෝ "බොටා" කියලා විතරක්ම එව්වොත්:
    if (cleanMessage === 'hashan' || cleanMessage === 'hashu') {
        let replyMsg = `⚡ Yes, I'm online! Type *.menu* to see my commands.\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʜᴀꜱʜᴀɴ-ᴍᴅ ᴍɪɴɪ ʙᴏᴛ`
        return await conn.sendMessage(from, { text: replyMsg }, { quoted: mek })
    }

    // 💡 මෙතනින් එහාට වෙන කිසිම මැසේජ් එකකට (Default away message එකක්) ක්‍රියාත්මක වෙන්නේ නැත!
    // ඒ නිසා දැන් ස්පෑම් වෙන්නේ නෑ 100%.

} catch (e) {
    console.log("Auto Reply Error: ", e)
}
})
