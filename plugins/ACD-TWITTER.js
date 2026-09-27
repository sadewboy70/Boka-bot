const { cmd } = require("../command");
const axios = require("axios");
const config = require('../config');

cmd({
    pattern: "twitter",
    alias: ["x", "tw"],
    react: "🐦",
    desc: "Download Twitter/X Videos",
    category: "download",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {
    try {

        if (!q) {
            return reply("*Please provide a Twitter/X link.*\n\nExample:\n.twitter https://x.com/...");
        }

        const api = `https://apis.davidcyriltech.my.id/twitter?url=${encodeURIComponent(q)}`;

        const { data } = await axios.get(api);

        if (!data.success) {
            return reply("*Failed to fetch the video.*");
        }

        let caption = `*🐦 Twitter/X Downloader*\n\n`;
        caption += `📝 *Description:*\n${data.description || "No description"}\n\n`;
        caption += `*⚡ POWERED BY ${config.BOT_NAME || 'DCT-MD FREE BOT'}*`;

        await conn.sendMessage(
            from,
            {
                video: { url: data.video_hd || data.video_sd },
                caption: caption
            },
            { quoted: mek }
        );

    } catch (err) {
        console.log(err);
        reply("*An error occurred while downloading the video.*");
    }
});
