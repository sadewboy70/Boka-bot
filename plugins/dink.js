const { cmd } = require('../command');
const axios = require('axios');
const path = require('path');
const config = require('../config');

const API = "https://kavindu-download-web.vercel.app/api/dinkamovies/movie";
const MAX_MB = Number(config.MAX_MOVIE_MB || 2000); // WhatsApp document limit â‰ˆ 2GB
const activeDownloads = new Set(); // à¶‘à¶š chat à¶‘à¶šà¶š à¶‘à¶š à¶´à·à¶»à¶§ à¶‘à¶š download à¶‘à¶šà¶ºà·’

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

const safeName = (s) => s.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 120);
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
    react: "ðŸŽ¬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    const botName = config.BOT_NAME || "SADEW-MINI";
    const prefix = config.PREFIX || ".";

    try {
        if (!q) return reply(`ðŸ”Ž *à¶šà¶»à·”à¶«à·à¶šà¶» à¶ à·’à¶­à·Šâ€à¶»à¶´à¶§à¶ºà¶š à¶±à¶¸à¶šà·Š à¶½à¶¶à· à¶¯à·™à¶±à·Šà¶±.*\nðŸ’¡ _à¶‹à¶¯à·: ${prefix}dink the croods_`);
        q = q.trim();

        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 3: à¶­à·à¶»à¶´à·” quality à¶‘à¶š download à¶šà¶»à¶½à· WhatsApp à¶‘à¶šà¶§ à¶ºà·€à¶±à·€à· â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Format: .dink dl <number> <movie_page_url>
        if (/^dl\s+/i.test(q)) {
            const [, numStr, pageUrl] = q.split(/\s+/);
            const index = parseInt(numStr, 10) - 1;
            if (isNaN(index) || !/^https?:\/\//i.test(pageUrl || "")) {
                return reply(`âŒ *à·€à·à¶»à¶¯à·’ format à¶‘à¶šà¶šà·Š.*\nðŸ’¡ _${prefix}dink dl 1 <movie_link>_`);
            }

            if (activeDownloads.has(from)) {
                return reply("â³ *à¶¸à·™à¶¸ chat à¶‘à¶šà·š à¶¯à·à¶±à¶§à¶¸à¶­à·Š download à¶‘à¶šà¶šà·Š à·ƒà·’à¶¯à·”à·€à·™à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“. à¶šà¶»à·”à¶«à·à¶šà¶» à¶»à·à¶³à·“ à·ƒà·’à¶§à·’à¶±à·Šà¶±.*");
            }
            activeDownloads.add(from);

            try {
                await conn.sendMessage(from, { react: { text: 'â¬‡ï¸', key: mek.key } });

                const dlData = await getDownloads(pageUrl);
                const dl = dlData?.downloads?.[index];
                if (!dl) return reply("âŒ *à¶‘à¶¸ quality à¶‘à¶š à·„à¶¸à·” à¶±à·œà·€à·“à¶º.*");

                const fileUrl = pickLink(dl);
                if (!fileUrl) return reply("âŒ *Download link à¶‘à¶šà¶šà·Š à¶±à·à¶­.*");

                // Stream à¶‘à¶šà¶šà·Š à·€à·’à¶¯à·’à·„à¶§ download à¶šà¶»à¶±à·€à· (RAM à¶‘à¶šà¶§ à¶¸à·”à·…à·” file à¶‘à¶šà¶¸ load à·€à·™à¶±à·Šà¶±à·š à¶±à·‘)
                const res = await axios.get(fileUrl, {
                    responseType: 'stream',
                    timeout: 60000,
                    maxRedirects: 10,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });

                const type = res.headers['content-type'] || "";
                const size = Number(res.headers['content-length'] || 0);

                // Google Drive quota / virus warning HTML page à¶‘à¶šà¶šà·Š à¶†à·€à·œà¶­à·Š
                if (type.includes('text/html')) {
                    res.data.destroy();
                    return reply(`âŒ *File à¶‘à¶š à¶šà·™à¶½à·’à¶±à·Šà¶¸ download à¶šà¶»à¶±à·Šà¶± à¶¶à·à·„à· (Drive limit / warning page).*\nðŸ”— ${fileUrl}`);
                }

                if (size && size / 1024 / 1024 > MAX_MB) {
                    res.data.destroy();
                    return reply(`âŒ *File à¶‘à¶š à¶½à·œà¶šà·” à·€à·à¶©à·’à¶ºà·’ (${mb(size)} MB). à¶‹à¶´à¶»à·’à¶¸à¶º ${MAX_MB} MB.*\nðŸ”— ${fileUrl}`);
                }

                const fileName = safeName(
                    fileNameFromHeader(res.headers['content-disposition']) ||
                    `${dlData.title.split("|")[0]} ${dl.quality}.mp4`
                );

                await reply(
                    `ðŸ“¥ *Download à·€à·™à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...*\n\n` +
                    `ðŸŽ¬ *${dlData.title}*\n` +
                    `ðŸŽž *Quality:* ${dl.quality}\n` +
                    `ðŸ“¦ *Size:* ${size ? mb(size) + " MB" : (dl.size || "Unknown")}\n\n` +
                    `_à¶½à·œà¶šà·” files à·€à¶½à¶§ à·€à·’à¶±à·à¶©à·’ à¶šà·’à·„à·’à¶´à¶ºà¶šà·Š à¶ºà· à·„à·à¶š._`
                );
                await conn.sendMessage(from, { react: { text: 'ðŸ“¤', key: mek.key } });

                await conn.sendMessage(from, {
                    document: { stream: res.data },
                    mimetype: mimeOf(fileName),
                    fileName,
                    caption: `ðŸŽ¬ *${dlData.title}*\nðŸŽž ${dl.quality}\n\n> *á´˜á´á´¡á´‡Ê€á´‡á´… Ê™Ê ${botName}*`
                }, { quoted: mek });

                await conn.sendMessage(from, { react: { text: 'âœ…', key: mek.key } });
            } finally {
                activeDownloads.delete(from);
            }
            return;
        }

        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 2: Movie link à¶‘à¶š à¶†à·€à¶¸ qualities à¶´à·™à¶±à·Šà·€à¶±à·€à· â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (/^https?:\/\//i.test(q)) {
            await conn.sendMessage(from, { react: { text: 'â³', key: mek.key } });

            const dlData = await getDownloads(q);
            if (!dlData) return reply("âŒ *à¶¸à·™à¶¸ à¶ à·’à¶­à·Šâ€à¶»à¶´à¶§à¶º à·ƒà¶³à·„à· à¶©à·€à·”à¶±à·Šà¶½à·à¶©à·Š à¶½à·’à¶±à·Šà¶šà·Šà·ƒà·Š à·„à¶¸à·” à¶±à·œà·€à·“à¶º.*");

            let txt = `â•­â”â”ã€” *ðŸŽ¬ ð— ð—¢ð—©ð—œð—˜ ð——ð—¢ð—ªð—¡ð—Ÿð—¢ð—”ð—— ðŸŽ¬* ã€•â”â”â¬£\nâ”ƒ\n`;
            txt += `â”ƒ *ðŸŽ¬ ð— ð—¼ð˜ƒð—¶ð—²:* ${dlData.title}\nâ”ƒ\n`;
            dlData.downloads.forEach((dl, i) => {
                txt += `*${i + 1}. ðŸŽž* ${dl.quality}${dl.size && !dl.quality.includes(dl.size) ? ` (${dl.size})` : ""}\n`;
                txt += `   â†³ \`${prefix}dink dl ${i + 1} ${q}\`\n\n`;
            });
            txt += `> *Quality à¶‘à¶š à¶­à·à¶»à¶±à·Šà¶±, bot à¶‘à¶š file à¶‘à¶š WhatsApp à¶‘à¶šà¶§à¶¸ à¶‘à·€à¶ºà·’.*`;

            const buttons = dlData.downloads.slice(0, 10).map((dl, i) => ({
                buttonId: `${prefix}dink dl ${i + 1} ${q}`,
                buttonText: { displayText: `â¬‡ï¸ ${dl.quality}`.slice(0, 20) },
                type: 1
            }));

            await conn.sendMessage(from, {
                text: txt,
                footer: `á´˜á´á´¡á´‡Ê€á´‡á´… Ê™Ê ${botName}`,
                buttons,
                headerType: 1
            }, { quoted: mek });
            await conn.sendMessage(from, { react: { text: 'âœ…', key: mek.key } });
            return;
        }

        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 1: à¶±à¶¸à·™à¶±à·Š search à¶šà¶»à¶±à·€à· â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        await conn.sendMessage(from, { react: { text: 'ðŸ”', key: mek.key } });

        const { data: resData } = await axios.get(`${API}/search?q=${encodeURIComponent(q)}`, { timeout: 15000 });
        if (!resData?.status || !Array.isArray(resData.data) || resData.data.length === 0) {
            return reply(`âŒ *"${q}" à·ƒà¶³à·„à· à¶´à·Šâ€à¶»à¶­à·’à¶µà¶½ à¶šà·’à·ƒà·’à·€à¶šà·Š à·„à¶¸à·” à¶±à·œà·€à·“à¶º.*`);
        }

        const movies = resData.data.slice(0, 10);

        let txt = `â•­â”â”ã€” *ðŸŽ¬ ð— ð—¢ð—©ð—œð—˜ ð—¦ð—˜ð—”ð—¥ð—–ð—› ðŸŽ¬* ã€•â”â”â¬£\nâ”ƒ\n`;
        txt += `â”ƒ *ðŸ” Search:* ${q}\nâ”ƒ\n`;
        movies.forEach((mv, i) => {
            txt += `*${i + 1}.* ${mv.title}\n`;
            txt += `   â†³ \`${prefix}dink ${mv.link || mv.url}\`\n\n`;
        });
        txt += `> *à¶´à·„à¶­à·’à¶±à·Š à¶”à¶¶à¶§ à¶…à·€à·à·Šâ€à¶º à¶ à·’à¶­à·Šâ€à¶»à¶´à¶§à¶º à¶­à·à¶»à¶±à·Šà¶±:*`;

        const buttons = movies.map((mv) => ({
            buttonId: `${prefix}dink ${mv.link || mv.url}`,
            buttonText: { displayText: mv.title.length > 18 ? `ðŸŽ¬ ${mv.title.substring(0, 15)}...` : `ðŸŽ¬ ${mv.title}` },
            type: 1
        }));

        const poster = movies[0].poster;
        const base = { footer: `á´˜á´á´¡á´‡Ê€á´‡á´… Ê™Ê ${botName}`, buttons };
        const msg = poster?.startsWith('http')
            ? { image: { url: poster }, caption: txt, headerType: 4, ...base }
            : { text: txt, headerType: 1, ...base };

        await conn.sendMessage(from, msg, { quoted: mek });

    } catch (e) {
        console.error("Dink Error:", e.message);
        await conn.sendMessage(from, { react: { text: 'âŒ', key: mek.key } });
        reply(`âŒ *à¶¯à·à·‚à¶ºà¶šà·Š à¶‡à¶­à·’à·€à·’à¶º:* ${e.message}`);
    }
});