const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "vajira-VajiraOfficial2003";

cmd({
    pattern: "sublk",
    alias: ["sinhala", "sublkdl", "subz"],
    desc: "SubLK / SubZ Sinhala Subtitle Downloader",
    category: "download",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    sender,
    reply
}) => {

    try {

        if (!q) {
            return reply(
`╔══════════════════════╗
   🎬 *DCT SUBLK DOWNLOADER*
╚══════════════════════╝

📌 *Usage:*
.sublk <sublk or subz url>

📌 *Example:*
.sublk https://sublk.lk/shazam-2019`
            );
        }

        if (!q.startsWith("http")) {
            return reply("❌ Valid URL එකක් දෙන්න.\n\nExample: *.sublk https://sublk.lk/...*");
        }

        await conn.sendMessage(from, {
            react: { text: "⏳", key: mek.key }
        });

        // ── API CALL ──────────────────────────────────
        const apiUrl = `https://vajira-official-apis.vercel.app/api/sublkdl?apikey=${API_KEY}&url=${encodeURIComponent(q)}`;

        let response;
        try {
            response = await axios.get(apiUrl, {
                timeout: 20000,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/91.0 Mobile Safari/537.36"
                }
            });
        } catch (apiErr) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ *API Request Failed!*\n\n  └ ${apiErr.message}`);
        }

        const res = response.data;

        if (!res?.status || !res?.data) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ *API returned no data.*\n\nURL එක valid එකක්ද check කරන්න.");
        }

        const d = res.data;

        // ── EXTRACT DATA ──────────────────────────────
        const title       = d.title       || "Unknown Title";
        const image       = d.image       || null;
        const date        = d.date?.trim() || "N/A";
        const imdb        = d.imdbRate    || "N/A";
        const cast        = d.cast        || "N/A";
        const genres      = Array.isArray(d.genres) ? d.genres.join(", ") : "N/A";
        const subtitleUrl = d.subtitleUrl || null;
        const torrents    = Array.isArray(d.torrents) ? d.torrents : [];

        // ── BUILD TORRENT LIST ────────────────────────
        const qualityEmojis = {
            "720p":  "🎞️",
            "1080p": "🎬",
            "2160p": "🔷",
            "4K":    "🔷",
            "3D":    "🥽",
        };

        const torrentLines = torrents.length > 0
            ? torrents.map((t, i) => {
                const emoji = qualityEmojis[t.quality] || "📦";
                return `  ${emoji} *${t.quality}* — ${t.size}`;
              }).join("\n")
            : "  └ No torrents available";

        // ── SEND INFO CARD ────────────────────────────
        const infoCaption =
`✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦
🎬 *SUBLK DOWNLOADER*
✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦

🏷️ *Title*
  └ ${title}

📅 *Date:* ${date}
⭐ *IMDB:* ${imdb}/10
🎭 *Genres:* ${genres}
🎭 *Cast:* ${cast}

━━━━━━━━━━━━━━━━━━━━━━━
${subtitleUrl ? "📥 *Subtitle:* Sending below...\n" : "❌ *Subtitle:* Not available\n"}
🧲 *Torrents:*
${torrentLines}
━━━━━━━━━━━━━━━━━━━━━━━

> ⚡ *DCT MINI BOT* | dct.fwh.is`;

        if (image) {
            await conn.sendMessage(from, {
                image: { url: image },
                caption: infoCaption
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                text: infoCaption
            }, { quoted: mek });
        }

        // ── SEND SUBTITLE FILE ────────────────────────
        if (subtitleUrl) {
            try {
                const subRes = await axios.get(subtitleUrl, {
                    responseType: "arraybuffer",
                    timeout: 20000,
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        "Referer": "https://sublk.lk/"
                    }
                });

                const subBuffer = Buffer.from(subRes.data);

                // Detect file type from content-type or default to .srt
                const contentType = subRes.headers["content-type"] || "";
                let ext = ".srt";
                if (contentType.includes("zip"))   ext = ".zip";
                if (contentType.includes("rar"))   ext = ".rar";
                if (contentType.includes("ass"))   ext = ".ass";

                const fileName = `${title.replace(/[^a-zA-Z0-9 ]/g, "").trim()}${ext}`;

                await conn.sendMessage(from, {
                    document: subBuffer,
                    mimetype: "application/octet-stream",
                    fileName: fileName,
                    caption:
`✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦
✅ *SUBTITLE DOWNLOADED!*
✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦

📄 *${fileName}*

> ⚡ *DCT MINI BOT* | dct.fwh.is`
                }, { quoted: mek });

                await conn.sendMessage(from, {
                    react: { text: "✅", key: mek.key }
                });

            } catch (subErr) {
                await conn.sendMessage(from, { react: { text: "⚠️", key: mek.key } });
                await reply(`⚠️ *Subtitle download failed!*\n\n  └ ${subErr.message}`);
            }

        } else {
            await conn.sendMessage(from, {
                react: { text: "✅", key: mek.key }
            });
        }

        // ── SEND TORRENT LINKS ────────────────────────
        if (torrents.length > 0) {

            const torrentMsg = torrents.map((t, i) => {
                const emoji = qualityEmojis[t.quality] || "📦";
                return `${emoji} *${t.quality}* — ${t.size}\n  └ ${t.url}`;
            }).join("\n\n");

            await conn.sendMessage(from, {
                text:
`✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦
🧲 *TORRENT LINKS*
✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦

${torrentMsg}

> ⚡ *DCT MINI BOT* | dct.fwh.is`
            }, { quoted: mek });
        }

    } catch (e) {
        console.log("SUBLK ERROR =>", e);
        await conn.sendMessage(from, {
            react: { text: "❌", key: mek.key }
        }).catch(() => {});
        reply(`❌ *Something went wrong!*\n\n  └ ${e.message}`);
    }
});
