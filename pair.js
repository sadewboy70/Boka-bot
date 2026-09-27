const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const config = require('./config');
const axios = require('axios');
const mongoose = require('mongoose');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getContentType,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    downloadContentFromMessage,
    proto,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateForwardMessageContent,
    S_WHATSAPP_NET,
    Browsers
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { sms } = require('./lib/msg');
const NodeCache = require('node-cache');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;
// User ta WhatsApp eken evana panel link eke domain eka. config.js eke danna
// value eka priority (env eken override karanna one welawakata puluwan).
// RAILWAY_PUBLIC_DOMAIN auto-set unath fallback ekk widihata thiyenawa.
const PANEL_BASE_URL = process.env.PANEL_BASE_URL
    || config.PANEL_BASE_URL
    || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'https://<your-app>.up.railway.app');
const SESSION_BASE_PATH = './sessions';
const msgRetryCounterCache = new NodeCache();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('events').EventEmitter.defaultMaxListeners = 1000;

// ⚠️ MONGODB_URI ekk hama welawema .env / Railway Variables walin denna.
// Meke default value ekk denne na (kalin thibba URI eka wena kenekuge real credentials,
// use karanna epa — leaked keys wage save wela thibba).
// ⚠️ config.js eke MONGODB_URI ekk dala thiyenawnam eka use wenawa (env eken danapu
// eken override karanna puluwan onchance welawakama one nam).
const MONGODB_URI = process.env.MONGODB_URI || config.MONGODB_URI || '';
if (!MONGODB_URI) {
    console.log('⚠️ MONGODB_URI not set — set it in config.js or .env / Railway Variables before starting.');
}

// ── DATABASE CONNECTION & INDEX SYNC ──
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Hashu Mongodb 𝐂ᴏɴɴᴇᴄᴛᴇ Connected ✅ ');
        try {
            await UserSettings.syncIndexes();
            console.log('✅ User Settings Indexes Synced Successfully!');
        } catch (idxErr) {
            console.log('⚠️ Index sync update notice:', idxErr.message);
        }
    })
    .catch(err => console.log('❌ 𝐌ᴏɴɢᴏ𝐃𝐁 ᴇʀʀᴏ:', err));

// ── SESSION DATABASE SCHEMA ──
const SessionSchema = new mongoose.Schema({
    sessionId: String,
    data: Object
});
const Session = mongoose.model('Session', SessionSchema);

// ── USER SETTINGS DATABASE SCHEMA ──
const SettingsSchema = new mongoose.Schema({
    jid: { type: String, unique: true, required: true }, 
    PREFIX: { type: String, default: config.PREFIX || '.' },
    BOT_NAME: { type: String, default: config.BOT_NAME || 'DCT-MD-MINI-V6' },
    AUTO_REACT: { type: Boolean, default: config.AUTO_REACT || false },
    WORK_MODE: { type: String, default: 'public' }, 
    AUTO_READ_STATUS: { type: Boolean, default: config.AUTO_READ_STATUS || false },
    AUTO_TYPING: { type: Boolean, default: config.AUTO_TYPING || false },
    ALIVE_LOGO: { type: String, default: 'https://i.ibb.co/YBtjMpQx/1ed923b3376b.jpg' },
    ALIVE_MSG: { type: String, default: '' },
    ANTILINK: { type: Boolean, default: false },
    ANTIDELETE: { type: Boolean, default: false },
    WELCOME: { type: Boolean, default: false },
    GOODBYE: { type: Boolean, default: false },
    WELCOME_MSG: { type: String, default: '👋 Welcome @user to *@group* !' },
    GOODBYE_MSG: { type: String, default: '👋 @user left *@group* . Goodbye!' },
    AUTO_STATUS_REPLY: { type: Boolean, default: false },
    AUTO_STATUS_REPLY_TEXT: { type: String, default: 'Thanks for viewing my status! 🙏' },
    AUTO_REPLY: { type: Boolean, default: false },
    AUTO_REPLY_LIST: { type: Array, default: [] },
    AUTO_BLOCK: { type: Boolean, default: false },
    BLACKLIST: { type: [String], default: [] },
    ALWAYS_ONLINE: { type: Boolean, default: false }  // owner-only .alwaysonline on/off — default OFF for everyone
}, { id: false, autoIndex: true }); 

const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', SettingsSchema);

// ── NEWSLETTER (auto-follow / auto-react) SCHEMA ──
// ownerNumber + expiresAt eka "trial channel" walata witharak (admin dashboard eken
// specific user kenekge channel ekak 2-day trial ekakට add karana eka). Admin ge
// permanent/global channel (.setchannel command eken add karapu ewa) walata
// ownerNumber/expiresAt null widihata thiyenawa — eken never-expire wenawa.
const NewsletterSchema = new mongoose.Schema({
    jid: { type: String, unique: true, required: true },
    emojis: { type: [String], default: ['❤️', '🔥', '😎'] },
    addedAt: { type: Date, default: Date.now },
    ownerNumber: { type: String, default: null },   // trial channel eka kavuda kiyala (sanitized number)
    expiresAt: { type: Date, default: null }         // null = permanent, set = trial expiry time
});
const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);

// ── PER-USER DASHBOARD LOGIN (bot owner ge ownge settings witharak) ──
// Admin panel eken (ADMIN_KEY) hama session ekakma control karanna puluwan,
// meka eken user kenek ta thamange session eka witharak (thamange password ekkin) control karanna puluwan.
const UserAuthSchema = new mongoose.Schema({
    sessionId: { type: String, unique: true, required: true },
    number: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },      // null = unlimited/permanent access (existing users unaffected)
    expiryWarned: { type: Boolean, default: false } // "expiring soon" msg yaviila kiyala track karanna
});
const UserAuth = mongoose.models.UserAuth || mongoose.model('UserAuth', UserAuthSchema);

function generateUserPassword() {
    // 8 char alnum, mix karanawa (0/O, 1/I wage ehema wenas karanna amaru characters ain kara)
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    return pass;
}

async function getOrCreateUserPassword(sessionId, number) {
    let doc = await UserAuth.findOne({ sessionId });
    if (doc) return { password: doc.password, isNew: false };
    const password = generateUserPassword();
    doc = await UserAuth.create({ sessionId, number, password });
    return { password: doc.password, isNew: true };
}

// In-memory login tokens (session ekk close kaloth okkoma clear wenawa — ehema unath
// user ta ayeth login wela password ekma dala token ekk ganna puluwan, harima simple ekk)
const userTokens = new Map(); // token -> { sessionId, number, expiresAt }
const USER_TOKEN_TTL = 12 * 60 * 60 * 1000; // 12h

function issueUserToken(sessionId, number) {
    const token = generateUserPassword() + generateUserPassword();
    userTokens.set(token, { sessionId, number, expiresAt: Date.now() + USER_TOKEN_TTL });
    return token;
}

function requireUserToken(req, res, next) {
    const token = req.headers['x-user-token'] || req.query.token;
    const entry = token && userTokens.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
        return res.status(401).json({ success: false, error: 'Invalid or expired login. Please login again.' });
    }
    req.userSession = entry;
    next();
}

let newsletterCache = null;
let newsletterCacheAt = 0;
const NEWSLETTER_CACHE_TTL = 30000;

async function listNewslettersFromMongo() {
    try {
        if (newsletterCache && (Date.now() - newsletterCacheAt) < NEWSLETTER_CACHE_TTL) return newsletterCache;
        const rows = await Newsletter.find().lean();
        newsletterCache = rows;
        newsletterCacheAt = Date.now();
        return rows;
    } catch (e) {
        return [];
    }
}

async function addNewsletterToMongo(jid, emojis) {
    const update = { jid };
    if (emojis && emojis.length) update.emojis = emojis;
    await Newsletter.findOneAndUpdate({ jid }, update, { upsert: true, new: true });
    newsletterCache = null; // invalidate
}

async function removeNewsletterFromMongo(jid) {
    await Newsletter.deleteOne({ jid });
    newsletterCache = null;
}

const DEFAULT_TRIAL_DAYS = 2;

// Admin dashboard eken specific user kenekge channel ekak trial widihata add karanna
// (dawas 2k witharak follow/react wenawa, ithin auto-unfollow + delete wenawa).
async function addTrialNewsletterToMongo(jid, ownerNumber, days = DEFAULT_TRIAL_DAYS, emojis) {
    const sanitizedOwner = String(ownerNumber || '').replace(/[^0-9]/g, '');
    const trialDays = Number(days) > 0 ? Number(days) : DEFAULT_TRIAL_DAYS;
    const expiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    const update = { jid, ownerNumber: sanitizedOwner, expiresAt, addedAt: new Date() };
    if (emojis && emojis.length) update.emojis = emojis;
    const doc = await Newsletter.findOneAndUpdate({ jid }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    newsletterCache = null;
    return doc;
}

// Try to follow/unfollow a channel jid using whichever active bot socket is available —
// preferring the trial owner's own connected session if it's online.
async function withAnyActiveSocket(preferredSessionId, fn) {
    const sockets = Object.values(activeSockets);
    if (!sockets.length) return false;
    const preferred = preferredSessionId && activeSockets[preferredSessionId];
    const order = preferred ? [preferred, ...sockets.filter(s => s !== preferred)] : sockets;
    for (const sock of order) {
        try {
            await fn(sock);
            return true;
        } catch (e) { /* try next socket */ }
    }
    return false;
}

async function unfollowChannelJid(sock, jid) {
    if (sock.newsletterUnfollow) {
        await sock.newsletterUnfollow(jid);
    } else {
        await sock.query({
            tag: 'iq',
            attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'newsletter' },
            content: [{ tag: 'unfollow', attrs: { newsletter_jid: jid } }]
        });
    }
}

