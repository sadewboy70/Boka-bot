const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "dink",
    alias: ["dinkamovie"],
    desc: "Button based DinkaMovies Downloader",
    category: "movies",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const botName = config.BOT_NAME || "SADEW-MINI";

        if (!q) return reply("🔎 *කරුණාකර චිත්‍රපටයක නමක් ලබා දෙන්න.*\n💡 _උදා: .dink the croods_");

        // 🟢 STEP 2: Button එක එබුවම කෙලින්ම ලින්ක් එකෙන් Download විස්තර දෙන අවස්ථාව 🟢
        if (q.includes("dinkamovieslk.app") || q.includes("http")) {
            await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

            const dlUrl = `https://kavindu-download-web.vercel.app/api/dinkamovies/movie/dl?url=${encodeURIComponent(q)}`;
            const res = await axios.get(dlUrl, { timeout: 20000 });
            const dlData = res.data;

            if (!dlData || !dlData.downloads || dlData.downloads.length === 0) {
                return reply("❌ *මෙම චිත්‍රපටය සඳහා ඩවුන්ලෝඩ් ලින්ක්ස් හමු නොවීය.*");
            }

            let txt = `╭━━〔 *🎬 𝗠𝗢𝗩𝗜𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 🎬* 〕━━⬣\n┃\n`;
            txt += `┃ *🎬 𝗠𝗼𝘃𝗶𝗲:* ${dlData.title}\n┃\n`;

            // හැම Quality එකක්ම ලස්සනට ලිස්ට් කරනවා
            dlData.downloads.forEach((dl, i) => {
                txt += `*${i + 1}. 🎞 𝗤𝘂𝗮𝗹𝗶𝘁𝘆:* ${dl.quality} ${dl.size ? `(${dl.size})` : ""}\n`;
                txt += `🔗 *𝗗𝗶𝗿𝗲𝗰𝘁 𝗟𝗶𝗻𝗸:* ${dl.direct_link || dl.link}\n`;
                if (dl.whatsapp_link) {
                    txt += `📱 *𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗟𝗶𝗻𝗸:* ${dl.whatsapp_link}\n`;
                }
                txt += `\n`;
            });

            txt += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`;

            await conn.sendMessage(from, { text: txt }, { quoted: mek });
            await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
            return;
        }

        // 🟢 STEP 1: නමක් දීලා Search කරන අවස්ථාව (Buttons 10ක් සමඟ) 🟢
        await conn.sendMessage(from, { react: { text: '🔍', key: mek.key } });

        const searchUrl = `https://kavindu-download-web.vercel.app/api/dinkamovies/movie/search?q=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl, { timeout: 15000 });
        const resData = response.data;

        if (!resData || !resData.data || resData.data.length === 0) {
            return reply(`❌ *"${q}" සඳහා ප්‍රතිඵල කිසිවක් හමු නොවීය.*`);
        }

        // බොට්ගේ ලිමිට් එක 10 නිසා මුල් 10 විතරක් ගන්නවා
        const movies = resData.data.slice(0, Math.min(resData.data.length, 10));

        let txt = `╭━━〔 *🎬 𝗠𝗢𝗩𝗜𝗘 𝗦𝗘𝗔𝗥𝗖𝗛 🎬* 〕━━⬣\n┃\n`;
        txt += `┃ *🔍 Search:* ${q}\n┃\n`;
        txt += `> *පහතින් ඔබට අවශ්‍ය චිත්‍රපටය තෝරන්න:*`;

        let buttons = [];
        movies.forEach((m, i) => {
            // Button එකේ දිග වැඩියි නම් කඩනවා
            let btnText = m.title.length > 18 ? `🎬 ${m.title.substring(0, 15)}...` : `🎬 ${m.title}`; 
            
            // Button එක එබුවම යන්නේ .dink <Movie_Link> විදිහටයි. මේකෙන් "1 ගහුවම 1 සර්ච් වෙන" අවුල සදහටම නැති වෙනවා!
            buttons.push({
                buttonId: `.dink ${m.link || m.url}`,
                buttonText: { displayText: btnText },
                type: 1
            });
        });

        const firstPoster = movies[0].poster;

        // Image එකක් එක්ක Buttons යැවීම
        if (firstPoster && firstPoster.startsWith('http')) {
            const buttonMessage = {
                image: { url: firstPoster },
                caption: txt,
                footer: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}`,
                buttons: buttons,
                headerType: 4
            };
            await conn.sendMessage(from, buttonMessage, { quoted: mek });
        } else {
            const buttonMessage = {
                text: txt,
                footer: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}`,
                buttons: buttons,
                headerType: 1
            };
            await conn.sendMessage(from, buttonMessage, { quoted: mek });
        }

    } catch (e) {
        console.error("Dink Error:", e.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ *දෝෂයක් ඇතිවිය:* ${e.message}`);
    }
});
