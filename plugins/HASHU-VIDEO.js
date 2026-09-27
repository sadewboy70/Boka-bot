const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

const API_KEY = "vajira-niibgh0r87-1779944782991";

cmd({
    pattern: "video",
    alias: ["ytmp4", "mp4"],
    desc: "Download Youtube Videos",
    category: "download",
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
            return reply("🎬 Give me youtube link or video name.");
        }

        await reply("⏳ Downloading video...");

        let input = q;

        // SEARCH VIDEO
        if (
            !q.includes("youtube.com") &&
            !q.includes("youtu.be")
        ) {

            const search = await yts(q);

            if (!search.videos.length) {
                return reply("❌ Video not found.");
            }

            input = search.videos[0].url;
        }

        // API
        const api =
`https://vajira-official-apis.vercel.app/api/ytmp4?apikey=${API_KEY}&url=${encodeURIComponent(input)}`;

        const res = await axios.get(api);

        const data = res.data;

        console.log("API RESPONSE =>", JSON.stringify(data, null, 2));

        // AUTO GET VIDEO URL
        const videoUrl =
            data?.result?.downloadUrl ||
            data?.result?.url ||
            data?.result?.dl ||
            data?.url ||
            data?.download ||
            data?.video;

        if (!videoUrl) {
            return reply("❌ Video link not found.");
        }

        // TITLE
        const title =
            data?.result?.title ||
            data?.title ||
            "YOUTUBE VIDEO";

        // THUMB
        const thumb =
            data?.result?.thumbnail ||
            data?.thumbnail ||
            "https://i.ibb.co/2kRz9qM/video.jpg";

        // SEND VIDEO DIRECT
        await conn.sendMessage(from, {
            video: {
                url: videoUrl
            },
            mimetype: "video/mp4",
            fileName: `${title}.mp4`,
            caption:
`╭━━〔 *🎬 VIDEO DOWNLOADER* 〕━━⬣
┃
┃ 🎥 ${title}
┃ ✅ Download Completed
┃
╰━━━━━━━━━━━━━━━━⬣`,
            jpegThumbnail: await (await axios.get(thumb, {
                responseType: "arraybuffer"
            })).data
        }, { quoted: mek });

    } catch (e) {

        console.log("FULL ERROR =>", e);

        reply(
`❌ Video download failed.

${e.message}`
        );
    }
});