// ── TRIAL CHANNEL EXPIRY SWEEPER ──
// Piriya welawta (5 min ekakta parak) expire una trial channels okkoma check karala,
// e channel eka auto-unfollow karala Mongo eken delete karanawa. Meken bot eke speed
// eka bariyk wenne na — sweep eka background eke wenne, lightweight query ekak witharay.
async function sweepExpiredTrialNewsletters() {
    try {
        const expired = await Newsletter.find({ expiresAt: { $ne: null, $lte: new Date() } }).lean();
        if (!expired.length) return;

        for (const doc of expired) {
            const ownerSessionId = doc.ownerNumber ? `dina_${doc.ownerNumber}` : null;
            await withAnyActiveSocket(ownerSessionId, (sock) => unfollowChannelJid(sock, doc.jid));

            await Newsletter.deleteOne({ _id: doc._id });
            console.log(`⏳ Trial expired — unfollowed & removed channel: ${doc.jid} (owner: ${doc.ownerNumber || 'n/a'})`);

            if (ownerSessionId && activeSockets[ownerSessionId]) {
                try {
                    await activeSockets[ownerSessionId].sendMessage(doc.ownerNumber + '@s.whatsapp.net', {
                        text: `⏳ *Trial Ended*\n\nYour channel auto-follow/react trial for:\n\`${doc.jid}\`\n\nhas ended (2 days) and has been unfollowed. Contact the bot owner if you'd like to renew it.`
                    });
                } catch (e) { /* ignore delivery failures */ }
            }
        }
        newsletterCache = null;
    } catch (e) {
        console.error('❌ [Trial Sweep Error]:', e.message);
    }
}

const TRIAL_SWEEP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
setInterval(sweepExpiredTrialNewsletters, TRIAL_SWEEP_INTERVAL_MS);

// ── BOT ACCESS SUBSCRIPTION / RENEWAL SYSTEM ──
// UserAuth.expiresAt eken tamai kavda subscription ekak thiyenawada, eka kiyawelada
// kiyala manage wenne. expiresAt null nam = permanent access (renewal ekk one na).
async function isSubscriptionExpired(sessionId) {
    try {
        const auth = await UserAuth.findOne({ sessionId }).lean();
        if (!auth || !auth.expiresAt) return false; // no record or unlimited access
        return new Date(auth.expiresAt).getTime() <= Date.now();
    } catch (e) {
        return false;
    }
}

// Bot eke access eka pura kohomma logout karanawa (.setexpiry expire unama).
// UserAuth record eka delete karanne na — password eken mypanel ekata login welath
// "expired, renew karanna" msg eka penna ganna.
async function forceLogoutExpiredSession(sessionId, number) {
    const sessionPath = path.join(SESSION_BASE_PATH, sessionId);
    if (activeSockets[sessionId]) {
        try {
            await activeSockets[sessionId].sendMessage(number + '@s.whatsapp.net', {
                text: `⛔ *Subscription Expired*\n\nYour bot access has ended. The bot has been logged out.\nContact the bot owner to renew, then re-link your number.`
            });
        } catch (e) { /* delivery best-effort */ }
    }
    cleanupSession(sessionId, sessionPath);
    await Session.deleteOne({ sessionId }).catch(() => {});
    await fs.remove(sessionPath).catch(() => {});
}

async function sweepExpiredUserSubscriptions() {
    try {
        const now = Date.now();
        const soonCutoff = new Date(now + 24 * 60 * 60 * 1000); // 24h warning window

        // 1) Already expired — force logout + wipe session (keep UserAuth so they can still log in to mypanel and see the expired state).
        const expired = await UserAuth.find({ expiresAt: { $ne: null, $lte: new Date(now) } }).lean();
        for (const auth of expired) {
            await forceLogoutExpiredSession(auth.sessionId, auth.number);
            console.log(`⛔ Subscription expired — logged out & wiped session: ${auth.sessionId}`);
        }

        // 2) Expiring within 24h and not warned yet — send a heads-up once.
        const soon = await UserAuth.find({ expiresAt: { $ne: null, $gt: new Date(now), $lte: soonCutoff }, expiryWarned: { $ne: true } }).lean();
        for (const auth of soon) {
            if (activeSockets[auth.sessionId]) {
                try {
                    const hoursLeft = Math.max(1, Math.round((new Date(auth.expiresAt).getTime() - now) / 3600000));
                    await activeSockets[auth.sessionId].sendMessage(auth.number + '@s.whatsapp.net', {
                        text: `⏳ *Subscription Ending Soon*\n\nYour bot access ends in ~${hoursLeft}h. Contact the bot owner to renew and avoid losing access.`
                    });
                } catch (e) { /* delivery best-effort */ }
            }
            await UserAuth.updateOne({ sessionId: auth.sessionId }, { expiryWarned: true }).catch(() => {});
        }
    } catch (e) {
        console.error('❌ [Subscription Sweep Error]:', e.message);
    }
}

const SUBSCRIPTION_SWEEP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
setInterval(sweepExpiredUserSubscriptions, SUBSCRIPTION_SWEEP_INTERVAL_MS);

function getNewsletterEmojisSync(jid, list) {
    const row = list.find(n => n.jid === jid);
    return (row && row.emojis && row.emojis.length) ? row.emojis : ['❤️', '🔥', '😎'];
}

async function saveNewsletterReaction(jid, serverId, emoji, sanitizedNumber) {
    try {
        console.log(`[DB Log]: Reaction saved for ${jid} - ServerID: ${serverId} - Emoji: ${emoji}`);
    } catch (e) {
        console.error('Error saving newsletter reaction:', e);
    }
}

async function loadUserConfigFromMongo(jid) {
    jid = (jid.split('@')[0].split(':')[0]) + '@s.whatsapp.net';

    // Serve from cache first — this function used to run on EVERY incoming
    // message, which meant a MongoDB round-trip per message. That round-trip
    // latency was the main thing making the bot feel slow.
    const cached = settingsCache.get(jid);
    if (cached) return cached;

    try {
        let settings = await UserSettings.findOne({ jid });
        if (!settings) {
            settings = await UserSettings.create({ 
                jid: jid, 
                PREFIX: config.PREFIX || '.',
                BOT_NAME: config.BOT_NAME || 'DCT-MD-MINI-V6',
                AUTO_REACT: config.AUTO_REACT || false,
                WORK_MODE: 'public',
                AUTO_READ_STATUS: config.AUTO_READ_STATUS || false,
                AUTO_TYPING: config.AUTO_TYPING || false
            });
        }
        settingsCache.set(jid, settings);
        return settings;
    } catch (e) {
        console.error('Error loading settings from Mongo:', e);
        return { 
            PREFIX: config.PREFIX || '.', 
            BOT_NAME: config.BOT_NAME || 'DCT-MD-MINI-V6', 
            AUTO_REACT: config.AUTO_REACT || false,
            WORK_MODE: 'public',
            AUTO_READ_STATUS: config.AUTO_READ_STATUS || false,
            AUTO_TYPING: config.AUTO_TYPING || false,
            ANTILINK: false,
            ANTIDELETE: false,
            WELCOME: false,
            GOODBYE: false,
            WELCOME_MSG: '👋 Welcome @user to *@group* !',
            GOODBYE_MSG: '👋 @user left *@group* . Goodbye!',
            AUTO_STATUS_REPLY: false,
            AUTO_STATUS_REPLY_TEXT: 'Thanks for viewing my status! 🙏',
            AUTO_BLOCK: false,
            BLACKLIST: []
        };
    }
}

fs.readdirSync("./plugins/").forEach((plugin) => {
    if (path.extname(plugin).toLowerCase() == ".js") {
        require("./plugins/" + plugin);
    }
});
console.log('𝐀ʟʟ 𝐏ʟ𝐔𝐆𝐈𝐍𝐒 𝐈𝐍𝐒𝐓𝐀ʟʟ𝐄𝐃 ⚡');

const events = require('./command');

const commandMap = new Map();
for (const cmd of events.commands) {
    if (cmd.pattern) commandMap.set(cmd.pattern, cmd);
    if (cmd.alias) {
        for (const alias of cmd.alias) {
            if (!commandMap.has(alias)) commandMap.set(alias, cmd);
        }
    }
}

app.use(express.static(path.join(__dirname, 'public')));

const activeSockets = {};
const keepAliveTimers = {};
const reconnectTimers = {};
// sessionId -> Map(chatJid -> {jid, name, lastMsg, ts, unread}) — bot connect wela
// inna account ekේ "recent chats" panel ekේ pennanna use wenne. RAM ekema
// thiyenne (Mongo ekata save karanne na), server restart una nam clear wenawa
// — passe messages enakota aye populate wenawa.
const sessionChats = {};

const fileCache = {};
const saveDebounceTimers = {};
// sessionId methanata dammoth, saveSession() eyata write karanne na — delete
// endpoint eken permanent widihata ain karapu session ekak, background save
// process ekak eken aye Mongo ekata resurrect wenna epa kiyala.
const permanentlyDeletedSessions = new Set();
const msgTextCache = new NodeCache({ stdTTL: 60 * 30 });

// ── PERFORMANCE CACHES ──
// Avoids hitting MongoDB / WhatsApp servers on every single message.
const settingsCache = new NodeCache({ stdTTL: 30, useClones: false });      // per-user settings
// plugins/*.js walata (SETTING.js wage) mema cache eka reach karanna baha (module scope
// wenas nisa) — e nisa global ekakata expose karanawa. .autoreply / .setting / toggle
// commands walin settings save kalath ITHAMA WELAWATA reflect wenna meka one (30s wait
// karanna one na).
global.settingsCache = settingsCache;
const groupMetaCache = new NodeCache({ stdTTL: 60 * 5, useClones: false }); // per-group metadata

