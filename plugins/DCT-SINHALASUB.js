const { cmd } = require('../command')
const axios = require('axios')

cmd({
    pattern: "cinesubz2",
    alias: ["sub2", "cs2"],
    desc: "Search Movies & TV Shows from Cinesubz",
    category: "search",
    react: "🎬",
    filename: __filename
},

async(conn, mek, m, {
    from,
    q,
    reply
}) => {
    try {

        if (!q) {
            return reply(
                "❌ Movie/TV Show නමක් ලබා දෙන්න.\n\n📌 Example:\n.cinesubz Avatar"
            )
        }

        await reply("🔍 *Cinesubz Searching...*")

        const apiUrl = `https://vajira-official-apis.vercel.app/api/cinesubz?apikey=vajira-VajiraOfficial2003&q=${encodeURIComponent(q)}`

        const { data } = await axios.get(apiUrl)

        if (!data || !data.data || data.data.length < 1) {
            return reply("❌ Result එකක් හමු නොවීය.")
        }

        let message = `🎬 *CINESUBZ SEARCH RESULTS*\n`
        message += `━━━━━━━━━━━━━━━\n`
        message += `🔎 Query : ${q}\n`
        message += `📊 Results : ${data.total_results}\n`
        message += `━━━━━━━━━━━━━━━\n\n`

        data.data.slice(0, 10).forEach((movie, index) => {
            message += `*${index + 1}.* ${movie.title}\n`
            message += `⭐ Rating : ${movie.rating}\n`
            message += `🔗 ${movie.url}\n\n`
        })

        message += `━━━━━━━━━━━━━━━\n`
        message += `*🤖 POWERED BY DCT MD FREE BOT*`

        await conn.sendMessage(
            from,
            {
                text: message
            },
            {
                quoted: mek
            }
        )

        await conn.sendMessage(from, {
            react: {
                text: "✅",
                key: mek.key
            }
        })

    } catch (e) {
        console.log(e)
        reply(`❌ Error: ${e.message}`)
    }
})
