const { cmd } = require("../command");

cmd({
    pattern: "kick2",
    alias: ["remove"],
    react: "🚫",
    desc: "Remove a member from the group",
    category: "group",
    filename: __filename
},
async (conn, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    participants,
    reply
}) => {

    try {

        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ You must be a group admin.");
        if (!isBotAdmins) return reply("❌ I need admin rights.");

        let user;

        if (mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            user = mek.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (mek.message?.extendedTextMessage?.contextInfo?.participant) {
            user = mek.message.extendedTextMessage.contextInfo.participant;
        } else {
            return reply("❌ Mention or reply to a user.\n\nExample:\n.kick @user");
        }

        const member = participants.find(p => p.id === user);

        if (!member) return reply("❌ User is not in this group.");
        if (member.admin) return reply("❌ I can't remove another admin.");

        await conn.groupParticipantsUpdate(from, [user], "remove");

        await conn.sendMessage(from, {
            text: `✅ @${user.split("@")[0]} has been removed.`,
            mentions: [user]
        }, { quoted: mek });

    } catch (err) {
        console.log(err);
        reply("❌ Failed to remove the member.");
    }
});
