const { cmd } = require('../command');

// ── GET LID PLUGIN ──
// Meka use karanne: WhatsApp ge aluth accounts walata message sender eka
// "@lid" (Linked ID) widihata enawa, phone number ekak nemei — group/community
// message walata visesayenma. Eka nisa config.js eke OWNER_NUMBER (phone
// number) ekk witharai dala thiyenawnam, owner-only commands (bot remove
// karanawa wage) podi welavaka fail wenna puluwan. Meka fix karanna oyage
// LID eka methanin hoyaganna puluwan.
//
// USE KරAN VIDIYA:
//   1) Group ekakin (LID mostly group/community messages walata pennanne)
//      oyage number eken bot ekata ".myid" kiyala evanna.
//   2) Reply ekේ "LID" widihata enawa kiyala penunoth, e number eka copy
//      karala config.js eke OWNER_LID = "..." widihata paste karanna.
//   3) DM ekakin evala eka LID widihata nathnam, phone-number check ekම
//      hariyata wada karanawa kiyana eka — OWNER_LID ekak danna one nathi.

cmd({
    pattern: 'myid',
    alias: ['getlid', 'whoami'],
    react: '🆔',
    category: 'owner',
    desc: 'Show your raw sender ID / LID — use it to set OWNER_LID in config.js',
    filename: __filename
},
async (sock, mek, m, { reply, sender, senderNumber }) => {
    try {
        const participant = mek?.key?.participant || '';
        const remoteJid = mek?.key?.remoteJid || '';
        const rawSender = m?.sender || sender || '';

        const allIds = [rawSender, participant, remoteJid].filter(Boolean);
        const lidMatch = allIds.find(j => j.includes('@lid'));

        let txt = `🆔 *Your ID Info*\n\n`;
        txt += `• sender: \`${rawSender || '-'}\`\n`;
        txt += `• senderNumber: \`${senderNumber || '-'}\`\n`;
        txt += `• participant: \`${participant || '-'}\`\n`;
        txt += `• remoteJid: \`${remoteJid || '-'}\`\n\n`;

        if (lidMatch) {
            const lidNum = lidMatch.split('@')[0];
            txt += `✅ *LID hamba una!* config.js eke *OWNER_LID* ekata methana number eka danna:\n\`${lidNum}\``;
        } else {
            txt += `ℹ️ *Meka LID ekak nemei* — phone-number widihata (\`${senderNumber || '-'}\`) tamai enne.\n`;
            txt += `Meka DM ekakin nam, phone-number check ekම hariyata wada karanawa — OWNER_LID ekak danna one nathi.\n`;
            txt += `LID eka hoyaganna group/community ekakin \`.myid\` kiyala aye evala balanna.`;
        }

        return reply(txt);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