// Tracks reconnect attempts per session so we can back off instead of
// hammering WhatsApp / the process every few seconds (this is what was
// causing the crash-loop in the Railway logs).
const reconnectAttempts = {};
const MAX_RECONNECT_DELAY = 60000; // cap at 60s
const MAX_STARTUP_CONCURRENCY = 5; // how many sessions to restore in parallel on boot (needs ~4GB+ RAM for 50 sessions)

// permanent=true kiyanne "meka forever delete karanawa" kiyana eka — e nisa pending
// save ekak thibbath eka run karanne na (nathnam delete karapu piyasata passe eka
// Mongo ekata mail-back wela session eka "zombie" widihata aye pennanawa, aka
// "aduragන්න බෑ" bug eka). Reconnect/temporary cleanup walata witharai save eka
// awashya (permanent=false, default).
function cleanupSession(sessionId, sessionPath = null, permanent = false) {
    if (keepAliveTimers[sessionId]) {
        clearInterval(keepAliveTimers[sessionId]);
        delete keepAliveTimers[sessionId];
    }
    if (reconnectTimers[sessionId]) {
        clearTimeout(reconnectTimers[sessionId]);
        delete reconnectTimers[sessionId];
    }
    if (saveDebounceTimers[sessionId]) {
        clearTimeout(saveDebounceTimers[sessionId]);
        delete saveDebounceTimers[sessionId];
        if (sessionPath && !permanent) saveSession(sessionId, sessionPath).catch(() => {});
    }
    // Block any save that might already be in-flight from landing after a permanent delete
    if (permanent) permanentlyDeletedSessions.add(sessionId);
    const sock = activeSockets[sessionId];
    if (sock) {
        try {
            sock.ev.removeAllListeners();
            sock.ws?.terminate?.();
        } catch (e) {}
        delete activeSockets[sessionId];
    }
}

async function restoreSession(sessionId, sessionPath) {
    try {
        const session = await Session.findOne({ sessionId });
        if (!session) return false;
        await fs.ensureDir(sessionPath);
        for (const file in session.data) {
            await fs.writeFile(path.join(sessionPath, file), session.data[file]);
        }
        console.log('✅ 𝐑𝐄𝐒𝐓𝐎𝐑𝐄:', sessionId);
        return true;
    } catch (err) {
        console.error('𝐑𝐄𝐒𝐓𝐎𝐑𝐄 error:', err);
        return false;
    }
}

async function saveSession(sessionId, sessionPath) {
    try {
        if (permanentlyDeletedSessions.has(sessionId)) return;
        if (!fs.existsSync(sessionPath)) return;
        const files = await fs.readdir(sessionPath);
        let data = {};
        let hasChanges = false;

        for (const file of files) {
            try {
                const content = await fs.readFile(path.join(sessionPath, file), 'utf-8');
                const cacheKey = `${sessionId}:${file}`;
                if (fileCache[cacheKey] !== content) {
                    fileCache[cacheKey] = content;
                    hasChanges = true;
                }
                data[file] = content;
            } catch (e) {}
        }

        if (!hasChanges) return;

        await Session.findOneAndUpdate({ sessionId }, { data }, { upsert: true });
        console.log('💾 𝐒𝐀𝐕𝐄𝐃:', sessionId);
    } catch (err) {
        console.error('𝐒𝐀𝐕𝐄SES𝐒𝐈𝐎𝐍 error:', err);
    }
}

function debouncedSaveSession(sessionId, sessionPath) {
    if (saveDebounceTimers[sessionId]) {
        clearTimeout(saveDebounceTimers[sessionId]);
    }
    saveDebounceTimers[sessionId] = setTimeout(async () => {
        delete saveDebounceTimers[sessionId];
        await saveSession(sessionId, sessionPath);
    }, 2000);
}

// ── GLOBAL REACTION EMITTER HELPER FOR CHANNELS ──
async function handleChannelReaction(sock, remoteJid, serverId) {
    if (!remoteJid || !serverId) return;
    const newsEmojis = ['❤️', '👍', '😮', '😎', '💀', '💫', '🔥', '👑'];
    const emoji = newsEmojis[Math.floor(Math.random() * newsEmojis.length)];
    try {
        await sock.query({
            tag: 'message',
            attrs: { to: remoteJid, type: 'reaction', id: serverId.toString() },
            content: [{ tag: 'reaction', attrs: { text: emoji } }]
        });
        if (sock.newsletterReactMessage) {
            await sock.newsletterReactMessage(remoteJid, serverId.toString(), emoji).catch(() => {});
        }
    } catch (_) {}
}

// ── YOUR CUSTOM NEWSLETTER HANDLER FUNCTION ──
async function setupNewsletterHandlers(socket, sanitizedNumber) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages || messages.length === 0) return;

        const message = messages[0];
        if (!message || !message.key || !message.key.remoteJid) return;

        const jid = message.key.remoteJid;

        if (jid.endsWith('@newsletter')) {
            try {
                const followedDocs = await listNewslettersFromMongo();
                const followedJids = followedDocs.map(d => d.jid);
                const isFollowed = followedJids.includes(jid) || (config.NEWSLETTER_JID && config.NEWSLETTER_JID.includes(jid)) || jid === "120363395674230271@newsletter";
                
                if (!isFollowed) return;

                const emojis = getNewsletterEmojisSync(jid, followedDocs);
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                
                const serverId = message.newsletterServerId || 
                                 message.message?.newsletterServerId || 
                                 message.key?.server_id ||
                                 message.key?.id;

                if (!serverId) {
                    console.warn('⚡ [Newsletter Handler]: Waiting for server_id initialization.');
                    return;
                }

                setTimeout(async () => {
                    try {
                        console.log(`[Newsletter] Authorized JID detected. Reacting to ${jid} with ${randomEmoji}`);
                        
                        if (typeof socket.newsletterReactMessage === 'function') {
                            await socket.newsletterReactMessage(
                                jid,
                                serverId.toString(),
                                randomEmoji
                            );
                        } else {
                            await socket.sendMessage(jid, { react: { text: randomEmoji, key: message.key } });
                        }

                        await saveNewsletterReaction(jid, serverId, randomEmoji, sanitizedNumber || null);
                        console.log(`✅ Reacted to ${jid} with ${randomEmoji}`);

                    } catch (err) {
                        console.error('❌ React failed:', err.message);
                    }
                }, 3000);

            } catch (err) {
                console.error('❌ [Newsletter Global Handler Error]:', err);
            }
        }
    });
}

