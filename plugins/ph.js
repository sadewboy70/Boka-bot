const { cmd } = require('../command');
const axios = require('axios');

// ──────────────────────────────────────────────
// 1. SEARCH COMMAND - බටන් ලිස්ට් එක සහ පළමු Thumbnail එක
// ──────────────────────────────────────────────
cmd({
    pattern: "phsearch",
    alias: ["phs"],
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

        const results = res.data.results;
        const firstThumb = results[0].thumbnail; // පළවෙනි වීඩියෝ එකේ Thumbnail එක

        let msg = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┊ 🔞 *SEARCH RESULTS* 🔞\n┊ 🔍 *Query:* ${query}\n┊ 🎬 *Results:* ${results.length}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n> පහතින් අවශ්‍ය වීඩියෝව තෝරන්න ⬇️\n\n> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0`;
        
        let buttons = [];
        // Button Limit නැති නිසා Results ඔක්කොම Button වලට දානවා
        results.forEach((vid, index) => {
            // Button Text එකේ අකුරු ගාණ සීමාවක් තියෙන්න පුළුවන් නිසා Title එක පොඩ්ඩක් කොට කරනවා (අකුරු 20ට)
            let shortTitle = vid.title.length > 20 ? vid.title.substring(0, 20) + "..." : vid.title;
            
            buttons.push({
                buttonId: `.phdetail ${vid.link}`, 
                buttonText: { displayText: `🎬 ${index + 1}. ${shortTitle}` }, 
                type: 1
            });
        });

        const buttonMessage = {
            image: { url: firstThumb },
            caption: msg,
            footer: "SADEW MINI",
            buttons: buttons,
            headerType: 4
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});

// ──────────────────────────────────────────────
// 2. DETAILS COMMAND - වීඩියෝ එකේ Card එක සහ Quality Buttons
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
        const thumb = data.thumbnailUrl;
        
        let msg = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┊ 🔞 *VIDEO DETAILS* 🔞\n┊\n┊ 🎬 *Title:* ${title}\n┊ ⏱️ *Duration:* ${duration}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n> පහතින් අවශ්‍ය Quality එක තෝරන්න ⬇️`;

        let buttons = [];
        // Available Qualities ටික Button වලට දානවා
        data.videos.forEach(v => {
            buttons.push({
                buttonId: `.phvid ${v.quality} ${url}`, 
                buttonText: { displayText: `📥 ${v.quality} Download` }, 
                type: 1
            });
        });

        const buttonMessage = {
            image: { url: thumb },
            caption: msg,
            footer: "SADEW MINI",
            buttons: buttons,
            headerType: 4
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});

// ──────────────────────────────────────────────
// 3. VIDEO STREAM COMMAND - තේරූ Quality එකෙන් Video එක යැවීම
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

        // ආපහු API එකට ගහලා කෙලින්ම ඒ වෙලාවේ අලුත් Download Link එක ගන්නවා (Link Expire වෙන එක නවත්වන්න)
        const apiUrl = `https://ph-dz.vercel.app/download?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl, { timeout: 30000 });
        
        if (!res.data || !res.data.success || !res.data.data) {
            return reply("❌ *වීඩියෝව ලබාගැනීමට නොහැකි විය!*");
        }

        const data = res.data.data;
        const videos = data.videos;
        
        // යූසර් Select කරපු Quality එකේ ලින්ක් එක හොයනවා
        let finalVideoUrl = "";
        const targetVideo = videos.find(v => v.quality === selectedQuality);

        if (targetVideo) {
            finalVideoUrl = targetVideo.url;
        } else if (videos.length > 0) {
            // ඒ Quality එක නැත්නම් තියෙන එකක් දෙනවා
            finalVideoUrl = videos[0].url; 
        } else {
            return reply("❌ *Download Link එකක් හමු නොවුණි!*");
        }

        const caption = `🎬 *${data.title}*\n✨ *Quality:* ${selectedQuality}\n\n> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0`;

        // Document Format එකෙන් යැවීම (ලොකු ෆයිල් නිසා)
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
