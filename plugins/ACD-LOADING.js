const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "magic",
    desc: "Magic emoji animation.",
    category: "fun",
    react: "🪄",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const magic = [
            "🕛", "🕒", "🕕", "🕘", "🕛", // ඔරලෝසුව කැරකෙනවා
            "🌑", "🌒", "🌓", "🌔", "🌕", // හඳ මෝරනවා
            "🍎", "🍋", "🍏", "🫐", "🍓", // පලතුරු මාරු වෙනවා
            "🎭", "🪄", "✨", "🎊", "🎉", // මැජික්!
            "🪄 *ᴍᴀɢɪᴄ ᴄᴏᴍᴘʟᴇᴛᴇᴅ!*"
        ];

        let { key } = await conn.sendMessage(from, { text: "🪄" });

        for (let frame of magic) {
            await new Promise(resolve => setTimeout(resolve, 300));
            await conn.sendMessage(from, { text: frame, edit: key });
        }
    } catch (e) {
        console.log(e);
    }
})
