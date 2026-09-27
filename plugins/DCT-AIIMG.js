const { cmd } = require('../command')
const axios = require('axios')

cmd({
    pattern: "img",
    alias: ["aiimg", "image"],
    desc: "Generate AI image using Vajira API",
    category: "ai",
    react: "🎨",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {

        if (!q) return reply("❌ කරුණාකර image description එකක් දෙන්න.\n📌 උදා: .img anime girl in rain")

        await reply("🎨 *Image generate කරමින් පවතී...*\n⏳ කරුණාකර රැඳී සිටින්න...")

        const api = `https://vajira-official-apis.vercel.app/api/vajiraai-image?apikey=vajira-VajiraOfficial2003&q=${encodeURIComponent(q)}`

        const { data } = await axios.get(api, { timeout: 30000 })

        // API response check (different APIs may vary)
        const imageUrl =
            data?.result?.image ||
            data?.image ||
            data?.url ||
            data?.result?.url

        if (!imageUrl) {
            return reply("❌ Image generate කිරීමට නොහැකි විය.\n🔁 නැවත උත්සාහ කරන්න.")
        }

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: `🎨 *AI IMAGE GENERATED*\n\n🖊️ Prompt: ${q}\n\n⚡ Powered by Vajira API`
        }, { quoted: mek })

        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        })

    } catch (e) {
        console.log(e)
        reply("❌ Error: " + e.message)
    }
})