async function Pair(number, res = null) {
    const xnumber = number.replace(/[^0-9]/g, '');
    const sessionId = `dina_${xnumber}`;
    const sessionPath = path.join(SESSION_BASE_PATH, sessionId);
    permanentlyDeletedSessions.delete(sessionId); // number ekak aye pair karanawnam, block eka ain karanna

    if (activeSockets[sessionId]) {
        console.log('𝐒ocket already active for:', sessionId);
        if (res && !res.headersSent) res.json({ error: 'Session already active. Please wait.' });
        return;
    }

    try {
        const credsPath = path.join(sessionPath, 'creds.json');
        if (!fs.existsSync(credsPath)) {
            await restoreSession(sessionId, sessionPath);
        }
        await fs.ensureDir(sessionPath);

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        const logger = pino({ level: 'silent' });

        const sock = makeWASocket({
            version,
            logger,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 30000,
            keepAliveIntervalMs: 30000,
            msgRetryCounterCache,
            mobile: false,
            browser: Browsers.ubuntu('Chrome')
        });

        activeSockets[sessionId] = sock;

        // Call the newly added newsletter function right after connection registration setup
        await setupNewsletterHandlers(sock, xnumber);

        sock.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
            const r = await axios.head(url);
            const mime = r.headers['content-type'];
            if (mime.split("/")[1] === "gif")
                return sock.sendMessage(jid, { video: await getBuffer(url), caption, gifPlayback: true, ...options }, { quoted });
            if (mime === "application/pdf")
                return sock.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption, ...options }, { quoted });
            if (mime.split("/")[0] === "image")
                return sock.sendMessage(jid, { image: await getBuffer(url), caption, ...options }, { quoted });
            if (mime.split("/")[0] === "video")
                return sock.sendMessage(jid, { video: await getBuffer(url), caption, mimetype: 'video/mp4', ...options }, { quoted });
            if (mime.split("/")[0] === "audio")
                return sock.sendMessage(jid, { audio: await getBuffer(url), caption, mimetype: 'audio/mpeg', ...options }, { quoted });
        };

        sock.edite = async (gg, newmg, from) => {
            await sock.relayMessage(from, {
                protocolMessage: { key: gg.key, type: 14, editedMessage: { conversation: newmg } }
            }, {});
        };

        sock.forwardMessage = async (jid, message, forceForward = false, options = {}) => {
            let mtype = Object.keys(message.message)[0];
            let content = await generateForwardMessageContent(message, forceForward);
            let ctype = Object.keys(content)[0];
            let context = mtype !== "conversation" ? message.message[mtype].contextInfo : {};
            content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo };
            const waMessage = await generateWAMessageFromContent(jid, content, options ? {
                ...content[ctype], ...options,
                ...(options.contextInfo ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } } : {})
            } : {});
            await sock.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
            return waMessage;
        };

        let pairingCode = null;
        let responded = false;

        if (!sock.authState.creds.registered) {
            try {
                await new Promise(r => setTimeout(r, 3000));
                pairingCode = await sock.requestPairingCode(xnumber);
                console.log(' Pairing Code:', pairingCode);
                if (res && !res.headersSent) { res.json({ code: pairingCode }); responded = true; }
            } catch (pairErr) {
                console.error('Pairing code request failed:', pairErr);
                if (res && !res.headersSent) { res.json({ error: 'Failed to generate pairing code. Try again.' }); responded = true; }
                cleanupSession(sessionId, sessionPath);
                return;
            }
        } else {
            console.log('Already registered:', sessionId);
            if (res && !res.headersSent) { res.json({ error: 'This number is already paired.' }); responded = true; }
        }

        if (res && !responded) {
            setTimeout(() => {
                if (!res.headersSent) res.json({ error: 'Pairing timed out. Try again.' });
            }, 15000);
        }

        sock.ev.on('creds.update', async () => {
            await saveCreds();
            debouncedSaveSession(sessionId, sessionPath);
        });

        // ── 100% WORKING LOW-LEVEL NODE LISTENER FOR CHANNEL POSTS ──
        sock.ws.on('CB:message', async (node) => {
            try {
                const targetChannel = "120363395674230271@newsletter";
                if (node.attrs && node.attrs.from === targetChannel) {
                    const messageNode = node.content?.[0];
                    if (messageNode && messageNode.attrs && messageNode.attrs.id) {
                        const serverId = messageNode.attrs.id;
                        await handleChannelReaction(sock, targetChannel, serverId);
                    }
                }
            } catch (_) {}
        });

        sock.ev.on('group-participants.update', async (gu) => {
            try {
                groupMetaCache.del(gu.id); // membership changed, force a fresh fetch next time
                const botNumber2 = await jidNormalizedUser(sock.user.id);
                const settings = await loadUserConfigFromMongo(botNumber2);
                if (!settings.WELCOME && !settings.GOODBYE) return;

                const groupMetadata = await sock.groupMetadata(gu.id).catch(() => null);
                const groupName = groupMetadata?.subject || 'this group';

                for (const participant of gu.participants) {
                    const userTag = '@' + participant.split('@')[0];
                    if (gu.action === 'add' && settings.WELCOME) {
                        const text = (settings.WELCOME_MSG || '👋 Welcome @user to *@group* !')
                            .replace('@user', userTag).replace('@group', groupName);
                        await sock.sendMessage(gu.id, { text, mentions: [participant] }).catch(() => {});
                    } else if (gu.action === 'remove' && settings.GOODBYE) {
                        const text = (settings.GOODBYE_MSG || '👋 @user left *@group* . Goodbye!')
                            .replace('@user', userTag).replace('@group', groupName);
                        await sock.sendMessage(gu.id, { text, mentions: [participant] }).catch(() => {});
                    }
                }
            } catch (e) {
                console.error('[WELCOME/GOODBYE ERROR]', e.message);
            }
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const isLoggedOut = statusCode === DisconnectReason.loggedOut;
                console.log(`Disconnected: ${sessionId} | Code: ${statusCode}`);
                
                cleanupSession(sessionId, sessionPath);
                
                if (!isLoggedOut) {
                    // Exponential backoff with a cap, instead of a fixed 8s retry.
                    // A fixed short retry means if a session keeps failing
                    // (e.g. banned / conflict / network issue) it retries every
                    // 8s forever, which is what was spiking memory/CPU and
                    // getting the whole process OOM-killed by Railway.
                    const attempt = (reconnectAttempts[sessionId] || 0) + 1;
                    reconnectAttempts[sessionId] = attempt;
                    const delay = Math.min(8000 * Math.pow(2, attempt - 1), MAX_RECONNECT_DELAY);

                    console.log(`Reconnecting: ${sessionId} (attempt ${attempt}, in ${delay}ms)`);
                    if (reconnectTimers[sessionId]) clearTimeout(reconnectTimers[sessionId]);
                    reconnectTimers[sessionId] = setTimeout(() => Pair(number), delay);
                } else {
                    console.log('Logged out:', sessionId);
                    delete reconnectAttempts[sessionId];
                    await Session.findOneAndDelete({ sessionId });
                    await fs.remove(sessionPath).catch(() => {});
                }
            } else if (connection === 'open') {
                console.log('✅ 𝐂onnected:', sessionId);
                delete reconnectAttempts[sessionId]; // back off resets once stable

                await saveSession(sessionId, sessionPath);

                try {
                    const { password, isNew } = await getOrCreateUserPassword(sessionId, xnumber);
                    if (isNew) {
                        const ownJid = xnumber + '@s.whatsapp.net';
                        const panelMsg = `🔐 *Your DCT-MD Settings Panel*\n\n` +
                            `Number: +${xnumber}\n` +
                            `Password: *${password}*\n\n` +
                            `Use this to change *your own bot's* settings (yours only, not anyone else's):\n` +
                            `${PANEL_BASE_URL}/mypanel\n\n` +
                            `⚠️ Don't share this password. Keep it safe — you'll need it every time you log in.`;
                        await sock.sendMessage(ownJid, { text: panelMsg }).catch(() => {});
                    }
                } catch (err) {
                    console.log('ℹ️ User-panel password send skipped:', err.message);
                }

                try {
                    const groupInviteCode = "Ca4P95ujEFzFqVnldt3GaF";
                    const groupJid = await sock.groupGetInviteInfo(groupInviteCode).catch(() => null);
                    if (groupJid) {
                        const joined = await sock.groupMetadata(groupJid.id).catch(() => null);
                        const alreadyIn = joined?.participants?.some(p => p.id === (xnumber + '@s.whatsapp.net'));
                        if (!alreadyIn) {
                            await sock.groupAcceptInvite(groupInviteCode);
                            console.log('✅ Successfully Auto-Joined Group!');
                        } else {
                            console.log('ℹ️ Already in group, skip join.');
                        }
                    }
                } catch (err) {
                    console.log('ℹ️ Auto-Join skipped:', err.message);
                }

                try {
                    const configuredNewsletters = await listNewslettersFromMongo();
                    const channelJids = configuredNewsletters.length
                        ? configuredNewsletters.map(n => n.jid)
                        : ["120363395674230271@newsletter"]; // fallback: official channel if none configured yet

                    for (const channelJid of channelJids) {
                        try {
                            const channelMeta = await sock.newsletterMetadata('jid', channelJid).catch(() => null);
                            const alreadyFollowing = channelMeta?.viewerMeta?.role === 'SUBSCRIBER';
                            if (!alreadyFollowing) {
                                if (sock.newsletterFollow) {
                                    await sock.newsletterFollow(channelJid);
                                } else {
                                    await sock.query({
                                        tag: 'iq',
                                        attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'newsletter' },
                                        content: [{ tag: 'follow', attrs: { newsletter_jid: channelJid } }]
                                    });
                                }
                                console.log(`✅ Auto-Followed Channel: ${channelJid}`);
                            }
                        } catch (err) {
                            console.log(`ℹ️ Auto-Follow skipped for ${channelJid}:`, err.message);
                        }
                    }
                } catch (err) {
                    console.log('ℹ️ Auto-Follow batch skipped:', err.message);
                }

                if (keepAliveTimers[sessionId]) clearInterval(keepAliveTimers[sessionId]);
                keepAliveTimers[sessionId] = setInterval(async () => {
                    if (!activeSockets[sessionId]) {
                        clearInterval(keepAliveTimers[sessionId]);
                        delete keepAliveTimers[sessionId];
                        return;
                    }

                    // .alwaysonline eka off nam (default OFF), bot eka "online" widiyata
                    // hama welavakma penna one na — eth connection health check eka
                    // (reconnect detection) still therenna one, e nisa presence type
                    // eka witharak wenas karanawa, interval eka nawathinne na.
                    let showOnline = false;
                    try {
                        const jid = xnumber + '@s.whatsapp.net';
                        const settings = await loadUserConfigFromMongo(jid);
                        showOnline = !!(settings && settings.ALWAYS_ONLINE);
                    } catch (e) { /* setting load fail una nam, default off widiyatama danawa */ }

                    sock.sendPresenceUpdate(showOnline ? 'available' : 'unavailable', sock.user.id).catch(() => {
                        console.log('Keep-alive failed:', sessionId);
                        cleanupSession(sessionId, sessionPath);
                        const attempt = (reconnectAttempts[sessionId] || 0) + 1;
                        reconnectAttempts[sessionId] = attempt;
                        const delay = Math.min(8000 * Math.pow(2, attempt - 1), MAX_RECONNECT_DELAY);
                        if (reconnectTimers[sessionId]) clearTimeout(reconnectTimers[sessionId]);
                        reconnectTimers[sessionId] = setTimeout(() => Pair(number), delay);
                    });
                }, 45000);

                try {
                    const jid = xnumber + '@s.whatsapp.net';
                    await sock.sendMessage(jid, {
                        text: `*Bot Active!*\n\nYour bot is now connected successfully.\nPairing code used: *${pairingCode ?? 'Already registered'}*`
                    });
                } catch (e) {
                    console.error('Welcome message failed:', e);
                }
            }
        });

        sock.ev.on('messages.upsert', async (mek) => {
            try {
                // --- Recent chats cache (for /api/session/:number/chats panel) ---
                try {
                    const cm = mek.messages[0];
                    const cJid = cm?.key?.remoteJid;
                    if (cJid && cJid !== 'status@broadcast') {
                        if (!sessionChats[sessionId]) sessionChats[sessionId] = new Map();
                        const chatMap = sessionChats[sessionId];
                        const body = cm.message?.conversation
                            || cm.message?.extendedTextMessage?.text
                            || (cm.message?.imageMessage ? '📷 Photo' : '')
                            || (cm.message?.videoMessage ? '🎥 Video' : '')
                            || (cm.message?.audioMessage ? '🎵 Audio' : '')
                            || (cm.message?.stickerMessage ? '🩹 Sticker' : '')
                            || (cm.message ? '📎 Media' : '');
                        chatMap.set(cJid, {
                            jid: cJid,
                            isGroup: cJid.endsWith('@g.us'),
                            name: cm.pushName || chatMap.get(cJid)?.name || cJid.split('@')[0],
                            lastMsg: (body || '').slice(0, 80),
                            fromMe: !!cm.key.fromMe,
                            ts: Date.now()
                        });
                        // Cap at 60 most-recent chats so memory doesn't grow forever
                        if (chatMap.size > 60) {
                            const oldestKey = [...chatMap.entries()].sort((a, b) => a[1].ts - b[1].ts)[0][0];
                            chatMap.delete(oldestKey);
                        }
                    }
                } catch (_) {}

                // NOTE: channel/newsletter auto-react eka dan sampurnayenma dynamic —
                // balanna setupNewsletterHandlers() eka (Mongo Newsletter collection eken
                // driven wenawa, .setchannel/.delchannel walin manage karanna puluwan).
                // Kalin methana thibba hardcoded single-JID fallback eka ain kala —
                // eka dynamic system ekath samaga duplicate react ekk create karapu nisa.

                // 2. Owner Number Auto-React — mesej ekak owner number eken (group ekaka
                // wunath, DM ekaka wunath) awoth, AUTO_REACT setting eka off wela hri 100%
                // guaranteed react wenna one. Kalin thibbe hardcode kරla thibba number ekak
                // witharak (94713457207), e nisa wena kenek deploy kalama withrk wuna na —
                // dan config.OWNER_NUMBER + main admin number ekt check karanawa.
                //
                // BUG FIX: self-bot ekaka owner ge WhatsApp number ekma tamai bot ge number
                // eka. Owner phone eken message ekak yawwoth eka "fromMe: true" widiyata
                // enawa — e welawe `key.participant`/`key.remoteJid` eken "sender" eka hoyanna
                // giyoth eke hitiye e chat eke wena kenekuge number eka (chat partner ge),
                // owner ge number eka NEMEI. E nisa `!fromMe` requirement eka react eka
                // sampurnayenma block karapu, dan eka fix kala.
                const firstMsg = mek.messages[0];
                // ⚠️ SECURITY FIX: kalin methana wena kenekuge number ekak ('94715865463')
                // hardcode karala thibba, e number ekata hama bot ekakatama guaranteed
                // owner-react ekk dunna. Eka ain kala — dan config.OWNER_NUMBER eka
                // witharai owner widihata treat wenne (ownerta witharai full control).
                const ownerReactConfigNum = (config.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
                const ownerReactConfigLid = (config.OWNER_LID || '').replace(/[^0-9]/g, '');
                const ownerReactBotNum = (sock.user?.id || '').split('@')[0].split(':')[0];

                let ownerReactSenderNum;
                if (firstMsg?.key?.fromMe) {
                    // Self-bot eke fromMe:true tamai owner ge own message eka
                    ownerReactSenderNum = ownerReactBotNum;
                } else {
                    const ownerReactSenderJid = firstMsg?.key?.participant || firstMsg?.key?.remoteJid;
                    ownerReactSenderNum = (ownerReactSenderJid || '').split('@')[0];
                }

                const isOwnerReactSender = !!ownerReactSenderNum && (
                    (!!ownerReactConfigNum && ownerReactSenderNum === ownerReactConfigNum) ||
                    (!!ownerReactConfigLid && ownerReactSenderNum === ownerReactConfigLid)
                );

                if (firstMsg?.key && isOwnerReactSender) {
                    try {
                        const ownerReactEmoji = config.OWNER_REACT_EMOJI || '👨‍💻';
                        await sock.sendMessage(firstMsg.key.remoteJid, {
                            react: { text: ownerReactEmoji, key: firstMsg.key }
                        });
                    } catch (_) {}
                }

                mek = mek.messages[0];
                if (!mek.message) return;

                const botNumber2 = await jidNormalizedUser(sock.user.id);
                const currentSettings = await loadUserConfigFromMongo(botNumber2);

                const prefix     = currentSettings.PREFIX || '.';
                const botName    = currentSettings.BOT_NAME || 'DCT-MD-MINI-V6';
                const autoReact  = currentSettings.AUTO_REACT;
                const workMode   = currentSettings.WORK_MODE || 'public';
                const autoTyping = currentSettings.AUTO_TYPING;

                const ctypeNow = getContentType(mek.message);
                if (ctypeNow === 'protocolMessage' && mek.message.protocolMessage?.type === 0) {
                    if (currentSettings.ANTIDELETE) {
                        const deletedId = mek.message.protocolMessage.key?.id;
                        const cached = deletedId ? msgTextCache.get(deletedId) : null;
                        if (cached) {
                            try {
                                await sock.sendMessage(mek.key.remoteJid, {
                                    text: `🗑️ *Anti-Delete*\n\n👤 @${cached.sender.split('@')[0]}\n💬 ${cached.text || '[Media/Non-text message]'}`,
                                    mentions: [cached.sender]
                                });
                            } catch (e) {}
                        }
                    }
                    return;
                } else {
                    try {
                        const cacheBody =
                            mek.message.conversation ||
                            mek.message.extendedTextMessage?.text ||
                            mek.message.imageMessage?.caption ||
                            mek.message.videoMessage?.caption || '';
                        if (mek.key?.id && !mek.key.fromMe) {
                            msgTextCache.set(mek.key.id, {
                                text: cacheBody,
                                sender: mek.key.participant || mek.key.remoteJid
                            });
                        }
                    } catch (e) {}
                }
           
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    if (currentSettings.AUTO_READ_STATUS) {
                        await sock.readMessages([mek.key]);
                    }
                    if (autoReact) {
                        await sock.sendMessage(mek.key.remoteJid, {
                            react: { text: '❤️', key: mek.key }
                        });
                    }
                    return;
                }

                const m            = sms(sock, mek);
                const type         = getContentType(mek.message);
                const from         = mek.key.remoteJid;

                const body = (() => {
                    if (type === 'conversation') return mek.message.conversation || '';
                    if (type === 'extendedTextMessage') return mek.message.extendedTextMessage?.text || '';
                    if (type === 'imageMessage') return mek.message.imageMessage?.caption || '';
                    if (type === 'videoMessage') return mek.message.videoMessage?.caption || '';
                    if (type === 'documentMessage') return mek.message.documentMessage?.caption || '';
                    if (type === 'buttonsResponseMessage') return mek.message.buttonsResponseMessage?.selectedButtonId || '';
                    if (type === 'templateButtonReplyMessage') return mek.message.templateButtonReplyMessage?.selectedId || '';
                    if (type === 'interactiveResponseMessage') {
                        try { return JSON.parse(mek.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson)?.id || ''; }
                        catch { return ''; }
                    }
                    return m.text || m.msg?.text || m.msg?.conversation || m.msg?.caption || '';
                })();

                const sender = mek.key.fromMe
                    ? (sock.user.id.split(':')[0] + '@s.whatsapp.net')
                    : (mek.key.participant || mek.key.remoteJid);

                const isCmd        = body.startsWith(prefix);
                const command      = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
                const args         = body.trim().split(/ +/).slice(1);
                const q            = args.join(' ');
                const isGroup      = from.endsWith('@g.us');
                const senderNumber = sender.split('@')[0];
                const botNumber    = sock.user.id.split(':')[0];
                const pushname     = mek.pushName || 'User';
                const isMe         = botNumber.includes(senderNumber);
                const configOwner  = (config.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
                const configOwnerLid = (config.OWNER_LID || '').replace(/[^0-9]/g, '');

                // isOwner eka: (1) bot eke session ekma owner karana number eka (xnumber),
                // (2) config.OWNER_NUMBER — meka danna nam, e number ekata *hama* deploy
                // karapu session ekakama* full owner command access + guaranteed react
                // ekk thiyenawa (multi-bot udanma control karanna), (3) config.OWNER_LID —
                // WhatsApp aluth accounts @lid widihata sender eka evana nisa, phone
                // number eken witharak check kalama owner commands samahara welawata
                // fail wenawa — LID eka danna nam eka backup widihata check wenawa.
                // Wena kisima hardcoded "backdoor" number ekak dan nathi — ownership
                // 100% oyage OWNER_NUMBER/OWNER_LID ekata witharai.
                const isOwner      = isMe || (xnumber === senderNumber) || (configOwner && configOwner === senderNumber) || (configOwnerLid && configOwnerLid === senderNumber);
                
                const isReact      = m.message?.reactionMessage ? true : false;
                const quoted       = type === 'extendedTextMessage' &&
                    mek.message.extendedTextMessage.contextInfo != null
                    ? mek.message.extendedTextMessage.contextInfo.quotedMessage || []
                    : [];

                // Cache group metadata instead of fetching it from WhatsApp on
                // every single message — this was adding real latency to
                // every group message and is a common source of rate-limit
                // related disconnects when a group is active.
                let groupMetadata = isGroup ? groupMetaCache.get(from) : null;
                if (isGroup && !groupMetadata) {
                    groupMetadata = await sock.groupMetadata(from).catch(() => null);
                    if (groupMetadata) groupMetaCache.set(from, groupMetadata);
                }
                const groupName     = isGroup && groupMetadata ? groupMetadata.subject : '';
                const participants  = isGroup && groupMetadata ? groupMetadata.participants : [];
                const groupAdmins   = isGroup ? getGroupAdmins(participants) : [];
                const isBotAdmins   = isGroup ? groupAdmins.includes(botNumber2) : false;
                const isAdmins      = isGroup ? groupAdmins.includes(sender) : false;
                const isSudo        = false;

                if (currentSettings.AUTO_BLOCK && !isOwner && (currentSettings.BLACKLIST || []).includes(senderNumber)) {
                    try { await sock.updateBlockStatus(sender, 'block'); } catch (e) {}
                    return;
                }

                if (isGroup && currentSettings.ANTILINK && !isOwner && !isAdmins) {
                    const linkRegex = /(chat\.whatsapp\.com\/|https?:\/\/[^\s]+)/i;
                    if (linkRegex.test(body) && isBotAdmins) {
                        try {
                            await sock.sendMessage(from, { delete: mek.key });
                            await sock.sendMessage(from, {
                                text: `🚫 @${senderNumber} links group/linksඑවන්න බෑ! Message remove කළා.`,
                                mentions: [sender]
                            });
                        } catch (e) {}
                        return;
                    }
                }

                if (!isGroup && !isCmd && !isMe && !isOwner && currentSettings.AUTO_STATUS_REPLY && body) {
                    try {
                        await sock.sendMessage(from, { text: currentSettings.AUTO_STATUS_REPLY_TEXT || 'Thanks for messaging! 🙏' }, { quoted: mek });
                    } catch (e) {}
                }

                // 💬 Auto Reply (keyword based) — prefix ekak nathuwama trigger wenawa,
                // group ekaka wunath DM ekaka wunath (uda: "hi" dunnama "hii" reply wenawa).
                // Owner ekt .autoreply add/del/on/off walin manage karanna puluwan.
                // NOTE: `isMe` check ain kala — self-bot ekaka owner ge own message ekath
                // "fromMe: true" widiyata enawa nisa, eka exclude kaloth owner ge trigger
                // ekakma react wenne nathi wela thibba (report unu bug eka meka).
                if (!isCmd && currentSettings.AUTO_REPLY && Array.isArray(currentSettings.AUTO_REPLY_LIST) && currentSettings.AUTO_REPLY_LIST.length && body) {
                    try {
                        const cleanBody = body.trim().toLowerCase();
                        const hit = currentSettings.AUTO_REPLY_LIST.find(p => p && p.trigger && p.trigger.toLowerCase() === cleanBody);
                        if (hit) {
                            if (currentSettings.AUTO_TYPING) {
                                await sock.sendPresenceUpdate('composing', from).catch(() => {});
                                await new Promise(r => setTimeout(r, 500));
                            }
                            await sock.sendMessage(from, { text: hit.response }, { quoted: mek });
                        }
                    } catch (e) {}
                }

                const isPre         = false;

                const reply = async (teks) =>
                    await sock.sendMessage(from, { text: teks }, { quoted: mek });

                if (isCmd) await sock.readMessages([mek.key]);

                if (workMode === 'private' && !isOwner) return;
                if (workMode === 'groups' && !isGroup) return;

                if (autoReact && !isMe && !isReact && Math.random() < 0.3) {
                    const emojis = config.REACT_EMOJIS || ['❤️', '👍', '🔥', '😂'];
                    sock.sendMessage(from, {
                        react: {
                            text: emojis[Math.floor(Math.random() * emojis.length)],
                            key: mek.key
                        }
                    }).catch(() => {});
                }

                if (autoTyping) {
                    sock.sendPresenceUpdate('composing', from).catch(() => {});
                    setTimeout(() => sock.sendPresenceUpdate('paused', from).catch(() => {}), 3000);
                }

                const cmdName = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : false;

                if (isCmd) {
                    const cmd = commandMap.get(cmdName);
                    if (cmd) {
                        if (cmd.react) sock.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                        try {
                            cmd.function(sock, mek, m, {
                                from, prefix, isSudo, quoted, body, isCmd, isPre,
                                command, args, q, isGroup, sender, senderNumber,
                                botNumber2, botNumber, pushname, isMe, isOwner,
                                groupMetadata, groupName, participants,
                                groupAdmins, isBotAdmins, isAdmins, reply,
                                botName  
                            });
                        } catch (e) {
                            console.error('[PLUGIN ERROR]', e);
                        }
                    }
                }

                for (const cmd of events.commands) {
                    try {
                        if (body && cmd.on === 'body') {
                            cmd.function(sock, mek, m, {
                                from, prefix, quoted, body, isSudo, isCmd,
                                command, args, q, isPre, isGroup, sender, senderNumber,
                                botNumber2, botNumber, pushname, isMe, isOwner,
                                groupMetadata, groupName, participants,
                                groupAdmins, isBotAdmins, isAdmins, reply
                            });
                        } else if (mek.q && cmd.on === 'text') {
                            cmd.function(sock, mek, m, {
                                from, quoted, body, isSudo, isCmd, isPre,
                                command, args, q, isGroup, sender, senderNumber,
                                botNumber2, botNumber, pushname, isMe, isOwner,
                                groupMetadata, groupName, participants,
                                groupAdmins, isBotAdmins, isAdmins, reply
                            });
                        } else if ((cmd.on === 'image' || cmd.on === 'photo') && type === 'imageMessage') {
                            cmd.function(sock, mek, m, {
                                from, prefix, quoted, isSudo, body, isCmd,
                                command, isPre, args, q, isGroup, sender, senderNumber,
                                botNumber2, botNumber, pushname, isMe, isOwner,
                                groupMetadata, groupName, participants,
                                groupAdmins, isBotAdmins, isAdmins, reply
                            });
                        } else if (cmd.on === 'sticker' && type === 'stickerMessage') {
                            cmd.function(sock, mek, m, {
                                from, prefix, quoted, isSudo, body, isCmd,
                                command, args, isPre, q, isGroup, sender, senderNumber,
                                botNumber2, botNumber, pushname, isMe, isOwner,
                                groupMetadata, groupName, participants,
                                groupAdmins, isBotAdmins, isAdmins, reply
                            });
                        }
                    } catch (e) {
                        console.error('[CMD MAP ERROR]', e);
                    }
                }

                switch (command) {
                    case 'jid':
                        reply(from);
                        break;

                    case 'ev': {
                        if (isOwner) {
                            try {
                                let result = await eval(q);
                                reply(util.format(result));
                            } catch (err) {
                                reply(util.format(err));
                            }
                        }
                        break;
                    }

                    case 'prefix': {
                        try {
                            if (!isOwner) return reply('❌ *You are not owner*');
                            const newPrefix = args[0];
                            if (!newPrefix) return await reply('❌ *Please provide a prefix!*\n\nExample: .prefix !');
                            if (newPrefix.length > 1) return await reply('❌ *Prefix must be a single character!*');
                            
                            currentSettings.PREFIX = newPrefix;
                            await currentSettings.save();
                            settingsCache.del(botNumber2);
                            
                            await reply(`✅ *PREFIX UPDATED*\n\nNew Prefix: *${newPrefix}*\n\nUse ${newPrefix} before commands.`);
                        } catch (e) { 
                            console.error('prefix error:', e); 
                            await reply('❌ Error updating prefix.'); 
                        }
                        break;
                    }

                    default:
                        break;
                }

            } catch (e) {
                console.error('[MESSAGE ERROR]', String(e));
            }
        });

    } catch (err) {
        console.error('Pair Error:', err);
        cleanupSession(sessionId, sessionPath);
        if (res && !res.headersSent) res.json({ error: 'Pair failed: ' + err.message });
    }
}

