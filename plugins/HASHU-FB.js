const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "vajira-VajiraOfficial2003";

cmd({
    pattern: "fb",
    alias: ["fbdl", "facebook"],
    desc: "Download Facebook Videos",
    category: "download",
    react: "📥",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {

    try {

        if (!q) {
            return reply("📥 Please give a Facebook video link.");
        }

        if (
            !q.includes("facebook.com") &&
            !q.includes("fb.watch")
        ) {
            return reply("❌ Invalid Facebook URL.");
        }

        await reply("*⏳ Downloading Facebook video...*");

        // API REQUEST
        const api =
`https://vajira-official-apis.vercel.app/api/fbdl?apikey=${API_KEY}&url=${encodeURIComponent(q)}`;

        const response = await axios.get(api);

        const res = response.data;

        console.log("FB API RESPONSE =>", JSON.stringify(res, null, 2));

        // FIND VIDEO URL
        let videoUrl = null;

        const findVideo = (obj) => {

            if (!obj) return null;

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

            if (typeof obj === "object") {

                for (let key in obj) {

                    const found = findVideo(obj[key]);

                    if (found) return found;
                }
            }

            return null;
        };

        videoUrl = findVideo(res);

        if (!videoUrl) {
            return reply("❌ Video URL not found.");
        }

        // TITLE
        const title =
            res?.title ||
            res?.result?.title ||
            "FACEBOOK VIDEO";

        // THUMBNAIL
        const thumb =
            res?.thumbnail ||
            res?.result?.thumbnail ||
            "https://files.catbox.moe/8k0m9p.jpg";

        // SEND VIDEO
        await conn.sendMessage(from, {
            video: {
                url: videoUrl
            },
            mimetype: "video/mp4",
            caption:
`╭━━〔 *📥 𝗙𝗕 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥* 〕━━⬣
┃
┃ *🎬 ${title}*
┃ *✅ Download Completed ✨*
┃
╰━━━━━━━━━━━━━━━━━━⬣
*𝙲𝙾𝙽𝙽𝙴𝙲𝚃 𝙽𝙾𝚆 𝙱𝙾𝚃 𝙸𝙽 𝙵𝚁𝙴𝙴 🌩️🤍*
*https://dct.fwh.is*

> *𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧* 🤍⚡`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: "📥 Facebook Video Downloader",
                    thumbnailUrl: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: q
                }
            }
        }, { quoted: mek });

    } catch (e) {

        console.log(e);

        reply("❌ Facebook download failed.");
    }
});
