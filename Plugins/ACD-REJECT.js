const { cmd } = require('../command')

cmd({
    pattern: "adarey",
    desc: "Send love emojis for 3 minutes",
    category: "fun",
    react: "💖",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const emojis = ["🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "❤️‍🩹", "💗"]
        
        await reply("💖 Adarey pata ganna haduwane... 3 min yakan yanakan balagena innh manikaa!")
        
        let i = 0
        const endTime = Date.now() + 180000 // 3 min = 180000ms
        
        const interval = setInterval(async () => {
            if (Date.now() >= endTime) {
                clearInterval(interval)
                await conn.sendMessage(from, { text: "💖 Adarey pntth wada! Love you ❤️" }, { quoted: mek })
                return
            }
            
            await conn.sendMessage(from, { text: emojis[i % emojis.length] }, { quoted: mek })
            i++
        }, 1500) // 1.5s gap ekak
        
    } catch (e) {
        console.log(e)
        reply('Error: ' + e)
    }
})
