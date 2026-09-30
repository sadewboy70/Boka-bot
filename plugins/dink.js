const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const API = "https://kavindu-download-web.vercel.app/api/dinkamovies/movie";
const MAX_MB = Number(config.MAX_MOVIE_MB || 2000);
const TMP_DIR = path.join(__dirname, '../tmp');
const activeDownloads = new Set();

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

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
    ".rar": "application/vnd.rar",
    ".pdf": "application/pdf",
    ".apk": "application/vnd.android.package-archive"
}[path.extname(name).toLowerCase()] || "application/octet-stream");

const fileNameFromHeader = (cd = "") => {
    const star = cd.match(/filename\*=UTF-8''([^;]+)/i);
    if (star) return decodeURIComponent(star[1]);
    const normal = cd.match(/filename="?([^";]+)"?/i);
    return normal ? normal[1] : null;
};

const safeName = (s) => String(s || "movie").replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 120);
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

// ── Google Drive File ID එක extract කරනවා ──
function getFileId(url) {
    if (!url || !url.includes('drive.google.com')) return null;
    let m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    m = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    m = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    return null;
}

// ── HTML එකෙන් confirm token එක extract කරනවා ──
function extractConfirmToken(html) {
    if (!html) return null;
    // form action එකේ හෝ link එකේ confirm token එක හොයනවා
    let m = html.match(/confirm=([0-9A-Za-z_-]+)/);
    if (m) return m[1];
    // hidden input field එකෙන්
    m = html.match(/name="confirm"\s+value="([^"]+)"/);
    if (m) return m[1];
    m = html.match(/value="([^"]+)"\s+name="confirm"/);
    if (m) return m[1];
    return null;
}

// ── Google Drive warning page එක handle කරන function එක ──
async function handleGDriveResponse(res, fileId, fileUrl) {
    const contentType = res.headers['content-type'] || '';
    
    // HTML page එකක් ආවොත් (warning page)
    if (contentType.includes('text/html')) {
        const html = await new Promise((resolve) => {
            let data = '';
            res.data.on('data', chunk => data += chunk);
            res.data.on('end', () => resolve(data));
            res.data.on('error', () => resolve(''));
        });

        // confirm token එක extract කරනවා
        let token = extractConfirmToken(html);
        
        // token එක නැත්නම් 't' try කරනවා (files > 100MB සඳහා)
        if (!token) token = 't';

        console.log(`[GDrive] Confirmation page detected. Token: ${token}`);

        // cookies save කරගන්නවා
        const cookies = res.headers['set-cookie'] || [];
        const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');

        // අලුත් URL එක හදනවා
        const newUrl = `https://drive.google.com/uc?export=download&confirm=${token}&id=${fileId}`;

        // අලුත් request එක යවනවා (cookies එක්කම)
        return await axios.get(newUrl, {
            responseType: 'stream',
            timeout: 0,
            maxRedirects: 10,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': cookieStr
            }
        });
    }

    return res;
}

async function getDownloads(pageUrl) {
    const { data } = await axios.get(`${API}/dl?url=${encodeURIComponent(pageUrl)}`, { timeout: 25000 });
    if (!data?.status || !Array.isArray(data.downloads) || data.downloads.length === 0) return null;
    return data;
}

