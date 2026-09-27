const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

const API_KEY = "vajira-VajiraOfficial2003";

cmd({
    pattern: "play",
    alias: ["music", "audio"],
    desc: "YouTube Song Downloader",
    category: "download",
    react: "✔️",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {

    try {

        if (!q) {
            return reply("🎵 Give a song name or YouTube link.");
        }

        // SEARCH SONG
        const search = await yts(q);

        if (!search.videos.length) {
            return reply("❌ Song not found.");
        }

        const data = search.videos[0];

        await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption:
`*_🎶 ${data.title}_*

> *⚡ 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚...*`
        }, { quoted: mek });

        // API REQUEST
        const api =
`https://vajira-official-apis.vercel.app/api/ytmp3?apikey=${API_KEY}&url=${encodeURIComponent(data.url)}`;

        const response = await axios.get(api);

        const res = response.data;

        console.log("API RESPONSE =>", JSON.stringify(res, null, 2));

        // FIND AUDIO URL
        let audioUrl = null;

        const findUrl = (obj) => {

            if (!obj) return null;

            if (typeof obj === "string") {

                if (
                    obj.startsWith("http") &&
                    (
                        obj.includes(".mp3") ||
                        obj.includes(".m4a") ||
                        obj.includes("audio") ||
                        obj.includes("download")
                    )
                ) {
                    return obj;
                }
            }

            if (typeof obj === "object") {

                for (let key in obj) {

                    let found = findUrl(obj[key]);

                    if (found) return found;
                }
            }

            return null;
        };

        audioUrl = findUrl(res);

        if (!audioUrl) {
            return reply("❌ Audio URL not found.");
        }

        console.log("AUDIO URL =>", audioUrl);

        // TEMP FILE
        const filePath = path.join(
            __dirname,
            `song_${Date.now()}.mp3`
        );

        // DOWNLOAD AUDIO
        const audioRes = await axios({
            url: audioUrl,
            method: "GET",
            responseType: "stream",
            headers: {
                "User-Agent":
                    "Mozilla/5.0"
            }
        });

        const writer = fs.createWriteStream(filePath);

        audioRes.data.pipe(writer);

        writer.on("finish", async () => {

            try {

                // SEND AUDIO
                await conn.sendMessage(from, {
                    audio: fs.readFileSync(filePath),
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: `${data.title}.mp3`
                }, { quoted: mek });

                fs.unlinkSync(filePath);

            } catch (err) {

                console.log(err);

                reply("❌ Sending audio failed.");
            }

        });

        writer.on("error", async (err) => {

            console.log(err);

            reply("❌ File write failed.");
        });

    } catch (e) {

        console.log(e);

        reply("❌ Download failed.");
    }
});
