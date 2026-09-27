const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "mute",
    react: "🔒",
    desc: "Mute the group chat (Multi-method fix)",
    category: "group",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!isGroup) return reply("❌ This command can only be used in a group!")
    if (!isBotAdmins) return reply("❌ I need to be an Admin to mute this group!")

    let done = false;

    // ක්‍රමය 1: Standard Baileys Method
    try {
        await conn.groupSettingUpdate(from, 'announcement')
        done = true;
    } catch (err) {
        console.log("Method 1 failed, trying Method 2...");
    }

    // ක්‍රමය 2: Alternative Baileys Method (සමහර බොට්ස් වල වැඩ කරන්නේ මෙහෙම)
    if (!done) {
        try {
            await conn.groupSettingChange(from, 'announcement', true)
            done = true;
        } catch (err) {
            console.log("Method 2 failed, trying Method 3...");
        }
    }

    // ක්‍රමය 3: WAMessage/Update Method
    if (!done) {
        try {
            await conn.groupUpdate({ id: from, announce: true })
            done = true;
        } catch (err) {
            console.log("Method 3 failed.");
        }
    }

    // සාර්ථක වුණොත් විතරක් මැසේජ් එක යවනවා
    if (done) {
        let muteMsg = `*╭┈───────────────•*
*🔒 GROUP MUTED SUCCESSFULLY*
*╰┈───────────────•*

 ◈ • *Group:* ${groupName}
 ◈ • *Action by:* @${senderNumber}
 ◈ • *Status:* Only Admins can send messages now.

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʜᴀꜱʜᴀɴ-ᴍᴅ ᴍɪɴɪ ʙᴏᴛ`

        await conn.sendMessage(from, { text: muteMsg, mentions: [sender] }, { quoted: mek })
    } else {
        reply("❌ Error: WhatsApp එකෙන් මේ ගෲප් එක ලොක් කරන්න දෙන්නේ නැහැ. බොටාගේ ලයිබ්‍රරි අවුලක්!")
    }

}catch(e){
    console.log(e)
    reply(`❌ Error: ${e}`)
}
})
