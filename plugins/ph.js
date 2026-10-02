const { cmd } = require('../command');
const axios = require('axios');

// ──────────────────────────────────────────────
// 1. SEARCH COMMAND - (.ph)
// ──────────────────────────────────────────────
cmd({
    pattern: "ph",
    react: "🔍",
    desc: "Search videos and show buttons",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const query = args.join(" ");
        if (!query) return reply("🔍 *කරුණාකර Search කරන්න අවශ්‍ය නම ඇතුලත් කරන්න!*");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const apiUrl = `https://ph-dz.vercel.app/search?q=${encodeURIComponent(query)}`;
        const res = await axios.get(apiUrl);
        
        if (!res.data || !res.data.success || !res.data.results || res.data.results.length === 0) {
            return reply("❌ *ප්‍රතිඵල කිසිවක් සොයාගත නොහැකි විය!*");
        }

        // WhatsApp Crash වෙන එක නවත්වන්න Results 10කට සීමා කරලා තියෙන්නේ
        const results = res.data.results.slice(0, 10); 

        let msg = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┊ 🔞 *SEARCH RESULTS* 🔞\n┊ 🔍 *Query:* ${query}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n> පහතින් අවශ්‍ය වීඩියෝව තෝරන්න ⬇️\n\n> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0`;
        
        let buttons = [];
        results.forEach((vid, index) => {
            // Button Text එක අකුරු 20ට වඩා දිග නම් කොට කරනවා
            let shortTitle = vid.title.length > 20 ? vid.title.substring(0, 20) + "..." : vid.title;
            buttons.push({
                buttonId: `.phdetail ${vid.link}`, 
                buttonText: { displayText: `🎬 ${index + 1}. ${shortTitle}` }, 
                type: 1
            });
        });

        // Thumbnail එක අයින් කරලා කෙලින්ම Text Button මැසේජ් එකක් විදිහට හැදුවා (Error 403 එන්නේ නෑ)
        const buttonMessage = {
            text: msg,
            footer: "SADEW MINI",
            buttons: buttons,
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});

// ──────────────────────────────────────────────
// 2. DETAILS COMMAND - (.phdetail) Video Card & Qualities
// ──────────────────────────────────────────────
cmd({
    pattern: "phdetail",
    react: "📑",
    desc: "Show video details card and quality buttons",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const url = args[0];
        if (!url) return reply("❌ *Link එකක් හමු නොවුණි!*");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const apiUrl = `https://ph-dz.vercel.app/download?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl, { timeout: 30000 });
        
        if (!res.data || !res.data.success || !res.data.data) {
            return reply("❌ *වීඩියෝවේ විස්තර ලබාගැනීමට නොහැකි විය!*");
        }

        const data = res.data.data;
        const title = data.title || "Unknown Video";
        const duration = data.duration || "N/A";
        
        let msg = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┊ 🔞 *VIDEO DETAILS* 🔞\n┊\n┊ 🎬 *Title:* ${title}\n┊ ⏱️ *Duration:* ${duration}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n> පහතින් අවශ්‍ය Quality එක තෝරන්න ⬇️`;

        let buttons = [];
        data.videos.forEach(v => {
            buttons.push({
                buttonId: `.phvid ${v.quality} ${url}`, 
                buttonText: { displayText: `📥 ${v.quality} Download` }, 
                type: 1
            });
        });

        // මෙතනිනුත් Thumbnail එක අයින් කළා 
        const buttonMessage = {
            text: msg,
            footer: "SADEW MINI",
            buttons: buttons,
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});

// ──────────────────────────────────────────────
// 3. VIDEO STREAM COMMAND - (.phvid) Quality Download
// ──────────────────────────────────────────────
cmd({
    pattern: "phvid",
    react: "📥",
    desc: "Stream the video to chat",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const selectedQuality = args[0];
        const url = args[1];

        if (!selectedQuality || !url) return reply("❌ *දෝෂයක්! Quality හෝ Link එකක් නොමැත.*");

        await conn.sendMessage(from, { react: { text: '⬆', key: mek.key } });

        const apiUrl = `https://ph-dz.vercel.app/download?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl, { timeout: 30000 });
        
        if (!res.data || !res.data.success || !res.data.data) {
            return reply("❌ *වීඩියෝව ලබාගැනීමට නොහැකි විය!*");
        }

        const data = res.data.data;
        const videos = data.videos;
        
        let finalVideoUrl = "";
        const targetVideo = videos.find(v => v.quality === selectedQuality);

        if (targetVideo) {
            finalVideoUrl = targetVideo.url;
        } else if (videos.length > 0) {
            finalVideoUrl = videos[0].url; 
        } else {
            return reply("❌ *Download Link එකක් හමු නොවුණි!*");
        }

        const caption = `🎬 *${data.title}*\n✨ *Quality:* ${selectedQuality}\n\n> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0`;

        await conn.sendMessage(from, {
            document: { url: finalVideoUrl },
            mimetype: 'video/mp4',
            fileName: `Sadew_Mini_${Date.now()}.mp4`,
            caption: caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
