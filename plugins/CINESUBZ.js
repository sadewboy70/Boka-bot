const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "cinesubz",
    alias: ["cs", "cine"],
    desc: "Search & Download Movies from CineSubz",
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
            return reply("🔍 Please provide a movie name to search. (e.g., .cinesubz colors)");
        }

        const apikey = "hashimdtech@gmail.com:vajira-97489";

        // SEARCH CINESUBZ
        const searchApiUrl = `https://vajiraofc-apis.vercel.app/api/cinesubz/search?apikey=${apikey}&q=${encodeURIComponent(q)}`;
        const searchResponse = await axios.get(searchApiUrl, { timeout: 15000 });
        let searchRes = searchResponse.data;

        if (typeof searchRes === "string") searchRes = JSON.parse(searchRes);

        if (!searchRes || searchRes.success !== true || !searchRes.results || searchRes.results.length === 0) {
            return reply(`❌ No results found for "${q}" on CineSubz.`);
        }

        const moviesList = searchRes.results;

        // BUILD SEARCH RESULTS
        let message = `🎬 *𝗖𝗜𝗡𝗘𝗦𝗨𝗕𝗭 𝗠𝗢𝗩𝗜𝗘 𝗦𝗘𝗔𝗥𝗖𝗛* 🎬\n\n`;
        message += `🔍 *Search Query:* ${searchRes.query}\n`;
        message += `📊 *Total Results:* ${searchRes.count}\n\n`;
        message += `📌 *Reply to this message with the movie number.* (e.g. Reply '1')\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        moviesList.slice(0, 15).forEach((movie, index) => {
            message += `*${index + 1}. ${movie.title}*\n`;
        });

        message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ʜᴀsʜᴜᴜ*`;

        const sentMsg = await conn.sendMessage(from, { text: message }, { quoted: mek });
        const searchMsgID = sentMsg.key.id;

        // FIRST LISTENER: TO SELECT MOVIE NUMBER
        const movieListener = async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message) return;

            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const replyId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;

            if (replyId !== searchMsgID) return;
            if (isNaN(text)) return;

            const index = parseInt(text) - 1;
            if (index < 0 || index >= moviesList.slice(0, 15).length) {
                return reply("❌ Invalid movie number.");
            }

            const selectedMovie = moviesList[index];
            await reply(`⏳ Fetching movie details for:\n*${selectedMovie.title}*...`);

            conn.ev.off("messages.upsert", movieListener);

            try {
                // FETCH DETAILS
                const detailsApiUrl = `https://vajiraofc-apis.vercel.app/api/cinesubz/details?apikey=${apikey}&url=${encodeURIComponent(selectedMovie.url)}`;
                const detailsResponse = await axios.get(detailsApiUrl, { timeout: 15000 });
                let detailsRes = detailsResponse.data;

                if (typeof detailsRes === "string") detailsRes = JSON.parse(detailsRes);

                if (!detailsRes || detailsRes.success !== true || !detailsRes.data) {
                    return reply("❌ Failed to retrieve details.");
                }

                const movieData = detailsRes.data;
                const downloadLinks = movieData.downloadUrls || {};
                const availableQualities = Object.keys(downloadLinks).filter(qual => downloadLinks[qual]);

                if (availableQualities.length === 0) {
                    return reply("❌ No download links found.");
                }

                // DETAILS TEXT
                let detailsText = `╭━━〔 *🎬 𝗖𝗜𝗡𝗘𝗦𝗨𝗕𝗭 𝗠𝗢𝗩𝗜𝗘* 〕━━⬣\n┃\n`;
                detailsText += `┃ • *📝 Title:* ${movieData.title}\n`;
                detailsText += `┃ • *📅 Year:* ${movieData.meta?.year || 'N/A'}\n`;
                detailsText += `┃ • *🌍 Country:* ${movieData.meta?.country || 'N/A'}\n`;
                detailsText += `┃ • *🗣 Language:* ${movieData.meta?.language || 'N/A'}\n`;
                detailsText += `┃ • *✍️ Subtitle:* ${movieData.meta?.subtitleBy || 'N/A'}\n┃\n╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                
                detailsText += `📥 *REPLY WITH THE NUMBER OF QUALITY TO DOWNLOAD:*`;

                availableQualities.forEach((qual, qIdx) => {
                    detailsText += `\n*${qIdx + 1}* - Download in ${qual}`;
                });

                detailsText += `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ʜᴀsʜᴜᴜ*`;

                let detailsMsg;
                if (movieData.poster) {
                    detailsMsg = await conn.sendMessage(from, { image: { url: movieData.poster }, caption: detailsText }, { quoted: msg });
                } else {
                    detailsMsg = await reply(detailsText);
                }

                const detailsMsgID = detailsMsg.key.id;

                // SECOND LISTENER: TO SELECT QUALITY & DOWNLOAD VIA BUFFER
                const qualityListener = async ({ messages }) => {
                    const qMsg = messages[0];
                    if (!qMsg.message) return;

                    const qText = (qMsg.message.conversation || qMsg.message.extendedTextMessage?.text || "").trim();
                    const qReplyId = qMsg.message.extendedTextMessage?.contextInfo?.stanzaId;

                    if (qReplyId !== detailsMsgID) return;
                    if (isNaN(qText)) return;

                    const qIdx = parseInt(qText) - 1;
                    if (qIdx < 0 || qIdx >= availableQualities.length) {
                        return reply("❌ Invalid option. Please select a valid quality number.");
                    }

                    const selectedQual = availableQualities[qIdx];
                    let downloadUrl = downloadLinks[selectedQual];

                    // URL cleanup
                    downloadUrl = encodeURI(decodeURIComponent(downloadUrl));

                    await reply(`🚀 Downloading *${movieData.title}* (${selectedQual}) to server first to bypass server blocks... Please wait!`);

                    conn.ev.off("messages.upsert", qualityListener);

                    try {
                        // 🔥 [FIX] Axios එකෙන් සර්වර් බ්ලොක් එක bypass කරලා ArrayBuffer එකක් විදිහට ෆයිල් එක ගන්නවා
                        const fileResponse = await axios({
                            method: 'get',
                            url: downloadUrl,
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                'Referer': 'https://cinesubz.co/'
                            },
                            timeout: 60000 // 1 Minute timeout for downloading
                        });

                        const videoBuffer = Buffer.from(fileResponse.data);

                        await reply(`📦 Uploading to WhatsApp...`);

                        // Send Document using Buffer (No streaming blocks anymore!)
                        await conn.sendMessage(from, {
                            document: videoBuffer,
                            mimetype: "video/mp4",
                            fileName: `${movieData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedQual}.mp4`,
                            caption: `🎬 *${movieData.title}*\n✨ *Quality:* ${selectedQual}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ʜᴀsʜᴜᴜ*`
                        }, { quoted: qMsg });

                    } catch (err) {
                        console.error("Axios download or send failed:", err);
                        reply(`❌ Failed to send file: ${err.message}`);
                    }
                };

                conn.ev.on("messages.upsert", qualityListener);

            } catch (err) {
                console.error("Details Fetch Error:", err);
                reply("❌ Error fetching movie details.");
            }
        };

        conn.ev.on("messages.upsert", movieListener);

    } catch (e) {
        console.error("Global Error:", e);
        reply("❌ Search failed.");
    }
});
