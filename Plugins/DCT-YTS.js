const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "vajira-VajiraOfficial2003";

cmd({
    pattern: "ytchannel",
    alias: ["channelinfo", "ychannel"],
    react: "📺",
    desc: "Get YouTube Channel Info",
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
            return reply(
`📺 Give me a YouTube channel URL.

Example:
.ytchannel https://youtube.com/@MrBeast`
            );
        }

        await reply("⏳ Fetching channel info...");

        // API URL
        const api =
`https://vajira-official-apis.vercel.app/api/ytchannel?apikey=${API_KEY}&url=${encodeURIComponent(q)}`;

        const res = await axios.get(api);

        const data = res.data;

        console.log(
            "YTCHANNEL RESPONSE =>",
            JSON.stringify(data, null, 2)
        );

        // AUTO DETECT
        const result =
            data.result ||
            data.data ||
            data.channel ||
            data;

        // CHANNEL INFO
        const name =
            result.title ||
            result.name ||
            result.channelName ||
            "Unknown Channel";

        const subs =
            result.subscribers ||
            result.subscriberCount ||
            result.subs ||
            "N/A";

        const videos =
            result.videos ||
            result.videoCount ||
            result.totalVideos ||
            "N/A";

        const views =
            result.views ||
            result.viewCount ||
            result.totalViews ||
            "N/A";

        const desc =
            result.description ||
            "No description available.";

        const thumb =
            result.thumbnail ||
            result.image ||
            result.profile ||
            result.avatar ||
            "https://i.ibb.co/YBtjMpQx/1ed923b3376b.jpg";

        const channelUrl =
            result.url ||
            result.channelUrl ||
            q;

        // MESSAGE
        const caption =
`╭━━〔 *📺 YOUTUBE CHANNEL INFO* 〕━━⬣
┃
┃ 🎭 Name : ${name}
┃ 👥 Subscribers : ${subs}
┃ 🎬 Videos : ${videos}
┃ 👀 Views : ${views}
┃
╰━━━━━━━━━━━━━━━━⬣

📝 *Description :*
${desc.slice(0, 300)}

🔗 ${channelUrl}

> *⚡ POWERED BY DCT MD*`;

        // SEND
        await conn.sendMessage(from, {
            image: { url: thumb },
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: name,
                    body: "📺 YouTube Channel Information",
                    thumbnailUrl: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: channelUrl
                }
            }
        }, { quoted: mek });

    } catch (e) {

        console.log(
            "YTCHANNEL ERROR =>",
            e.response?.data || e.message || e
        );

        reply(
`❌ Failed to fetch channel info.

${e.message}`
        );
    }
});
