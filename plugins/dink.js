const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// යූසර්ස්ලගේ චැට් මතකය තියාගන්න Global Object එකක් හදනවා
if (!global.dinkSessions) global.dinkSessions = {};

cmd({
    pattern: "dink",
    alias: ["dinkamovie"],
    desc: "Step-by-step DinkaMovies Downloader",
    category: "movies",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        const botName = config.BOT_NAME || "SADEW-MINI";
        const session = global.dinkSessions[sender];

        // 🟢 අංකයක් ගහලා නම් සහ දැනටමත් Session එකක් තියෙනවා නම් (STEP 2 & 3)
        if (q && !isNaN(q) && session) {
            const choice = parseInt(q) - 1;

            // 🎯 STEP 2: චිත්‍රපටය තේරීමෙන් පසු Download Qualities ගෙන ඒම
            if (session.step === 1) {
                if (choice < 0 || choice >= session.results.length) {
                    return reply("❌ *වැරදි අංකයක්! කරුණාකර ලැයිස්තුවේ ඇති නිවැරදි අංකයක් ලබා දෙන්න.*");
                }

                const selectedMovie = session.results[choice];
                await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

                const dlUrl = `https://kavindu-download-web.vercel.app/api/dinkamovies/movie/dl?url=${encodeURIComponent(selectedMovie.link || selectedMovie.url)}`;
                const res = await axios.get(dlUrl, { timeout: 20000 });
                const dlData = res.data;

                if (!dlData || !dlData.downloads || dlData.downloads.length === 0) {
                    delete global.dinkSessions[sender];
                    return reply("❌ *මෙම චිත්‍රපටය සඳහා ඩවුන්ලෝඩ් ලින්ක්ස් හමු නොවීය.*");
                }

                // ඊළඟ පියවරට (Step 2) දත්ත සේව් කිරීම
                global.dinkSessions[sender] = {
                    step: 2,
                    title: dlData.title,
                    downloads: dlData.downloads
                };

                let txt = `╭━━〔 *📥 𝗤𝗨𝗔𝗟𝗜𝗧𝗬 𝗦𝗘𝗟𝗘𝗖𝗧𝗜𝗢𝗡 📥* 〕━━⬣\n┃\n`;
                txt += `┃ *🎬 𝗠𝗼𝘃𝗶𝗲:* ${dlData.title}\n┃\n`;

                dlData.downloads.forEach((dl, i) => {
                    let sizeText = dl.size ? ` [${dl.size}]` : "";
                    txt += `*${i + 1}.* 🎞️️ ${dl.quality}${sizeText}\n`;
                });
                
                txt += `\n> *ඔබට අවශ්‍ය Quality අංකය Reply කරන්න (උදා: .dink 1)*`;
                
                await conn.sendMessage(from, { text: txt }, { quoted: mek });
                return;
            }

            // 🎯 STEP 3: Quality එක තේරීමෙන් පසු ලින්ක් එක යැවීම
            if (session.step === 2) {
                if (choice < 0 || choice >= session.downloads.length) {
                    return reply("❌ *වැරදි අංකයක්! කරුණාකර නිවැරදි අංකයක් ලබා දෙන්න.*");
                }

                const selectedDl = session.downloads[choice];
                const downloadLink = selectedDl.direct_link || selectedDl.portal_link || selectedDl.link;

                await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                
                let txt = `╭━━〔 *🎬 𝗠𝗢𝗩𝗜𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 🎬* 〕━━⬣\n┃\n`;
                txt += `┃ *🎬 𝗠𝗼𝘃𝗶𝗲:* ${session.title}\n`;
                txt += `┃ *🎞️️ 𝗤𝘂𝗮𝗹𝗶𝘁𝘆:* ${selectedDl.quality}\n`;
                txt += `┃ *📦 𝗦𝗶𝘇𝗲:* ${selectedDl.size || "Unknown"}\n┃\n`;
                txt += `🔗 *𝗗𝗶𝗿𝗲𝗰𝘁 𝗟𝗶𝗻𝗸:* ${downloadLink}\n\n`;
                
                if (selectedDl.whatsapp_link) {
                    txt += `📱 *𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗕𝗼𝘁 𝗟𝗶𝗻𝗸:* ${selectedDl.whatsapp_link}\n\n`;
                }

                txt += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`;

                await conn.sendMessage(from, { text: txt }, { quoted: mek });
                await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

                // වැඩේ ඉවර නිසා Session එක අයින් කරනවා
                delete global.dinkSessions[sender];
                return;
            }
        }

        // 🟢 අංකයක් නැත්නම් (මුලින්ම නමක් ගහලා Search කරන අවස්ථාව - STEP 1) 🟢
        if (!q) return reply("🔎 *කරුණාකර චිත්‍රපටයක නමක් ලබා දෙන්න.*\n💡 _උදා: .dink the croods_");

        await conn.sendMessage(from, { react: { text: '🔍', key: mek.key } });

        const searchUrl = `https://kavindu-download-web.vercel.app/api/dinkamovies/movie/search?q=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl, { timeout: 15000 });
        const resData = response.data;

        if (!resData || !resData.data || resData.data.length === 0) {
            return reply(`❌ *"${q}" සඳහා ප්‍රතිඵල කිසිවක් හමු නොවීය.*`);
        }

        const movies = resData.data.slice(0, 8); // මුල් 8 විතරක් ගන්නවා

        // Session එකේ ෆිල්ම් ටික සේව් කරනවා ඊළඟ Step එකට
        global.dinkSessions[sender] = {
            step: 1,
            results: movies
        };

        let txt = `╭━━〔 *🎬 𝗠𝗢𝗩𝗜𝗘 𝗦𝗘𝗔𝗥𝗖𝗛 🎬* 〕━━⬣\n┃\n`;
        txt += `┃ *🔍 Search:* ${q}\n┃\n`;

        movies.forEach((m, i) => {
            txt += `*${i + 1}.* 🎬 ${m.title} (${m.year || "N/A"})\n`;
        });

        txt += `\n> *ඔබට අවශ්‍ය චිත්‍රපටයේ අංකය Reply කරන්න (උදා: .dink 1)*`;

        const firstPoster = movies[0].poster;
        if (firstPoster && firstPoster.startsWith('http')) {
            await conn.sendMessage(from, { image: { url: firstPoster }, caption: txt }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { text: txt }, { quoted: mek });
        }

    } catch (e) {
        console.error("Dink Error:", e.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ *දෝෂයක් ඇතිවිය:* ${e.message}`);
    }
});
