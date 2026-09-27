const { cmd } = require('../command')
const axios = require('axios')

cmd({
    pattern: "gitclone",
    alias: ["repo", "git"],
    desc: "Download GitHub Repository",
    category: "download",
    react: "👨‍💻",
    filename: __filename
},

async(conn, mek, m, {
    from,
    q,
    reply
}) => {
    try {

        if (!q) {
            return reply("❌ GitHub Repo URL එකක් දෙන්න.\n\nඋදා:\n.gitclone https://github.com/facebook/react")
        }

        await reply("⏳ *Repository Creating...*")

        const apiUrl = `https://vajira-official-apis.vercel.app/api/gitclone?apikey=vajira-VajiraOfficial2003&url=${encodeURIComponent(q)}`

        const { data } = await axios.get(apiUrl)

        if (!data) {
            return reply("❌ API එකෙන් response එකක් ලැබුණේ නැහැ.")
        }

        // Download URL එක හොයනවා
        const dl =
            data.download ||
            data.result?.download ||
            data.result?.url ||
            data.url

        if (!dl) {
            return reply("❌ Download link එක හමු නොවීය.")
        }

        const fileName =
            data.name ||
            data.result?.name ||
            "repository.zip"

        await conn.sendMessage(
            from,
            {
                document: { url: dl },
                mimetype: "application/zip",
                fileName: fileName.endsWith(".zip")
                    ? fileName
                    : `${fileName}.zip`
            },
            { quoted: mek }
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