cmd({
    pattern: "dink",
    alias: ["dinkamovie"],
    desc: "DinkaMovies search + WhatsApp document downloader (GDrive fix)",
    category: "movies",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    const botName = config.BOT_NAME || "QUEEN ASALIYA V1";
    const prefix = config.PREFIX || ".";

    try {
        if (!q) return reply(`🔎 *කරුණාකර ඉත්‍රපටයක නමක් ලබා දෙන්න.*\n💡 _උදා: ${prefix}dink the croods_`);
        q = q.trim();

        // ───────────── STEP 3: Quality එක download කර WhatsApp එකට යවනවා ─────────────
        if (/^dl\s+/i.test(q)) {
            const [, numStr, pageUrl] = q.split(/\s+/);
            const index = parseInt(numStr, 10) - 1;
            if (isNaN(index) || !/^https?:\/\//i.test(pageUrl || "")) {
                return reply(`❌ *වැරදි format එකක්.*\n💡 _${prefix}dink dl 1 <movie_link>_`);
            }

            if (activeDownloads.has(from)) {
                return reply("⏳ *මෙම chat එකේ දැනටමත් download එකක් සිදුවෙමින් පවති. රැඳී සිටින්න.*");
            }
            activeDownloads.add(from);

            let tmpPath = null;
            try {
                await conn.sendMessage(from, { react: { text: '⬇️', key: mek.key } });

                const dlData = await getDownloads(pageUrl);
                const dl = dlData?.downloads?.[index];
                if (!dl) return reply("❌ *එම quality එක හමු නොවීය.*");

                const fileUrl = pickLink(dl);
                if (!fileUrl) return reply("❌ *Download link එකක් නැත.*");

                const baseTitle = (dlData.title || "movie").split("|")[0];
                const fileId = getFileId(fileUrl);

                // ── progress message එක ──
                let msg = await conn.sendMessage(from, {
                    text: `⏳ *Download වෙමින්...*\n\n🎬 *${dlData.title || baseTitle}*\n🎞 *Quality:* ${dl.quality || "Unknown"}\n${fileId ? '📂 *Source:* Google Drive' : ''}\n\n> ${botName}`
                }, { quoted: mek });

                // ── Step 1: Initial request ──
                let res = await axios.get(fileUrl, {
                    responseType: 'stream',
                    timeout: 0,
                    maxRedirects: 10,
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                // ── Step 2: GDrive warning page එකක් නම් handle කරනවා ──
                if (fileId) {
                    res = await handleGDriveResponse(res, fileId, fileUrl);
                }

                const type = res.headers['content-type'] || "";
                const size = Number(res.headers['content-length'] || 0);

                // HTML තවමත් තියෙනවා නම් error
                if (type.includes('text/html')) {
                    res.data.destroy();
                    return reply(`❌ *File එක download කරන්න බෑ (private / limit exceeded).*\n🔗 ${fileUrl}`);
                }

                if (size && size / 1024 / 1024 > MAX_MB) {
                    res.data.destroy();
                    return reply(`❌ *File එක ලොකු වැඩියි (${mb(size)} MB). උපරිමය ${MAX_MB} MB.*\n🔗 ${fileUrl}`);
                }

                // ── file name ──
                const fileName = safeName(
                    fileNameFromHeader(res.headers['content-disposition']) ||
                    `${baseTitle} ${dl.quality || ""}.mp4`
                );

                // ── temp file එකට ලියනවා ──
                tmpPath = path.join(TMP_DIR, `${Date.now()}_${fileName}`);
                const writer = fs.createWriteStream(tmpPath);
                res.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                    res.data.on('error', reject);
                });

                const stats = fs.statSync(tmpPath);
                const sizeMB = stats.size / 1024 / 1024;

                if (sizeMB > MAX_MB) {
                    fs.unlinkSync(tmpPath);
                    tmpPath = null;
                    return conn.sendMessage(from, {
                        text: `⚠️ *File Too Large* (${sizeMB.toFixed(2)} MB)\n\nඋපරිමය ${MAX_MB} MB.\n\n🔗 Direct link:\n${fileUrl}\n\n> ${botName}`,
                        edit: msg.key
                    });
                }

                // ── progress update ──
                await conn.sendMessage(from, {
                    text: `📤 *Upload වෙමින්...*\n\n🎬 *${dlData.title || baseTitle}*\n🎞 *Quality:* ${dl.quality || "Unknown"}\n📦 *Size:* ${sizeMB.toFixed(2)} MB\n\n> ${botName}`,
                    edit: msg.key
                });
                await conn.sendMessage(from, { react: { text: '📤', key: mek.key } });

                // ── WhatsApp එකට file එක යවනවා ──
                await conn.sendMessage(from, {
                    document: fs.readFileSync(tmpPath),
                    fileName,
                    mimetype: mimeOf(fileName),
                    caption: `✅ *DINKAMOVIES DOWNLOAD*\n\n🎬 *${dlData.title || baseTitle}*\n🎞 *Quality:* ${dl.quality || "Unknown"}\n📦 *Size:* ${sizeMB.toFixed(2)} MB\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`
                }, { quoted: mek });

                await conn.sendMessage(from, { text: `✅ *Done*`, edit: msg.key });
                await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

            } catch (innerErr) {
                console.error("Dink DL Error:", innerErr.message);
                await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                reply(`❌ *Download Failed*\n\nError: ${innerErr.message}`);
            } finally {
                if (tmpPath && fs.existsSync(tmpPath)) {
                    try { fs.unlinkSync(tmpPath); } catch (_) {}
                }
                activeDownloads.delete(from);
            }
            return;
        }

        // ───────────── STEP 2: Movie link එක ආවම qualities පෙන්නනවා ─────────────
        if (/^https?:\/\//i.test(q)) {
            await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

            const dlData = await getDownloads(q);
            if (!dlData) return reply("❌ *මෙම ඉත්‍රපටය සඳහා download ලින්ක්ස් හමු නොවීය.*");

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
        txt += `> *පහතින් ඕනෑම ඉත්‍රපටයක් තෝරන්න:*`;

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