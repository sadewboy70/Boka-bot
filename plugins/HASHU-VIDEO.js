const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');
const config = require('../config');

// 1. ප්‍රධාන Video කමාන්ඩ් එක (Search කිරීම සහ බටන් මගින් Quality තේරීම)
cmd({
    pattern: "video",
    desc: "YouTube Video Downloader",
    category: "download",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ *කරුණාකර වීඩියෝවක නමක් හෝ YouTube ලින්ක් එකක් ලබා දෙන්න.*");

        const isUrl = q.includes('youtu.be') || q.includes('youtube.com');

        // 🟢 නමක් දුන්නොත් Search කරලා ප්‍රතිඵල 10ක් බටන් විදිහට යැවීම 🟢
        if (!isUrl) {
            const search = await yts(q);
            const videos = search.videos.slice(0, 10); 
            
            if (videos.length === 0) return reply("❌ *වීඩියෝව සොයාගත නොහැකි විය.*");

            // ප්‍රතිඵල 10 සඳහා බටන් 10ක් සෑදීම
            let buttons = videos.map((v, i) => ({
                buttonId: `${config.PREFIX}video ${v.url}`,
                buttonText: { displayText: `${i + 1}. ${v.title.substring(0, 25)}` },
                type: 1
            }));

            const buttonMessage = {
                image: { url: videos[0].thumbnail },
                caption: `*${q}* සඳහා සෙවුම් ප්‍රතිඵල ${videos.length}ක් පහතින් දැක්වේ. කැමති වීඩියෝවක් තෝරන්න.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀᴅᴇᴡ ᴍɪɴɪ`,
                footer: "SADEW MINI DOWNLODER",
                buttons: buttons,
                headerType: 4
            };

            return await conn.sendMessage(from, buttonMessage, { quoted: mek });
        } 
        
        // 🟢 ලින්ක් එකක් දුන්නොත් Quality තේරීමට බටන් 8ක් යැවීම 🟢
        else {
            const ytId = q.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)[2].split(/[^0-9a-z_\-]/i)[0];
            const search = await yts({ videoId: ytId });
            const data = search;

            // Video සහ Document Format සඳහා බටන් 8ක්
            let buttons = [
                { buttonId: `${config.PREFIX}ytdl ${q} 360 video`, buttonText: { displayText: '360p Video 🎥' }, type: 1 },
                { buttonId: `${config.PREFIX}ytdl ${q} 480 video`, buttonText: { displayText: '480p Video 🎥' }, type: 1 },
                { buttonId: `${config.PREFIX}ytdl ${q} 720 video`, buttonText: { displayText: '720p Video 🎥' }, type: 1 },
                { buttonId: `${config.PREFIX}ytdl ${q} 1080 video`, buttonText: { displayText: '1080p Video 🎥' }, type: 1 },
                { buttonId: `${config.PREFIX}ytdl ${q} 360 doc`, buttonText: { displayText: '360p Doc 📄' }, type: 1 },
                { buttonId: `${config.PREFIX}ytdl ${q} 480 doc`, buttonText: { displayText: '480p Doc 📄' }, type: 1 },
                { buttonId: `${config.PREFIX}ytdl ${q} 720 doc`, buttonText: { displayText: '720p Doc 📄' }, type: 1 },
                { buttonId: `${config.PREFIX}ytdl ${q} 1080 doc`, buttonText: { displayText: '1080p Doc 📄' }, type: 1 }
            ];

            const qualityMsg = {
                image: { url: data.thumbnail },
                caption: `🎬 *${data.title}*\n\nඔබට අවශ්‍ය Quality එක සහ Format එක පහත බටන් වලින් තෝරන්න.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀᴅᴇᴡ ᴍɪɴɪ`,
                footer: "SADEW MINI DOWNLODER",
                buttons: buttons,
                headerType: 4
            };

            return await conn.sendMessage(from, qualityMsg, { quoted: mek });
        }
    } catch (e) {
        console.error(e);
        reply("❌ *දෝෂයක් ඇතිවිය.*");
    }
});

// 2. වීඩියෝව Stream කර ඩවුන්ලෝඩ් කරන රහසිගත කමාන්ඩ් එක (ytdl)
cmd({
    pattern: "ytdl",
    dontAddCommandList: true, 
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const args = q.split(" ");
        if (args.length < 3) return;

        const url = args[0];
        const quality = args[1]; // 360, 480, 720, 1080
        const format = args[2]; // video or doc

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // IP Block මගහරින්න පිටත API එකක් හරහා Direct Link එක ලබා ගැනීම
        const apiUrl = `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl);
        
        if (!res.data || !res.data.result) {
            return reply("❌ *වීඩියෝව ලබා ගැනීමට නොහැකි විය. වෙනත් වීඩියෝවක් උත්සාහ කරන්න.*");
        }

        const directLink = res.data.result.downloadLink; 
        const title = res.data.result.title || "Sadew_Mini_Video";

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        // 🟢 RAM සහ HDD පිරෙන්නේ නැතිව Axios හරහා Stream කිරීම 🟢
        const response = await axios({
            method: 'GET',
            url: directLink,
            responseType: 'stream',
            timeout: 120000 
        });

        if (format === 'doc') {
            await conn.sendMessage(from, {
                document: { stream: response.data },
                mimetype: 'video/mp4',
                fileName: `${title} - ${quality}p.mp4`,
                caption: `🎬 ${title}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀᴅᴇᴡ ᴍɪɴɪ`
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                video: { stream: response.data },
                mimetype: 'video/mp4',
                caption: `🎬 ${title}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀᴅᴇᴡ ᴍɪɴɪ`
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("YTDL Stream Error:", e.message);
        reply("❌ *ඩවුන්ලෝඩ් වීමේදී දෝෂයක්. IP Block වී හෝ ෆයිල් එක විශාල වැඩි විය හැක.*");
    }
});
