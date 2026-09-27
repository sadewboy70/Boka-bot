const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "vajira-VajiraOfficial2003";

cmd({
    pattern: "ig",
    alias: ["igdl", "instagram"],
    react: "📸",
    desc: "Instagram Downloader",
    category: "download",
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
`📸 Give me an Instagram post/reel URL.

Example:
.ig https://www.instagram.com/reel/xxxx/`
            );
        }

        // CHECK URL
        if (
            !q.includes("instagram.com")
        ) {

            return reply(
`❌ Please give a valid Instagram URL.`
            );
        }

        await reply("⏳ Downloading Instagram media...");

        // API URL
        const api =
`https://vajira-official-apis.vercel.app/api/igdl?apikey=${API_KEY}&url=${encodeURIComponent(q)}`;

        // REQUEST
        const res = await axios.get(api, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const data = res.data;

        console.log(
            "IGDL RESPONSE =>",
            JSON.stringify(data, null, 2)
        );

        // FIND MEDIA
        const findMedia = (obj) => {

            if (!obj) return null;

            // STRING
            if (typeof obj === "string") {

                if (
                    obj.startsWith("http") &&
                    (
                        obj.includes(".mp4") ||
                        obj.includes(".jpg") ||
                        obj.includes(".jpeg") ||
                        obj.includes(".png") ||
                        obj.includes("cdninstagram")
                    )
                ) {
                    return obj;
                }
            }

            // OBJECT
            if (typeof obj === "object") {

                for (const key in obj) {

                    const found = findMedia(obj[key]);

                    if (found) return found;
                }
            }

            return null;
        };

        const mediaUrl = findMedia(data);

        if (!mediaUrl) {
            return reply("❌ Media not found.");
        }

        // CAPTION
        const caption =
            data.caption ||
            data.result?.caption ||
            "📸 Instagram Downloaded";

        // VIDEO
        if (
            mediaUrl.includes(".mp4")
        ) {

            await conn.sendMessage(from, {
                video: {
                    url: mediaUrl
                },
                mimetype: "video/mp4",
                caption:
`╭━━〔 *📸 INSTAGRAM DOWNLOADER* 〕━━⬣
┃
┃ ✅ Video Downloaded
┃
╰━━━━━━━━━━━━━━━━⬣

${caption}`
            }, { quoted: mek });

        }

        // IMAGE
        else {

            await conn.sendMessage(from, {
                image: {
                    url: mediaUrl
                },
                caption:
`╭━━〔 *📸 INSTAGRAM DOWNLOADER* 〕━━⬣
┃
┃ ✅ Image Downloaded
┃
╰━━━━━━━━━━━━━━━━⬣

${caption}`
            }, { quoted: mek });
        }

    } catch (e) {

        console.log(
            "IGDL ERROR =>",
            e.response?.data || e.message || e
        );

        reply(
`❌ Instagram download failed.

${e.message}`
        );
    }
});
