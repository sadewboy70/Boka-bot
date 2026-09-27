const { cmd } = require('../command')

cmd({
    pattern: "online",
    alias: ["activemembers"],
    desc: "Scan and list currently online group members",
    category: "group",
    filename: __filename
},
async(conn, mek, m, { from, isGroup, sender, isBotAdmins, reply, isOwner }) => {
    try {
        // 1. Basic Checks
        if (!isGroup) return reply("❌ This command works only in group chats.");
        
        const myNumber = "94703457206@s.whatsapp.net";
        const groupMetadata = await conn.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
        const isGroupAdmin = groupAdmins.includes(sender);

        // 2. Permission Check (Owner or Admin only)
        if (!isOwner && sender !== myNumber && !isGroupAdmin) {
            return reply("❌ Only group admins or the bot owner can use this command.");
        }

        if (!isBotAdmins) return reply("❌ I need to be an Admin to scan online members.");

        // 3. Start Scanning
        await reply("🔄 Scanning for online members... please wait ~15 seconds.");

        const participants = groupMetadata.participants.map(p => p.id);
        const onlineSet = new Set();

        // Presence Update එක අහගෙන ඉන්න listener එක
        const presenceListener = (update) => {
            if (update?.presences) {
                for (const id of Object.keys(update.presences)) {
                    const pres = update.presences[id];
                    // 'unavailable' නොවන ඕනෑම කෙනෙක් online හෝ active ලෙස සලකයි
                    if (pres?.lastKnownPresence && pres.lastKnownPresence !== 'unavailable') onlineSet.add(id);
                    if (pres?.available === true) onlineSet.add(id);
                }
            }
        };

        // හැම සාමාජිකයෙක්ගෙම presence එක ඉල්ලනවා
        for (const p of participants) {
            try { await conn.presenceSubscribe(p); } catch (e) {}
        }

        conn.ev.on('presence.update', presenceListener);

        // තත්පර 15ක් ඉන්නවා data එකතු වෙනකම්
        await new Promise(resolve => setTimeout(resolve, 15000));

        // Listener එක අයින් කරනවා
        conn.ev.off('presence.update', presenceListener);

        // 4. Results Processing
        const onlineArray = Array.from(onlineSet).filter(j => participants.includes(j));

        if (onlineArray.length === 0) {
            return reply("⚠️ No online members detected.\n(They may be hiding their presence or are currently offline.)");
        }

        let txt = `🟢 *Online Members* — ${onlineArray.length}/${participants.length}\n\n`;
        onlineArray.forEach((jid, i) => {
            txt += `${i + 1}. @${jid.split('@')[0]}\n`;
        });

        // 5. Send Result with Mentions
        await conn.sendMessage(from, {
            text: txt.trim(),
            mentions: onlineArray
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ An error occurred while checking online members.");
    }
})
