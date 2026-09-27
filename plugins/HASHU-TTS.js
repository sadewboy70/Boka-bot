const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "vajira-VajiraOfficial2003";

cmd({
    pattern: "ttsearch",
    alias: ["tiktoksearch", "tts"],
    react: "🎵",
    desc: "Search TikTok videos",
    category: "search",
    filename: __filename
},
async(conn, mek, m, {
    from,
    q,
    reply
}) => {

    try {

        if (!q) {
            return reply("🔎 Give me a search text.");
        }

        await reply("⏳ Searching TikTok videos...");

        // API
        const api =
`https://vajira-official-apis.vercel.app/api/ttsearch?apikey=${API_KEY}&q=${encodeURIComponent(q)}`;

        const res = await axios.get(api);

        const data = res.data;

        console.log("TTSEARCH RESPONSE =>", JSON.stringify(data, null, 2));

        // RESULTS AUTO DETECT
        let results =
            data.result ||
            data.results ||
            data.data ||
            [];

        if (!Array.isArray(results)) {
            results = [results];
        }

        if (!results.length) {
            return reply("❌ No results found.");
        }

        const first = results[0];

        let text =
`╭━━〔 *🎵 TIKTOK SEARCH* 〕━━⬣
┃
┃ 🔎 Query : ${q}
┃ 📦 Results : ${results.length}
┃
╰━━━━━━━━━━━━━━━━⬣

`;

        results.slice(0, 10).forEach((v, i) => {

            const title =
                v.title ||
                v.desc ||
                v.name ||
                "No Title";

            const author =
                v.author ||
                v.username ||
                v.owner ||
                "Unknown";

            const url =
                v.url ||
                v.link ||
                v.video ||
                "No Link";

            text +=
`*${i + 1}. ${title}*

👤 User : ${author}
🔗 Link : ${url}

`;
        });

        // THUMBNAIL
        const thumb =
            first.thumbnail ||
            first.thumb ||
            first.cover ||
            first.image ||
            "https://i.ibb.co/2kRz9qM/video.jpg";

        // SEND
        await conn.sendMessage(from, {
            image: { url: thumb },
            caption: text
        }, { quoted: mek });

    } catch (e) {

        console.log("TTSEARCH ERROR =>", e);

        reply(
`❌ Search failed.

${e.message}`
        );
    }
});