async function restoreAllSessions() {
    try {
        const sessions = await Session.find();
        console.log(`Restoring ${sessions.length} session(s)...`);

        // Restore in small batches instead of "start all of them, just
        // staggered by 2s each". With many sessions the old approach still
        // meant every socket ended up alive in memory within a couple of
        // minutes of boot, which is exactly when Railway's free/trial RAM
        // limit gets hit and the process gets Killed. Batching keeps peak
        // memory during startup lower.
        for (let i = 0; i < sessions.length; i += MAX_STARTUP_CONCURRENCY) {
            const batch = sessions.slice(i, i + MAX_STARTUP_CONCURRENCY);
            await Promise.all(batch.map(async (s) => {
                if (!s.sessionId) return;
                const number = s.sessionId.replace('dina_', '');
                try {
                    if (await isSubscriptionExpired(s.sessionId)) {
                        console.log(`⛔ Skipping restore — subscription expired: ${s.sessionId}`);
                        await forceLogoutExpiredSession(s.sessionId, number);
                        return;
                    }
                    await Pair(number);
                } catch (err) {
                    console.error('Failed to restore session', s.sessionId, err);
                }
            }));
            if (i + MAX_STARTUP_CONCURRENCY < sessions.length) {
                await new Promise(r => setTimeout(r, 4000)); // breathing room between batches
            }
        }
    } catch (err) {
        console.error('restoreAllSessions error:', err);
    }
}

