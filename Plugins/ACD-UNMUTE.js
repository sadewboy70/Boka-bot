const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "unmute",
    react: "🔓",
    desc: "Unmute the group chat (Anyone can use)",
    category: "group",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    // 1. Group එකක්ද කියලා විතරක් බලනවා
    if (!isGroup) return reply("❌ This command can only be used in a group!")
    
    // 2. බොටා Admin ද කියලා බලනවා
    if (!isBotAdmins) return reply("❌ Make me an Admin first to unmute this group!")

    // කිසිම Admin Check එකක් නැතුව කෙලින්ම Group එක Unmute කරනවා
    await conn.groupSettingUpdate(from, 'not_announcement')
    
    let unmuteMsg = `*╭┈───────────────•*
*🔓 GROUP UNMUTED SUCCESSFULLY*
*╰┈───────────────•*

 ◈ • *Group:* ${groupName}
 ◈ • *Unmuted by:* @${senderNumber}
 ◈ • *Status:* All members can send messages now.

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʜᴀꜱʜᴀɴ-ᴍᴅ ᴍɪɴɪ`

    await conn.sendMessage(from, { text: unmuteMsg, mentions: [sender] }, { quoted: mek })

}catch(e){
    console.log(e)
    reply(`❌ Error: ${e}`)
}
})
