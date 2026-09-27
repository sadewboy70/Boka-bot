const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "thenkiri",
    alias: ["tksearch", "movie"],
    desc: "Search & Download Movies from Thenkiri",
    category: "search",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {
    try {
        if (!q) {
            return reply("🔍 Please provide a movie name to search. (e.g., .thenkiri 2026)");
        }

        const apikey = "hashimdtech@gmail.com:vajira-97489";

        // MOVIE SEARCH
        const searchApiUrl = `https://vajiraofc-apis.vercel.app/api/thenkiri/search?apikey=${apikey}&q=${encodeURIComponent(q)}`;
        const searchResponse = await axios.get(searchApiUrl, { timeout: 15000 });
        let searchRes = searchResponse.data;

        if (typeof searchRes === "string") searchRes = JSON.parse(searchRes);

        if (!searchRes || searchRes.success !== true || !searchRes.results || searchRes.results.length === 0) {
            return reply(`❌ No results found for "${q}" on Thenkiri.`);
        }

        const moviesList = searchRes.results;

        // BUILD SEARCH LIST MESSAGE
        let message = `🎬 *𝗧𝗛𝗘𝗡𝗞𝗜𝗥𝗜 𝗠𝗢𝗩𝗜𝗘 𝗦𝗘𝗔𝗥𝗖𝗛* 🎬\n\n`;
        message += `🔍 *Search Query:* ${searchRes.query}\n`;
        message += `📊 *Total Results:* ${searchRes.count}\n\n`;
        message += `📌 *Reply to this message with the movie number to download.* (e.g. Reply '1')\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        moviesList.forEach((movie, index) => {
            message += `*${index + 1}. ${movie.title}*\n`;
        });

        message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴄᴛ ᴍᴅ ʙᴏᴛ*`;

        // SEND SEARCH RESULTS AND GET MESSAGE ID
        const sentMsg = await conn.sendMessage(from, { text: message }, { quoted: mek });
        const messageID = sentMsg.key.id;

        // REPLY LISTENER FOR NUMBER SELECTION
        const listener = async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message) return;

            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const replyId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;

            // සෙන්ඩ් කරපු මැසේජ් එකටමද රිප්ලයි කලේ කියලා බලනවා
            if (replyId !== messageID) return;

            // අංකයක්ද කියලා චෙක් කරනවා
            if (isNaN(text)) return;
            const index = parseInt(text) - 1;

            if (index < 0 || index >= moviesList.length) {
                return reply(`❌ Invalid number! Please reply with a number between 1 and ${moviesList.length}.`);
            }

            const selectedMovie = moviesList[index];
            await reply(`⏳ Fetching download link for:\n*${selectedMovie.title}*...`);

            try {
                // DETAILS FETCH
                const detailsApiUrl = `https://vajiraofc-apis.vercel.app/api/thenkiri/details?apikey=${apikey}&url=${encodeURIComponent(selectedMovie.url)}`;
                const detailsResponse = await axios.get(detailsApiUrl, { timeout: 15000 });
                let detailsRes = detailsResponse.data;

                if (typeof detailsRes === "string") detailsRes = JSON.parse(detailsRes);

                if (!detailsRes || detailsRes.success !== true || !detailsRes.data || !detailsRes.data.directDownloadUrl) {
                    return reply("❌ Failed to retrieve the direct download link.");
                }

                const movieData = detailsRes.data;

                const detailsText = `╭━━〔 *🎬 𝗠𝗢𝗩𝗜𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥* 〕━━⬣
┃
┃ • *📝 Title:* ${movieData.title}
┃ • *📂 Size:* ${movieData.size}
┃ • *✨ Quality:* ${movieData.quality}
┃ • *📅 Year:* ${movieData.year}
┃ • *🎭 Genre:* ${movieData.genres}
┃
┃ 🚀 *Downloading file directly... Please wait!*
╰━━━━━━━━━━━━━━━━━━⬣
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴄᴛ ᴍᴅ ʙᴏᴛ*`;

                if (movieData.imageUrl) {
                    await conn.sendMessage(from, { image: { url: movieData.imageUrl }, caption: detailsText }, { quoted: msg });
                } else {
                    await reply(detailsText);
                }

                // SEND DOCUMENT
                await conn.sendMessage(from, {
                    document: { url: movieData.directDownloadUrl },
                    mimetype: "video/x-matroska",
                    fileName: movieData.title.replace("DOWNLOAD", "").trim() + ".mkv",
                    caption: `🎬 *${movieData.title}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴄᴛ ᴍᴅ ʙᴏᴛ*`
                }, { quoted: msg });

                // වැඩේ ඉවර නිසා Listener එක අයින් කරනවා
                conn.ev.off("messages.upsert", listener);

            } catch (err) {
                console.error("Thenkiri Download Error:", err);
                reply("❌ An error occurred while fetching the download.");
            }
        };

        conn.ev.on("messages.upsert", listener);

    } catch (e) {
        console.error("Global Error in Thenkiri Flow:", e);
        reply("❌ An error occurred while searching.");
    }
});
