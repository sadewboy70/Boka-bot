const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "vajira-VajiraOfficial2003";

cmd({
    pattern: "ai",
    alias: ["gpt", "vajiraai"],
    react: "🤖",
    desc: "Chat with AI",
    category: "ai",
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
`🤖 Give me a question.

Example:
.ai hello`
            );
        }

        await reply("🤖 AI is thinking...");

        // API URL
        const url =
`https://vajira-official-apis.vercel.app/api/vajiraai?apikey=${API_KEY}&q=${encodeURIComponent(q)}`;

        // REQUEST
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const data = res.data;

        console.log(
            "AI RESPONSE =>",
            JSON.stringify(data, null, 2)
        );

        // CHECK STATUS
        if (!data.status) {

            return reply(
`❌ AI server error.

${data.message || "Unknown error"}`
            );
        }

        // GET ANSWER
        const answer =
            data.answer ||
            "No response from AI.";

        // SEND MESSAGE
        await conn.sendMessage(from, {
            text:
`╭━━〔 *🤖 𝗗𝗖𝗧 𝗕𝗢𝗧 𝗔𝗜* 〕━━⬣
┃
┃ ✨ Question : ${q}
┃
╰━━━━━━━━━━━━━━━━⬣

🧠 *AI Response :*

${answer}

> ⚡ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        }, { quoted: mek });

    } catch (e) {

        console.log(
            "AI ERROR =>",
            e.response?.data || e.message || e
        );

        reply(
`❌ AI request failed.

${e.message}`
        );
    }
});