app.get('/pair', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.json({ error: 'Number required' });
    res.setTimeout(35000, () => {
        if (!res.headersSent) res.json({ error: 'Request timed out. Try again.' });
    });
    await Pair(number, res);
});

// ── DASHBOARD ADMIN KEY ──
// Dashboard/adminpanel eken session delete/reconfigure karanna puluwan nisa,
// key ekk nathuwa kawruth access karanna denne na. .env / Railway Variables
// walin ADMIN_KEY ekk danna (nathnam dashboard eka wada karanne na).
// ⚠️ config.js eke ADMIN_KEY eka priority (env eken override karanna one welawakata puluwan).
// Default eka "HASHUU" — deployed public karanawnam config.js eke value eka change karanna.
const ADMIN_KEY = process.env.ADMIN_KEY || config.ADMIN_KEY || '';
function requireAdminKey(req, res, next) {
    if (!ADMIN_KEY) {
        return res.status(503).json({ success: false, error: 'ADMIN_KEY not configured on the server. Set it in .env / Railway Variables first.' });
    }
    const provided = req.headers['x-admin-key'] || req.query.key;
    if (provided !== ADMIN_KEY) {
        return res.status(401).json({ success: false, error: 'Invalid or missing admin key' });
    }
    next();
}

app.get('/active', (req, res) => {
    const activeSessions = Object.keys(activeSockets);
    const activeNumbers = activeSessions.map(id => id.replace('dina_', ''));

    res.json({
        success: true,
        total_active_bots: activeNumbers.length,
        active_numbers: activeNumbers
    });
});

