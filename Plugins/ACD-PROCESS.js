const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "process",
    desc: "20 Frames long emoji animation.",
    category: "fun",
    react: "🔄",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        // Frames 20 ක් එක දිගට
        const animationFrames = [
            "🔴 ꜱʏꜱᴛᴇᴍ ᴄʜᴇᴄᴋ...",
            "🟠 ꜱʏꜱᴛᴇᴍ ᴄʜᴇᴄᴋ...",
            "🟡 ꜱʏꜱᴛᴇᴍ ᴄʜᴇᴄᴋ...",
            "🟢 ꜱʏꜱᴛᴇᴍ ᴏɴʟɪɴᴇ!",
            "⚙️ ᴄᴏɴꜰɪɢᴜʀɪɴɢ ɴᴏᴅᴇꜱ...",
            "📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴅᴀᴛᴀ... 25%",
            "📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴅᴀᴛᴀ... 50%",
            "📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴅᴀᴛᴀ... 75%",
            "📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴅᴀᴛᴀ... 100%",
            "📦 ᴇxᴛʀᴀᴄᴛɪɴɢ ᴘᴀᴄᴋᴀɢᴇꜱ...",
            "🌑 ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ",
            "🌒 ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ",
            "🌓 ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ",
            "🌔 ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ",
            "🌕 ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ",
            "🚀 ʟᴀᴜɴᴄʜɪɴɢ ᴍᴏᴅᴜʟᴇꜱ...",
            "🔋 ᴘᴏᴡᴇʀɪɴɢ ᴜᴘ...",
            "🔌 ᴄᴏɴɴᴇᴄᴛɪɴɢ ᴛᴏ ꜱᴇʀᴠᴇʀ...",
            "✨ ᴀʟᴍᴏꜱᴛ ᴛʜᴇʀᴇ...",
            "✅ *ʜᴀꜱʜᴀɴ ᴍɪɴɪ ɪꜱ ꜰᴜʟʟʏ ᴀᴄᴛɪᴠᴇ!*"
        ];

        // පලමු පණිවිඩය යැවීම
        let { key } = await conn.sendMessage(from, { text: "🔄 ɪɴɪᴛɪᴀʟɪᴢɪɴɢ..." });

        // Loop එකක් මගින් frames 20 ම edit කිරීම
        for (let i = 0; i < animationFrames.length; i++) {
            // වේගය: තත්පර 0.4 ක පමාවීමක්
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.sendMessage(from, { text: animationFrames[i], edit: key });
        }

    } catch (e) {
        console.log(e);
    }
})
