const { cmd } = require('../command');
const axios = require('axios');
const path = require('path');
const config = require('../config');

const API = "https://kavindu-download-web.vercel.app/api/dinkamovies/movie";
const MAX_MB = Number(config.MAX_MOVIE_MB || 2000);
const activeDownloads = new Set();

const decode = (s = "") => s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const pickLink = (dl) => decode(dl.direct_link || dl.link || dl.gdrive_link || dl.pixeldrain_link || "");

const mimeOf = (name = "") => ({
    ".mp4": "video/mp4",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".webm": "video/webm",
    ".zip": "application/zip",
    ".rar": "application/vnd.rar"
}[path.extname(name).toLowerCase()] || "application/octet-stream");

const fileNameFromHeader = (cd = "") => {
    const star = cd.match(/filename\*=UTF-8''([^;]+)/i);
    if (star) return decodeURIComponent(star[1]);
    const normal = cd.match(/filename="?([^";]+)"?/i);
    return normal ? normal[1] : null;
};

const safeName = (s) => String(s || "movie").replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 120);
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

async function getDownloads(pageUrl) {
    const { data } = await axios.get(`${API}/dl?url=${encodeURIComponent(pageUrl)}`, { timeout: 25000 });
    if (!data?.status || !Array.isArray(data.downloads) || data.downloads.length === 0) return null;
    return data;
}

