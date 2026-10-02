const { cmd } = require('../command');
const axios = require('axios');

// 🟢 තාවකාලිකව Download Links මතක තබා ගැනීමට Cache එකක් (Error 429 විසඳුම)
const videoCache = new Map();

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
        const res = await axios.get(apiUrl, { timeout: 60000 }); // Timeout එක තත්පර 60ක් කළා
        
        if (!res.data || !res.data.success || !res.data.results || res.data.results.length === 0) {
            return reply("❌ *ප්‍රතිඵල කිසිවක් සොයාගත නොහැකි විය!*");
        }

        const results = res.data.results.slice(0, 10); 

        let msg = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┊ 🔞 *SEARCH RESULTS* 🔞\n┊ 🔍 *Query:* ${query}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n> පහතින් අවශ්‍ය වීඩියෝව තෝරන්න ⬇️\n\n> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0`;
        
        let buttons = [];
        results.forEach((vid, index) => {
            let shortTitle = vid.title.length > 20 ? vid.title.substring(0, 20) + "..." : vid.title;
            buttons.push({
                buttonId: `.phdetail ${vid.link}`, 
                buttonText: { displayText: `🎬 ${index + 1}. ${shortTitle}` }, 
                type: 1
            });
        });

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
        const res = await axios.get(apiUrl, { timeout: 60000 }); // Timeout එක තත්පර 60ක් කළා
        
        if (!res.data || !res.data.success || !res.data.data) {
            return reply("❌ *වීඩියෝවේ විස්තර ලබාගැනීමට නොහැකි විය!*");
        }

        const data = res.data.data;
        const title = data.title || "Unknown Video";
        const duration = data.duration || "N/A";
        
        videoCache.set(url, data);
        setTimeout(() => videoCache.delete(url), 15 * 60 * 1000);

        let msg = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┊ 🔞 *VIDEO DETAILS* 🔞\n┊\n┊ 🎬 *Title:* ${title}\n┊ ⏱️ *Duration:* ${duration}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n> පහතින් අවශ්‍ය Quality එක තෝරන්න ⬇`;

        let buttons = [];
        data.videos.forEach(v => {
            buttons.push({
                buttonId: `.phvid ${v.quality} ${url}`, 
                buttonText: { displayText: `📥 ${v.quality} Download` }, 
                type: 1
            });
        });

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
        if (e.response && e.response.status === 429) {
            return reply("⚠️ *API එක Rate Limit වී ඇත. තත්පර 15කින් නැවත උත්සාහ කරන්න.*");
        }
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

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        let data = videoCache.get(url);

        if (!data) {
            const apiUrl = `https://ph-dz.vercel.app/download?url=${encodeURIComponent(url)}`;
            const res = await axios.get(apiUrl, { timeout: 60000 }); // Timeout එක තත්පර 60ක් කළා
            if (res.data?.success && res.data?.data) {
                data = res.data.data;
            }
        }

        if (!data || !data.videos) {
            return reply("❌ *වීඩියෝ දත්ත සොයාගත නොහැකි විය. නැවත .phdetail උත්සාහ කරන්න.*");
        }

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

        // 🟢 0.0 kB ෆයිල් සේව් වීම නවත්වන්න කෙලින්ම URL එකෙන් WhatsApp එකට යවනවා
        await conn.sendMessage(from, {
            document: { url: finalVideoUrl },
            mimetype: 'video/mp4',
            fileName: `Sadew_Mini_${Date.now()}.mp4`,
            caption: caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error(e);
        if (e.response && e.response.status === 429) {
            return reply("⚠️ *API එක Rate Limit වී ඇත. තත්පර කිහිපයකින් නැවත උත්සාහ කරන්න.*");
        }
        reply(`❌ *Error:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
