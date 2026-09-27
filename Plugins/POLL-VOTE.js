const { cmd, commands } = require('../command');
const config = require('../config');

cmd({
    pattern: "vote",
    alias: ["cvote", "pvote"],
    category: "public",
    desc: "Vote in a channel poll using a link without replying (Open for everyone).",
    use: "<channel_poll_link> | <option_name>",
    filename: __filename
},
async (sock, mek, m, { from, reply, args }) => {
    // Args ටික එකතු කරලා full text එක ගන්නවා
    const fullText = args.join(" ");
    if (!fullText || !fullText.includes('|')) {
        return reply("❌ *භාවිතා කරන ආකාරය වැරදියි!*\n\n> *ක්‍රමය:* `.vote <ලින්ක් එක> | <Option එක>`\n> *උදාහරණ:* `.vote https://whatsapp.com/channel/0029VaXXXXX/123 | Yes`");
    }

    // ලින්ක් එක සහ Option එක වෙන් කරගැනීම (| ලකුණෙන්)
    const parts = fullText.split('|');
    const link = parts[0].trim();
    const selectedOption = parts[1].trim();

    if (!link.includes('whatsapp.com/channel/')) {
        return reply("❌ *කරුණාකර නිවැරදි වට්ස්ඇප් චැනල් ලින්ක් එකක් ලබාදෙන්න..*");
    }

    // ලින්ක් එකෙන් Invite Code එක සහ Message Server ID එක වෙන් කිරීම
    const cleanLink = link.split('?')[0];
    const urlParts = cleanLink.split('/');
    const msgId = urlParts[urlParts.length - 1]; 
    const inviteCode = urlParts[urlParts.length - 2];

    if (!inviteCode || !msgId || isNaN(msgId)) {
        return reply("❌ *ලින්ක් එකේ ගැටලුවක් ඇත. මැසේජ් ID එක සොයාගත නොහැක.*");
    }

    await reply(`🔍 *චැනල් විස්තර පරීක්ෂා කරමින් පවතී...*`);

    let targetChannelJid = null;

    // Invite Code එකෙන් චැනල් එකේ ඇත්තම @newsletter JID එක ගන්නවා
    try {
        const meta = await sock.newsletterMetadata('invite', inviteCode);
        if (meta && meta.id) {
            targetChannelJid = meta.id;
        }
    } catch (err) {
        console.error("Error fetching newsletter JID:", err.message);
        return reply("❌ *චැනල් එකේ JID එක සොයා ගැනීමට නොහැකි විය. ලින්ක් එක වැරදි විය හැක.*");
    }

    if (!targetChannelJid) return reply("❌ *JID එක ලබා ගැනීමට අපොහොසත් විය.*");

    try {
        await reply(`⚡ *Poll එකට Vote කිරීමට උත්සාහ කරයි...*\n📢 *Channel:* ${targetChannelJid}\n🔢 *Message ID:* ${msgId}\n🗳️ *Option:* ${selectedOption}`);

        // Low-level query එකකින් vote එක යැවීම
        await sock.query({
            tag: 'message',
            attrs: { to: targetChannelJid, type: 'poll', id: msgId.toString() },
            content: [
                {
                    tag: 'poll_vote',
                    attrs: { option: selectedOption }
                }
            ]
        });

        return reply(`✅ *'${selectedOption}' සඳහා සාර්ථකව ඡන්දය (Vote) ප්‍රකාශ කිරීමට කමාන්ඩ් එක යැව්වා!*`);

    } catch (err) {
        console.error("Channel Poll Vote Error:", err.message);
        
        // Fallback ක්‍රමය
        try {
            await sock.sendMessage(targetChannelJid, {
                pollUpdates: [
                    {
                        pollUpdateMessageKey: { remoteJid: targetChannelJid, id: msgId.toString(), fromMe: false },
                        vote: {
                            selectedOptions: [Buffer.from(selectedOption).toString('hex')] 
                        }
                    }
                ]
            });
            return reply(`✅ *Vote එක සෙන්ඩ් කළා (Fallback)!*`);
        } catch (e) {
            return reply(`❌ *Vote කිරීමට අපොහොසත් විය:* ${err.message}`);
        }
    }
});