cmd({
    pattern: "dink",
    alias: ["dinkamovie"],
    desc: "DinkaMovies search + WhatsApp document downloader",
    category: "movies",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    const botName = config.BOT_NAME || "SADEW-MINI";
    const prefix = config.PREFIX || ".";

    try {
        if (!q) return reply(`🔎 *කරුණාකර ඉත්රපටයක නමක් ලබා දෙන්න.*\n💡 _උදා: ${prefix}dink the croods_`);
        q = q.trim();

        // ───────────── STEP 3: quality එක download කර WhatsApp එකට යවනවා ─────────────
        if (/^dl\s+/i.test(q)) {
            const [, numStr, pageUrl] = q.split(/\s+/);
            const index = parseInt(numStr, 10) - 1;
            if (isNaN(index) || !/^https?:\/\//i.test(pageUrl || "")) {
                return reply(`❌ *වැරදි format එකක්.*\n💡 _${prefix}dink dl 1 <movie_link>_`);
            }

            if (activeDownloads.has(from)) {
                return reply("⏳ *මෙම chat එකේ දැනටමත් download එකක් සිදුවෙමින් පවති. කරුණාකර රැඳී සිටින්න.*");
            }
            activeDownloads.add(from);

            try {
                await conn.sendMessage(from, { react: { text: '⬇️', key: mek.key } });

                const dlData = await getDownloads(pageUrl);
                const dl = dlData?.downloads?.[index];
                if (!dl) return reply("❌ *එම quality එක හමු නොවීය.*");

                const fileUrl = pickLink(dl);
                if (!fileUrl) return reply("❌ *Download link එකක් නැත.*");

                const res = await axios.get(fileUrl, {
                    responseType: 'stream',
                    timeout: 0, // disable socket timeout
                    maxRedirects: 10,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });

                const type = res.headers['content-type'] || "";
                const size = Number(res.headers['content-length'] || 0);

                if (type.includes('text/html')) {
                    res.data.destroy();
                    return reply(`❌ *File එක කෙලින්ම download කරන්න බෑ (Drive limit / warning page).*\n🔗 ${fileUrl}`);
                }

                if (size && size / 1024 / 1024 > MAX_MB) {
                    res.data.destroy();
                    return reply(`❌ *File එක ලොකු වැඩියි (${mb(size)} MB). උපරිමය ${MAX_MB} MB.*\n🔗 ${fileUrl}`);
                }

                const baseTitle = (dlData.title || "movie").split("|")[0];
                const fileName = safeName(
                    fileNameFromHeader(res.headers['content-disposition']) ||
                    `${baseTitle} ${dl.quality || ""}.mp4`
                );

                await reply(
                    `📥 *Download වෙමින් පවතී...*\n\n` +
                    `🎬 *${dlData.title || baseTitle}*\n` +
                    `🎞 *Quality:* ${dl.quality || "Unknown"}\n` +
                    `📦 *Size:* ${size ? mb(size) + " MB" : (dl.size || "Unknown")}\n\n` +
                    `_ලොකු files වලට විනාඩි කිහිපයක් ය හැක._`
                );
                await conn.sendMessage(from, { react: { text: '📤', key: mek.key } });

                try {
                    await conn.sendMessage(from, {
                        document: { stream: res.data },
                        mimetype: mimeOf(fileName),
                        fileName,
                        caption: `🎬 *${dlData.title || baseTitle}*\n🎞 ${dl.quality || ""}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`
                    }, { quoted: mek });
                } catch (sendErr) {
                    try { res.data.destroy(); } catch (_) {}
                    throw sendErr;
                }

                await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
            } finally {
                activeDownloads.delete(from);
            }
            return;
        }

        // ───────────── STEP 2: Movie link එක ආවම qualities පෙන්නනවා ─────────────
        if (/^https?:\/\//i.test(q)) {
            await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

            const dlData = await getDownloads(q);
            if (!dlData) return reply("❌ *මෙම ඉත්රපටය සඳහා download ලින්ක්ස් හමු නොවීය.*");

            let txt = `╭──「 *🎬 ᴅɪɴᴋᴀ ᴍᴏᴠɪᴇꜱ 🎬* 」──╮\n│\n`;
            txt += `│ *🎬 ɴᴀᴍᴇ:* ${dlData.title || "Unknown"}\n│\n`;
            dlData.downloads.forEach((dl, i) => {
                const q1 = dl.quality || "Unknown";
                const showSize = dl.size && !String(q1).includes(dl.size);
                txt += `*${i + 1}. 🎞* ${q1}${showSize ? ` (${dl.size})` : ""}\n`;
                txt += `   ⤷ \`${prefix}dink dl ${i + 1} ${q}\`\n\n`;
            });
            txt += `> *Quality එක තෝරන්න, bot එක file එක WhatsApp එකටම එවයි.*`;

            const buttons = dlData.downloads.slice(0, 10).map((dl, i) => ({
                buttonId: `${prefix}dink dl ${i + 1} ${q}`,
                buttonText: { displayText: `⬇️ ${(dl.quality || "Unknown")}`.slice(0, 20) },
                type: 1
            }));

            await conn.sendMessage(from, {
                text: txt,
                footer: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}`,
                buttons,
                headerType: 1
            }, { quoted: mek });
            await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
            return;
        }

        // ───────────── STEP 1: නමෙන් search කරනවා ─────────────
        await conn.sendMessage(from, { react: { text: '🔍', key: mek.key } });

        const { data: resData } = await axios.get(`${API}/search?q=${encodeURIComponent(q)}`, { timeout: 15000 });
        if (!resData?.status || !Array.isArray(resData.data) || resData.data.length === 0) {
            return reply(`❌ *"${q}" සඳහා ප්‍රතිපල කිසිවක් හමු නොවීය.*`);
        }

        const movies = resData.data.slice(0, 10);

        let txt = `╭──「 *🎬 ᴅɪɴᴋᴀ ꜱᴇᴀʀᴄʜ 🎬* 」──╮\n│\n`;
        txt += `│ *🔍 Search:* ${q}\n│\n`;
        movies.forEach((mv, i) => {
            txt += `*${i + 1}.* ${mv.title || "Unknown"}\n`;
            txt += `   ⤷ \`${prefix}dink ${mv.link || mv.url}\`\n\n`;
        });
        txt += `> *පහතින් ඕනෑම ඉත්රපටයක් තෝරන්න:*`;

        const buttons = movies.map((mv) => {
            const title = mv.title || "Unknown";
            return {
                buttonId: `${prefix}dink ${mv.link || mv.url}`,
                buttonText: { displayText: title.length > 18 ? `🎬 ${title.substring(0, 15)}...` : `🎬 ${title}` },
                type: 1
            };
        });

        const poster = movies[0].poster;
        const base = { footer: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}`, buttons };
        const msg = poster?.startsWith('http')
            ? { image: { url: poster }, caption: txt, headerType: 4, ...base }
            : { text: txt, headerType: 1, ...base };

        await conn.sendMessage(from, msg, { quoted: mek });

    } catch (e) {
        console.error("Dink Error:", e.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ *දෝෂයක් ඇතිවිය:* ${e.message}`);
    }
});