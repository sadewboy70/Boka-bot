const { cmd } = require("../command");

cmd({
    pattern: "gstatus",
    alias: ["groupinfo", "gcinfo"],
    react: "📊",
    desc: "Show group information",
    category: "group",
    filename: __filename
},
async (conn, mek, m, {
    from,
    isGroup,
    reply
}) => {

    try {

        if (!isGroup) return reply("*❌ This command can only be used in groups.*");

        const metadata = await conn.groupMetadata(from);

        const admins = metadata.participants.filter(v => v.admin);
        const owner = metadata.owner ? "@" + metadata.owner.split("@")[0] : "Unknown";

        const text = `
╭━━〔 📊 *GROUP STATUS* 〕━━⬣
┃
┃ 📛 *Name :* ${metadata.subject}
┃ 👑 *Owner :* ${owner}
┃ 👥 *Members :* ${metadata.participants.length}
┃ 🛡️ *Admins :* ${admins.length}
┃ 📝 *Description :*
┃ ${metadata.desc || "No description"}
┃
┃ 🔒 *Locked :* ${metadata.restrict ? "Yes" : "No"}
┃ 📢 *Announcement :* ${metadata.announce ? "Admins Only" : "Everyone"}
┃
╰━━━━━━━━━━━━━━⬣`;

        await conn.sendMessage(from, {
            text,
            mentions: metadata.owner ? [metadata.owner] : []
        }, {
            quoted: mek
        });

    } catch (e) {
        console.log(e);
        reply("*❌ Failed to fetch group information.*");
    }

});
