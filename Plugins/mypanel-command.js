const mongoose = require('mongoose');
const { cmd } = require('../command');
const config = require('../config');

// Pair.js eke UserAuth model ekama — mongoose model name ekma nisa collection ekama share wenawa
const UserAuthSchema = new mongoose.Schema({
    sessionId: { type: String, unique: true, required: true },
    number: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const UserAuth = mongoose.models.UserAuth || mongoose.model('UserAuth', UserAuthSchema);

const PANEL_BASE_URL = process.env.PANEL_BASE_URL
    || config.PANEL_BASE_URL
    || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'https://<your-app>.up.railway.app');

cmd({
    pattern: "mypanel",
    alias: ["mypassword", "mypass"],
    desc: "Get your own settings-panel login link & password (owner only, private chat)",
    category: "main",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) return reply('👑 Owner Only — meka thamange own number ekenma witharai use karanna.');

        const ownNumber = conn.user.id.split(':')[0].split('@')[0];
        const sessionId = `dina_${ownNumber}`;

        const doc = await UserAuth.findOne({ sessionId });
        if (!doc) {
            return reply('⚠️ Password ekk generate wela nathi wagei. Restart karala pair karanna try karanna.');
        }

        await reply(
            `🔐 *Your DCT-MD Settings Panel*\n\n` +
            `Number: +${ownNumber}\n` +
            `Password: *${doc.password}*\n\n` +
            `${PANEL_BASE_URL}/mypanel\n\n` +
            `⚠️ Don't share this password with anyone.`
        );
    } catch (e) {
        console.error('mypanel command error:', e);
        reply('❌ Error occurred, try again.');
    }
});