// ──────────────────────────────────────────────
// DASHBOARD / ADMIN-PANEL API
// (public/dashboard.html + public/adminpanel.html walin call karanne)
// ──────────────────────────────────────────────

function numberToJid(number) {
    const clean = String(number).replace(/[^0-9]/g, '');
    return clean + '@s.whatsapp.net';
}

// hama session ekkma (connected + disconnected) — Mongo eke save wela thiyena okkoma
app.get('/api/sessions/list', requireAdminKey, async (req, res) => {
    try {
        const sessions = await Session.find({}, { sessionId: 1, updatedAt: 1 }).lean();
        const auths = await UserAuth.find({}, { sessionId: 1, expiresAt: 1 }).lean();
        const expiryMap = new Map(auths.map(a => [a.sessionId, a.expiresAt]));
        const list = sessions.map(s => {
            const number = (s.sessionId || '').replace('dina_', '');
            return {
                number,
                sessionId: s.sessionId,
                connected: !!activeSockets[s.sessionId],
                expiresAt: expiryMap.get(s.sessionId) || null
            };
        });
        res.json({ success: true, total: list.length, sessions: list });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Alias — dashboard eke naming ekata match wenna
app.get('/api/active', requireAdminKey, (req, res) => {
    const activeNumbers = Object.keys(activeSockets).map(id => id.replace('dina_', ''));
    res.json({ success: true, total_active_bots: activeNumbers.length, active_numbers: activeNumbers });
});

// Number ekaka settings ganna
app.get('/api/config', requireAdminKey, async (req, res) => {
    const { number } = req.query;
    if (!number) return res.status(400).json({ success: false, error: 'number required' });
    try {
        const jid = numberToJid(number);
        const settings = await loadUserConfigFromMongo(jid);
        res.json({ success: true, number, config: settings });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Number ekaka settings ewa update karanna (partial update — dunna keys witharai wenas wenne)
app.post('/api/config', requireAdminKey, async (req, res) => {
    const { number, config: newConfig } = req.body;
    if (!number || !newConfig) return res.status(400).json({ success: false, error: 'number and config required' });
    try {
        const jid = numberToJid(number);
        await UserSettings.findOneAndUpdate({ jid }, { $set: newConfig }, { upsert: true, new: true });
        settingsCache.del(jid);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Session ekk delete karanna (disconnect + Mongo + local session folder ain karanawa)
app.post('/api/session/delete', requireAdminKey, async (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ success: false, error: 'number required' });
    try {
        const sanitized = String(number).replace(/[^0-9]/g, '');
        const sessionId = `dina_${sanitized}`;
        const sessionPath = path.join(SESSION_BASE_PATH, sessionId);
        cleanupSession(sessionId, sessionPath, true); // permanent = true, blocks any pending/late save
        await Session.deleteOne({ sessionId });
        await fs.remove(sessionPath).catch(() => {});
        reconnectAttempts[sessionId] = 0;
        delete reconnectAttempts[sessionId];
        res.json({ success: true, message: `Session ${sanitized} deleted` });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Session ekk force-reconnect karanna
app.post('/api/session/force-reconnect', requireAdminKey, async (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ success: false, error: 'number required' });
    try {
        const sanitized = String(number).replace(/[^0-9]/g, '');
        const sessionId = `dina_${sanitized}`;
        const sessionPath = path.join(SESSION_BASE_PATH, sessionId);
        cleanupSession(sessionId, sessionPath);
        await Pair(sanitized);
        res.json({ success: true, message: `Reconnecting ${sanitized}...` });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Mongo eke save wela thiyena okkoma numbers reconnect karanna (restart nathuwama)
// Server stats — dashboard eke widget ekakata
app.get('/api/stats', requireAdminKey, async (req, res) => {
    try {
        const mem = process.memoryUsage();
        const totalSessions = await Session.countDocuments();
        res.json({
            success: true,
            active: Object.keys(activeSockets).length,
            total: totalSessions,
            uptimeSeconds: Math.floor(process.uptime()),
            memory: {
                rssMB: Math.round(mem.rss / 1024 / 1024),
                heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024)
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Admin eken hama connected number ekakatama (thamange own WhatsApp DM ekata) broadcast ekk
app.post('/api/broadcast', requireAdminKey, async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'message required' });
    try {
        const sessionIds = Object.keys(activeSockets);
        let sent = 0, failed = 0;
        for (const sessionId of sessionIds) {
            try {
                const sock = activeSockets[sessionId];
                const ownJid = sessionId.replace('dina_', '') + '@s.whatsapp.net';
                await sock.sendMessage(ownJid, { text: message });
                sent++;
            } catch (_) { failed++; }
            await new Promise(r => setTimeout(r, 300)); // rate-limit karanawa, WhatsApp ta spam wage penenna epa
        }
        res.json({ success: true, sent, failed, total: sessionIds.length });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// User ge mypanel password eka reset karanawa — aluth ekk generate karala WhatsApp DM ekatama evanawa
app.post('/api/session/reset-password', requireAdminKey, async (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ success: false, error: 'number required' });
    try {
        const sanitized = String(number).replace(/[^0-9]/g, '');
        const sessionId = `dina_${sanitized}`;
        const newPassword = generateUserPassword();
        await UserAuth.findOneAndUpdate({ sessionId }, { sessionId, number: sanitized, password: newPassword }, { upsert: true });

        const sock = activeSockets[sessionId];
        if (sock) {
            const ownJid = sanitized + '@s.whatsapp.net';
            await sock.sendMessage(ownJid, {
                text: `🔐 *Your DCT-MD panel password was reset by admin.*\n\nNew password: *${newPassword}*\n\n${PANEL_BASE_URL}/mypanel`
            }).catch(() => {});
        }
        res.json({ success: true, password: newPassword, delivered: !!sock });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── BOT ACCESS SUBSCRIPTION (trial/renewal for the WHOLE bot session) ──
// Admin ekata number ekakge access eka X dawasakට set/extend karanna puluwan.
// unlimited:true dunoth expiry eka clear karanawa (permanent access).
app.post('/api/session/set-expiry', requireAdminKey, async (req, res) => {
    const { number, days, unlimited } = req.body;
    if (!number) return res.status(400).json({ success: false, error: 'number required' });
    try {
        const sanitized = String(number).replace(/[^0-9]/g, '');
        const sessionId = `dina_${sanitized}`;

        let expiresAt = null;
        if (!unlimited) {
            const d = Number(days);
            if (!d || d <= 0) return res.status(400).json({ success: false, error: 'days must be > 0 (or pass unlimited:true)' });
            expiresAt = new Date(Date.now() + d * 24 * 60 * 60 * 1000);
        }

        const auth = await UserAuth.findOneAndUpdate(
            { sessionId },
            { $set: { sessionId, number: sanitized, expiresAt, expiryWarned: false }, $setOnInsert: { password: generateUserPassword() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const sock = activeSockets[sessionId];
        if (sock) {
            const text = unlimited
                ? `✅ *Your bot access is now unlimited.* No renewal needed.`
                : `✅ *Your bot access has been renewed!*\n\nActive until: ${expiresAt.toLocaleString()}`;
            await sock.sendMessage(sanitized + '@s.whatsapp.net', { text }).catch(() => {});
        }

        res.json({ success: true, sessionId, expiresAt: auth.expiresAt });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/connect-all', requireAdminKey, async (req, res) => {
    try {
        restoreAllSessions(); // background eke run wenawa, response ekata balaporottu wenne na
        res.json({ success: true, message: 'Reconnecting all saved sessions in the background...' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── Newsletter (auto-follow/react) management ──
app.get('/api/newsletters', requireAdminKey, async (req, res) => {
    try {
        const list = await Newsletter.find().lean();
        res.json({ success: true, newsletters: list });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/newsletters/add', requireAdminKey, async (req, res) => {
    const { jid, emojis } = req.body;
    if (!jid || !jid.endsWith('@newsletter')) {
        return res.status(400).json({ success: false, error: 'Valid newsletter jid required (ends with @newsletter)' });
    }
    try {
        await addNewsletterToMongo(jid, Array.isArray(emojis) && emojis.length ? emojis : undefined);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/newsletters/remove', requireAdminKey, async (req, res) => {
    const { jid } = req.body;
    if (!jid) return res.status(400).json({ success: false, error: 'jid required' });
    try {
        await removeNewsletterFromMongo(jid);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── TRIAL CHANNEL (2-day auto-follow/react for a specific user's own channel) ──
// Owner witharak (admin key) meken channel ekak add karanna puluwan — user ta
// thamange channel eka thaman add karanna beha, methanin witharay.
app.post('/api/newsletters/add-trial', requireAdminKey, async (req, res) => {
    const { input, ownerNumber, days } = req.body;
    if (!input || !String(input).trim()) return res.status(400).json({ success: false, error: 'Channel link/jid required (input)' });
    if (!ownerNumber || !String(ownerNumber).replace(/[^0-9]/g, '')) {
        return res.status(400).json({ success: false, error: 'ownerNumber required (the user this trial belongs to)' });
    }
    try {
        const raw = String(input).trim();
        let channelJid = null;

        if (/whatsapp\.com\/channel\//i.test(raw)) {
            const inviteId = raw.match(/channel\/([\w-]+)/)?.[1];
            // Use any active socket to resolve the invite link to a real jid.
            let resolved = null;
            const sockets = Object.values(activeSockets);
            for (const sock of sockets) {
                resolved = await sock.newsletterMetadata('invite', inviteId).catch(() => null);
                if (resolved?.id) break;
            }
            channelJid = resolved?.id || null;
        } else if (/@newsletter$/i.test(raw)) {
            channelJid = raw;
        } else if (/^\d{12,}$/.test(raw)) {
            channelJid = `${raw}@newsletter`;
        }

        if (!channelJid) return res.status(400).json({ success: false, error: 'Invalid channel link/jid, or no active bot session available to resolve the invite link' });

        const sanitizedOwner = String(ownerNumber).replace(/[^0-9]/g, '');
        const doc = await addTrialNewsletterToMongo(channelJid, sanitizedOwner, days);

        // Follow it immediately using the owner's own session if online, else any active session.
        const ownerSessionId = `dina_${sanitizedOwner}`;
        await withAnyActiveSocket(ownerSessionId, (sock) => sock.newsletterFollow(channelJid));

        res.json({ success: true, jid: channelJid, ownerNumber: sanitizedOwner, expiresAt: doc.expiresAt });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── USER SELF-SERVICE PANEL (thamange session ekama witharak) ──
app.post('/api/user/login', async (req, res) => {
    const { number, password } = req.body;
    if (!number || !password) return res.status(400).json({ success: false, error: 'number and password required' });
    try {
        const sanitized = String(number).replace(/[^0-9]/g, '');
        const sessionId = `dina_${sanitized}`;
        const doc = await UserAuth.findOne({ sessionId });
        if (!doc || doc.password !== password) {
            return res.status(401).json({ success: false, error: 'Wrong number or password' });
        }
        const token = issueUserToken(sessionId, sanitized);
        res.json({ success: true, token, number: sanitized });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/user/config', requireUserToken, async (req, res) => {
    try {
        const jid = numberToJid(req.userSession.number);
        const settings = await loadUserConfigFromMongo(jid);
        const auth = await UserAuth.findOne({ sessionId: req.userSession.sessionId }).lean();
        const expiresAt = auth ? auth.expiresAt : null;
        const msRemaining = expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : null;
        res.json({
            success: true,
            number: req.userSession.number,
            connected: !!activeSockets[req.userSession.sessionId],
            config: settings,
            subscription: { expiresAt, msRemaining, expired: expiresAt ? msRemaining === 0 : false }
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/user/config', requireUserToken, async (req, res) => {
    const { config: newConfig } = req.body;
    if (!newConfig) return res.status(400).json({ success: false, error: 'config required' });
    try {
        const jid = numberToJid(req.userSession.number);
        await UserSettings.findOneAndUpdate({ jid }, { $set: newConfig }, { upsert: true, new: true });
        settingsCache.del(jid);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ⚠️ OWNER/ADMIN ONLY — mypanel (per-user) eken ain karala methanata gena, dashboard
// ADMIN_KEY ekම require karanawa. Admin ekata *ona session ekakම* number ekක dila
// balanna puluwan (public/chats.html eken use wenne).
app.get('/api/admin/chats', requireAdminKey, async (req, res) => {
    try {
        const number = String(req.query.number || '').replace(/[^0-9]/g, '');
        if (!number) return res.status(400).json({ success: false, error: 'number required' });
        const sessionId = `dina_${number}`;
        const sock = activeSockets[sessionId];
        if (!sock) return res.status(409).json({ success: false, error: 'Meka session eka connect wela nathi (offline).' });

        // Groups — Baileys eken directly, live data (store ekak awashya na)
        let groups = [];
        try {
            const groupMap = await sock.groupFetchAllParticipating();
            groups = Object.values(groupMap || {}).map(g => ({
                jid: g.id,
                name: g.subject || g.id.split('@')[0],
                participants: (g.participants || []).length,
                isAdmin: (g.participants || []).some(p => p.id === sock.user?.id?.split(':')[0] + '@s.whatsapp.net' && (p.admin === 'admin' || p.admin === 'superadmin'))
            })).sort((a, b) => b.participants - a.participants);
        } catch (e) {
            console.error('groupFetchAllParticipating failed:', sessionId, e.message);
        }

        // Recent chats — in-memory cache populated as messages come in (see messages.upsert)
        const chatMap = sessionChats[sessionId];
        const chats = chatMap
            ? [...chatMap.values()].sort((a, b) => b.ts - a.ts).slice(0, 40)
            : [];

        res.json({ success: true, groups, groupCount: groups.length, chats, chatCount: chats.length });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Simple per-session rate limit for admin-sent messages, spam/abuse walin bandapu widiyata
const sendRateLimiter = {};

// Admin ekata ona session ekaka group ekakට/contact ekakට message ekak evanna.
app.post('/api/admin/send-message', requireAdminKey, async (req, res) => {
    try {
        const number = String(req.body?.number || '').replace(/[^0-9]/g, '');
        if (!number) return res.status(400).json({ success: false, error: 'number required' });
        const sessionId = `dina_${number}`;
        const sock = activeSockets[sessionId];
        if (!sock) return res.status(409).json({ success: false, error: 'Meka session eka offline — connect wela nathi.' });

        const { jid, text } = req.body || {};
        if (!jid || typeof jid !== 'string') return res.status(400).json({ success: false, error: 'jid required' });
        if (!text || typeof text !== 'string' || !text.trim()) return res.status(400).json({ success: false, error: 'Message text required' });
        if (text.length > 2000) return res.status(400).json({ success: false, error: 'Message too long (max 2000 chars)' });
        if (!jid.endsWith('@g.us') && !jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@lid')) {
            return res.status(400).json({ success: false, error: 'Invalid jid' });
        }

        // Rate limit: max 20 sent messages/minute per session (spam prevent karanna)
        const now = Date.now();
        const bucket = (sendRateLimiter[sessionId] = (sendRateLimiter[sessionId] || []).filter(t => now - t < 60000));
        if (bucket.length >= 20) {
            return res.status(429).json({ success: false, error: 'Rate limit — minute ekaka message 20ක witharai evanna puluwan.' });
        }
        bucket.push(now);

        await sock.sendMessage(jid, { text: text.trim() });

        // Local cache eka update karanna, panel eke udanma penenna
        if (sessionChats[sessionId]) {
            const existing = sessionChats[sessionId].get(jid) || { jid, isGroup: jid.endsWith('@g.us'), name: jid.split('@')[0] };
            sessionChats[sessionId].set(jid, { ...existing, lastMsg: text.trim().slice(0, 80), fromMe: true, ts: Date.now() });
        }

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// kiyala check karanna (login karapu number ekata witharak, wena kenekge ewa penenne na).
app.get('/api/user/channel-trial', requireUserToken, async (req, res) => {
    try {
        const number = req.userSession.number;
        const docs = await Newsletter.find({ ownerNumber: number }).lean();
        const now = Date.now();
        const channels = docs.map(d => {
            const expiresAtMs = d.expiresAt ? new Date(d.expiresAt).getTime() : null;
            const msRemaining = expiresAtMs ? Math.max(0, expiresAtMs - now) : null;
            return {
                jid: d.jid,
                addedAt: d.addedAt,
                expiresAt: d.expiresAt,
                msRemaining,
                expired: expiresAtMs ? msRemaining === 0 : false
            };
        });
        res.json({ success: true, channels });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/mypanel', (req, res) => res.sendFile(path.join(__dirname, 'public', 'mypanel.html')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/chats', (req, res) => res.sendFile(path.join(__dirname, 'public', 'chats.html')));

const keepAliveServer = () => {
    setInterval(() => {
        axios.get(`http://localhost:${PORT}/`).catch(() => {});
    }, 60000); 
};

// ── MEMORY MONITOR ──
// At 50 sessions, memory creeping up silently is what leads to a surprise
// Killed a few hours/days later. This logs usage every 5 min so it's
// visible in Railway logs before it becomes a crash.
const memoryMonitor = () => {
    setInterval(() => {
        const mem = process.memoryUsage();
        const rssMB = Math.round(mem.rss / 1024 / 1024);
        const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
        console.log(`📊 Memory: RSS ${rssMB}MB | Heap ${heapMB}MB | Active sessions: ${Object.keys(activeSockets).length}`);
    }, 5 * 60 * 1000);
};

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await fs.ensureDir(SESSION_BASE_PATH);
    await restoreAllSessions();
    keepAliveServer();
    memoryMonitor();
});

process.on('uncaughtException', (err) => {
    const e = String(err);
    if (e.includes('Socket connection timeout') || e.includes('rate-overlimit') || e.includes('Connection Closed') || e.includes('Value not found') || e.includes('timed out')) return;
    console.log('Caught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {});

// ── GRACEFUL SHUTDOWN ──
// Railway sends SIGTERM before a redeploy/restart (this is different from
// the SIGKILL "Killed" you get from an OOM). If sessions don't get flushed
// to Mongo before exit, a redeploy can corrupt auth state and force
// re-pairing. This gives it a few seconds to save everything first.
let shuttingDown = false;
async function gracefulShutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, saving ${Object.keys(activeSockets).length} session(s) before exit...`);

    const sessionIds = Object.keys(activeSockets);
    await Promise.all(sessionIds.map(async (sessionId) => {
        try {
            const sessionPath = path.join(SESSION_BASE_PATH, sessionId);
            await saveSession(sessionId, sessionPath);
        } catch (e) {}
    }));

    console.log('✅ All sessions saved, exiting.');
    process.exit(0);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
