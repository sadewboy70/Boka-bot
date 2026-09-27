const { cmd } = require('../command'); // ඔයාගේ command register කරන file එකේ path එක
const config = require('../config');

cmd({
    pattern: "react",
    alias: ["creact", "chanreact"],
    desc: "Follow කරන්නේ නැතුව චැනල් එකක අන්තිම post එකට react කිරීම.",
    category: "main", // හැමෝටම පේන්න පොදු category එකක් දැම්මා
    use: "<channel_link_or_jid>",
    filename: __filename
},
async (sock, mek, m, { from, q, reply, prefix, senderNumber }) => {
    try {
        // [isOwner Check එක මෙතනින් ඉවත් කර ඇත - දැන් ඕනෑම කෙනෙක්ට පුළුවන්]
        
        // 1. Input එක තියෙනවාද බැලීම
        if (!q) return reply(`❌ *කරුණාකර චැනල් එකේ Link එක හෝ JID එක ලබාදෙන්න!*\n\n*Example:* ${prefix}react https://whatsapp.com/channel/0029VaXXXXX\n\n*Example:* ${prefix}react 120363395674230271@newsletter`);

        let channelJid = q.trim();

        // 2. WhatsApp Channel Link එකක් දුන්නොත් ඒකෙන් JID එක Extract කරගැනීම
        if (channelJid.includes('whatsapp.com/channel/')) {
            const code = channelJid.split('/channel/')[1]?.split('/')[0];
            if (!code) return reply('❌ *අවලංගු චැනල් Link එකක්!*');
            
            // Link එකෙන් චැනල් එකේ Metadata query කිරීම
            const meta = await sock.newsletterMetadata('invite', code).catch(() => null);
            if (!meta || !meta.id) return reply('❌ *චැනල් එක සොයාගත නොහැකි විය!*');
            channelJid = meta.id;
        }

        // 3. JID එක නිවැරදිද බැලීම
        if (!channelJid.endsWith('@newsletter')) {
            return reply('❌ *අවලංගු චැනල් JID එකක්!*');
        }

        // 4. චැනල් එක Follow නොකර එහි පොදු තොරතුරු Fetch කිරීම
        const channelData = await sock.newsletterMetadata('jid', channelJid).catch(() => null);
        
        // අන්තිම Message එකේ Server ID එක ලබාගැනීම
        const lastMsgServerId = channelData?.viewerMeta?.lastReadMessageServerId || 
                                channelData?.lastMessageServerId;

        if (!lastMsgServerId) {
            return reply('❌ *චැනල් එකේ අන්තිම මැසේජ් එකේ ID එක සොයාගන්න බැරි වුණා! (චැනල් එක Public ද කියා පරීක්ෂා කරන්න)*');
        }

        // 5. React කරන්න අවශ්‍ය Random Emoji එකක් තෝරාගැනීම
        const emojis = ['❤️', '👍', '🔥', '🥰', '😎', '👑', '✨', '💯'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        await reply(`⏳ *චැනල් එකට සම්බන්ධ වෙමින්...* \n\n*Channel:* ${channelData?.name || 'Public Channel'}\n*Msg ID:* \`${lastMsgServerId}\``);

        // 6. Low-level Socket Query එකක් මඟින් Follow කරන්නේ නැතුව Reaction එක Push කිරීම
        await sock.query({
            tag: 'message',
            attrs: { to: channelJid, type: 'reaction', id: lastMsgServerId.toString() },
            content: [{ tag: 'reaction', attrs: { text: randomEmoji } }]
        });

        // 7. සාර්ථකයි කියලා reply කිරීම
        await reply(`✅ *සාර්ථකව React කළා!* \n\n*Channel:* ${channelData?.name || 'Public Channel'}\n*Emoji:* ${randomEmoji}\n*Status:* Follow කර නොමැත 🚫👤`);

    } catch (err) {
        console.error('Manual channel react error:', err);
        await reply(`❌ *Error එකක් සිදු වුණා:* ${err.message}`);
    }
});
