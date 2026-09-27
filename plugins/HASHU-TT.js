const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "vajira-VajiraOfficial2003";

cmd({
    pattern: "tiktok",
    alias: ["tt", "ttdl"],
    desc: "TikTok Video Downloader",
    category: "download",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {

    try {

        // CHECK URL
        if (!q) {
            return reply("📌 Please provide a TikTok URL.");
        }

        if (
            !q.includes("tiktok.com") &&
            !q.includes("vm.tiktok.com")
        ) {
            return reply("❌ Invalid TikTok URL.");
        }

        await reply("⏳ Downloading TikTok video...");

        // API REQUEST
        const api =
`https://vajira-official-apis.vercel.app/api/ttdl?apikey=${API_KEY}&url=${encodeURIComponent(q)}`;

        const response = await axios.get(api);

        const data = response.data;

        console.log(
            "TIKTOK API =>",
            JSON.stringify(data, null, 2)
        );

        // FIND VIDEO URL
        const findVideo = (obj) => {

            if (!obj) return null;

            // STRING
            if (typeof obj === "string") {

                if (
                    obj.startsWith("http") &&
                    (
                        obj.includes(".mp4") ||
                        obj.includes("video") ||
                        obj.includes("download")
                    )
                ) {
                    return obj;
                }
            }

            // OBJECT
            if (typeof obj === "object") {

                for (let key in obj) {

                    const found = findVideo(obj[key]);

                    if (found) return found;
                }
            }

            return null;
        };

        // GET VIDEO URL
        const videoUrl = findVideo(data);

        console.log("VIDEO URL =>", videoUrl);

        if (!videoUrl) {
            return reply("❌ TikTok download link not found.");
        }

        // TITLE
        const title =
            data?.title ||
            data?.result?.title ||
            "TIKTOK VIDEO";

        // THUMBNAIL
        const thumb =
            data?.thumbnail ||
            data?.cover ||
            data?.result?.thumbnail ||
            "https://files.catbox.moe/8k0m9p.jpg";

        // SEND VIDEO
        await conn.sendMessage(from, {
            video: {
                url: videoUrl
            },
            mimetype: "video/mp4",
            caption:
`╭━━〔 *🎵 𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥* 〕━━⬣
┃
┃ 🎬 ${title}
┃ *✅ Download Completed ⚡*
┃
╰━━━━━━━━━━━━━━━━━━⬣
*ᴄᴏɴɴᴇᴄᴛ ɴᴏᴡ ʙᴏᴛ ꜰʀᴇᴇ 👨‍💻🤍*
*https://dct.fwh.is*

> *𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧 🌩️✨*`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: "🎵 TikTok Downloader",
                    thumbnailUrl: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: q
                }
            }
        }, { quoted: mek });

    } catch (e) {

        console.log(
            "ERROR =>",
            e.response?.data ||
            e.message ||
            e
        );

        reply("❌ TikTok download failed.");
    }
});
