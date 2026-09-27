const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "movie",
    desc: "Get movie details from OMDB",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { q, reply }) => {
    // 1. නමක් දීලා තියෙද බලනවා
    if (!q) return reply("❌ Please enter movie name. (උදා: .movie Avatar)");

    try {
        await reply("🔍 Searching Started...");

        // 2. OMDB API එකට ඉල්ලීමක් කරනවා
        const apiKey = "b28e8770";
        const url = `http://www.omdbapi.com/?t=${encodeURIComponent(q)}&apikey=${apiKey}`;
        
        const res = await axios.get(url);
        const data = res.data;

        // 3. API එකෙන් Response එකක් ඇවිත් තියෙනවද බලනවා
        if (data.Response === "True") {
            
            // 4. ලස්සනට පෙන්වන විස්තර ටික
            const movieInfo = `┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🎬 *𝐌𝐎𝐕𝐈𝐄  𝐈𝐍𝐅𝐎* 🎬
┗━━━━━━━━━━━━━━━━━━━━┛
┃ 🎥 *Title:* ${data.Title}
┃ 📅 *Year:* ${data.Year}
┃ ⭐ *IMDb:* ${data.imdbRating} / 10
┃ ⏱️ *Runtime:* ${data.Runtime}
┃ 🎭 *Genre:* ${data.Genre}
┃ 👤 *Director:* ${data.Director}
┃ 👥 *Actors:* ${data.Actors}
┃ 🗣️ *Language:* ${data.Language}
┃ 🏆 *Awards:* ${data.Awards}
┃ 📝 *Plot:* ${data.Plot}
┗━━━━━━━━━━━━━━━━━━━━┛

*⚡ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗕𝗢𝗧*`;

            // 5. Poster එක තියෙනවා නම් ඒකත් එක්ක සෙන්ඩ් කරනවා
            if (data.Poster && data.Poster !== "N/A") {
                await conn.sendMessage(m.chat, { 
                    image: { url: data.Poster }, 
                    caption: movieInfo 
                }, { quoted: mek });
            } else {
                // Poster නැත්නම් text විතරක්
                reply(movieInfo);
            }

        } else {
            // 6. ෆිල්ම් එක හොයාගන්න බැරි නම්
            reply("❌ කණගාටුයි, එම නමින් චිත්‍රපටයක් හමු වුණේ නැහැ. කරුණාකර නම පරීක්ෂා කරන්න.");
        }

    } catch (err) {
        // 7. මොනවා හරි Error එකක් ආවොත් (API connection වගේ)
        console.error(err);
        reply("❌ දෝෂයක් සිදු වුණා: " + err.message);
    }
});
