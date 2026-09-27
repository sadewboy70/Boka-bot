const { cmd } = require('../command');
const axios = require('axios');

const API_KEY = "vajira-VajiraOfficial2003";

cmd({
    pattern: "sitecode",
    alias: ["sitezip", "zipweb"],
    react: "📦",
    desc: "Convert Website To ZIP",
    category: "tools",
    filename: __filename
},
async(conn, mek, m, {
    from,
    q,
    reply
}) => {

    try {

        if (!q) {

            return reply(
`📦 Give me a website URL.

Example:
.web2zip https://example.com`
            );
        }

        // CHECK URL
        if (
            !q.startsWith("http://") &&
            !q.startsWith("https://")
        ) {

            return reply(
`❌ Please give a valid website URL.

Example:
https://example.com`
            );
        }

        await reply("📦 Creating website ZIP file...");

        // API URL
        const api =
`https://vajira-official-apis.vercel.app/api/web2zip?apikey=${API_KEY}&url=${encodeURIComponent(q)}`;

        // REQUEST
        const res = await axios.get(api, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const data = res.data;

        console.log(
            "WEB2ZIP RESPONSE =>",
            JSON.stringify(data, null, 2)
        );

        // FIND ZIP URL
        const findZip = (obj) => {

            if (!obj) return null;

            // STRING
            if (typeof obj === "string") {

                if (
                    obj.startsWith("http") &&
                    (
                        obj.includes(".zip") ||
                        obj.includes("zip")
                    )
                ) {
                    return obj;
                }
            }

            // OBJECT
            if (typeof obj === "object") {

                for (const key in obj) {

                    const found = findZip(obj[key]);

                    if (found) return found;
                }
            }

            return null;
        };

        const zipUrl = findZip(data);

        if (!zipUrl) {

            return reply(
`❌ Failed to create ZIP file.`
            );
        }

        // WEBSITE NAME
        let siteName = "website";

        try {

            const domain =
                new URL(q).hostname;

            siteName =
                domain.replace("www.", "");

        } catch {}

        // SEND ZIP
        await conn.sendMessage(from, {
            document: {
                url: zipUrl
            },
            mimetype: "application/zip",
            fileName: `${siteName}.zip`,
            caption:
`╭━━〔 *📦 WEBSITE TO ZIP* 〕━━⬣
┃
┃ 🌐 Website : ${q}
┃ *_✅ ZIP Created Successfully ⚡🌩️_*
┃
╰━━━━━━━━━━━━━━━━⬣

> ⚡ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗗𝗖𝗧 𝗠𝗗 𝗙𝗥𝗘𝗘 𝗕𝗢𝗧`
        }, { quoted: mek });

    } catch (e) {

        console.log(
            "WEB2ZIP ERROR =>",
            e.response?.data || e.message || e
        );

        reply(
`❌ Website ZIP failed.

${e.message}`
        );
    }
});
