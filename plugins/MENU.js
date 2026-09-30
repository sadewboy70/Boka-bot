const config = require('../config');
const { cmd, commands } = require('../command');
const moment = require('moment-timezone');
const crypto = require('crypto');
const os = require('os');

// Random images list
const menuImages = [
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783328021/zanta_media_uploads/tnuazopka24oahpvh3mc.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783327996/zanta_media_uploads/vfq2mrf2hwkzhjerc3zz.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783327966/zanta_media_uploads/nca5y1t1fl5klruuxehp.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783328043/zanta_media_uploads/d0svlrulezrpif4mfl9w.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1780590033/zanta_media_uploads/dttqjshprca9zvqcpbwg.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783328053/zanta_media_uploads/mtifkjupz6kvdistsqit.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783332950/zanta_media_uploads/sxkybgfhhi5gtkqsns2z.jpg',
    'https://res.cloudinary.com/dqlh378fb/image/upload/v1783332958/zanta_media_uploads/yxtvp8zwoju8xsvghzr7.jpg'
];

// Helper to get runtime format
function formatUptime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    let dDisplay = d > 0 ? `${d}d ` : "";
    let hDisplay = h > 0 ? `${h}h ` : "";
    let mDisplay = m > 0 ? `${m}m ` : "";
    let sDisplay = s > 0 ? `${s}s` : "0s";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

// ── ALL COMMANDS, GROUPED INTO CATEGORIES ──
const categories = {
    "1": { title: "📥 DOWNLOAD MENU", items: ["tiktok", "fb", "song", "video", "ig", "yt", "ysprank", "sublk", "twitter", "xnxx", "xndl", "apk", "cinesubz", "cinesubz2", "play", "paper", "pdl", "gitclone", "movie", "thenkiri", "cartoon", "cinetv", "lyrics", "ytchannel", "ttsearch", "pinterest", "sitecode", "getdp", "imgurl", "steal"] },
    "2": { title: "🧠 AI COMMANDS", items: ["ai", "athal", "aiimg2", "translate", "img", "meta", "sticker", "toimg", "toaudio", "toptt", "anime0", "anime", "manga", "waifupic"] },
    "3": { title: "👥 GROUP MANAGE", items: ["kick", "kick2", "add", "del", "invite", "warn", "jid", "forward", "tagall", "setpp", "admins", "promote", "demote", "unmute", "open", "close", "mute", "revoke", "link", "grouplink", "setsubject", "setdesc", "groupinfo", "ginfo", "gstatus", "online", "poll", "vote", "presults", "pclose", "antilink"] },
    "4": { title: "⚙️ ADMIN MENU", items: ["save", "listsave", "broadcast", "block", "unblock", "blockall", "pp", "restart", "shutdown", "eval", "setvar", "getvar", "grouplist", "leave", "setname", "setbio", "botinfo", "clearchat", "getcontact", "anticall", "kickall", "settings", "mode", "autoreact", "autostatus", "autotyping", "antidelete", "welcome", "goodbye", "autoblock", "statusreply", "setprefix", "setlogo", "setalivemsg", "setwelcomemsg", "setgoodbyemsg", "setstatusreply", "blacklist", "areply"] },
    "5": { title: "🔧 TOOLS & EDITS", items: ["say", "repeat", "upper", "lower", "reverse", "length", "count", "b64enc", "b64dec", "binary", "hex", "md5", "sha1", "sha256", "sha384", "sha512", "md4", "ripemd", "hmac", "crc32", "urlenc", "urldec", "escape", "unescape", "jsonparse", "jsonstring", "base64url", "hexdump", "binarydump", "ascii", "charcode", "unicode", "random", "mock", "clap", "vowel", "leet", "fliptext", "space", "zalgo", "fancy", "lenny", "shrug", "removebg", "enhance", "colour", "timer", "remind", "note", "getnote", "delnote", "afk", "titlecase", "camelcase", "snakecase", "kebabcase", "removeemoji", "removenum", "removespace", "dupline", "sortline", "revline", "swapcase", "strikethru", "underline", "wide", "smallcaps", "bubble", "square", "mirror", "zigzag", "usee", "qr", "short", "password"] },
    "6": { title: "👑 OWNER AREA", items: ["owner", "system", "report", "whois", "srepo"] },
    "7": { title: "📁 OTHER CMDS", items: ["weather", "quran", "bible", "sqrt", "pow", "sin", "cos", "tan", "log", "ln", "abs", "ceil", "floor", "round", "gcd", "lcm", "prime", "fib", "avg", "sum", "min", "max", "epoch", "isotime", "utc", "timezone", "timezoneconv", "weekday", "month", "year", "leap", "daynum", "weeknum", "addday", "subday", "diffday", "timestamp", "countdown", "age", "daylight", "millis", "seconds"] },
    "8": { title: "🎵 SONG & MUSIC", items: ["song", "music", "mp3", "audio", "lyrics", "playlist"] },
    "9": { title: "🖼️ AI IMAGE MENU", items: ["dalle", "pixabay", "picsum", "flickr", "dog", "cat", "bingimg"] },
    "10": { title: "🎬 TV SERIES & MOVIES", items: ["cinesubz", "cinesubz2", "tv", "movielk", "moviepro", "sinhalasub", "kdrama", "sublk", "hanime", "cinesend", "bais"] }
};

function buildCategoryText(key, prefix) {
    const cat = categories[key];
    if (!cat) return "❌ Invalid Option";
    const lines = cat.items.map(c => ` ➲ ${prefix}${c}`).join("\n");
    return `
╭───❖《 ${cat.title} 》❖───
${lines}
╰───────────────────`;
}

cmd({
    pattern: "menu",
    react: "🚀",
    desc: "Interactive Bot Menu",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, pushname, prefix }) => {
    try {
        // Sri Lanka Date & Time Setup
        const slDate = moment().tz('Asia/Colombo').format('YYYY-MM-DD');
        const slTimeNow = moment().tz('Asia/Colombo').format('HH:mm:ss');
        
        const uptime = formatUptime(process.uptime());
        const totalCmds = commands.length;
        const randomImg = menuImages[Math.floor(Math.random() * menuImages.length)];
        const botName = config.BOT_NAME || "SADEW-MD-MINI";
        const mode = config.MODE || "public";

        const menuText = `┌──⟡ 🤖  ⟡ ꜱ ᴀ ᴅ ᴇ ᴡ - ᴍ ɪ ɴ ɪ ⟡  ⟡──
┊
┠⪼✿ ✦ 👤 𝙽𝙰𝙼𝙴   : ${pushname}
┠⪼✿ ✦ 🔖 𝙼𝙾𝙳𝙴   : ${mode}
┠⪼✿ ✦ 📅 𝙳𝙰𝚃𝙴   : ${slDate}
┠⪼✿ ✦ ⏰ 𝚃𝙸𝙼𝙴   : ${slTimeNow}
┠⪼✿ ✦ ⚡ 𝚄𝙿𝚃𝙸𝙼𝙴 : ${uptime}
┠⪼✿ ✦ 📦 𝙿𝙻𝚄𝙶𝙸𝙽𝚂: 𝙲𝙼𝙳 = ${totalCmds}
┠⪼✿ ✦ 🔰 𝙿𝚁𝙴𝙵𝙸𝚇 : ${prefix}
┊
└──⟡ ━━━━━━━━━━━━━━━━ ⟡
┏━━━━『 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝙸𝙴𝚂 』━━━━━
┣⪼ ❖ 1.  📥 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 𝙼𝙴𝙽𝚄
┣⪼ ❖ 2.  🧠 𝙰𝙸 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂
┣⪼ ❖ 3.  👥 𝙶𝚁𝙾𝚄𝙿 𝙼𝙰𝙽𝙰𝙶𝙴
┣⪼ ❖ 4.  ⚙️ 𝙰𝙳𝙼𝙸𝙽 𝙼𝙴𝙽𝚄
┣⪼ ❖ 5.  🔧 𝚃𝙾𝙾𝙻𝚂 & 𝙴𝙳𝙸𝚃𝚂
┣⪼ ❖ 6.  👑 𝙾𝚆𝙽𝙴𝚁 𝙰𝚁𝙴𝙰
┣⪼ ❖ 7.  📁 𝙾𝚃𝙷𝙴𝚁 𝙲𝙼𝙳𝚂
┣⪼ ❖ 8.  🎵 𝚂𝙾𝙽𝙶 & 𝙼𝚄𝚂𝙸𝙲
┣⪼ ❖ 9.  🖼️ 𝙰𝙸 𝙸𝙼𝙰𝙶𝙴 𝙼𝙴𝙽𝚄
┣⪼ ❖ 10. 🎬 𝚃𝚅 𝚂𝙴𝚁𝙸𝙴𝚂 & 𝙼𝙾𝚅𝙸𝙴𝚂
┗━━━━━━━━━━━━━━━━━━━━━━━━━
⊱ ─────── { 𑁍 } ─────── ⊰
╰┈⪼ 𝚁𝙴𝙿𝙻𝚈 𝚆𝙸𝚃𝙷 𝙰 𝙽𝚄𝙼𝙱𝙴𝚁 (1-10) 𝙾𝚁 𝚃𝙰𝙿 𝙰 𝙱𝚄𝚃𝚃𝙾𝙽 𝙱𝙴𝙻𝙾𝚆 ⪻
⊱ ─────── { 𑁍 } ─────── ⊰
╰┈⪼ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈🔮 ⟡ ꜱ ᴀ ᴅ ᴇ ᴡ - ᴍ ɪ ɴ ɪ ⟡ 🔮⪻
⊱ ─────── { 𑁍 } ─────── ⊰`;

        // 🟢 WEBVIEW/GEN-AI NATIVE BUTTON PAYLOAD GENERATION 🟢
        
        let buttonsHtml = "";
        
        // Generate Interactive Buttons for all 10 categories
        Object.entries(categories).forEach(([num, cat]) => {
            // A clean, simple button style for the webview that returns the category number
            buttonsHtml += `<div class=cr c="${num}"><b>${num}. ${cat.title.replace(/[^A-Za-z &]/g, '').trim()}</b><i>Tap to view commands</i><span>${num}</span></div>`;
        });

        const pC = "#ff1493"; // Pink Theme from your Webview
        const sC = "rgba(255,20,147,0.3)";
        const pS = "🔮"; 
        
        let particlesHtml = `<svg class="psvg">`;
        for (let i = 0; i < 8; i++) {
            let x = Math.random() * 90 + 5; 
            let delay = Math.random() * 10;
            let dur = Math.random() * 10 + 12;
            let sway = Math.random() * 8 + 4;
            let swayDur = dur / 3; 
            
            particlesHtml += `
            <text x="${x.toFixed(1)}%" y="-10%" font-size="22" text-anchor="middle">
                ${pS}
                <animate attributeName="y" values="-10%;110%" dur="${dur.toFixed(1)}s" begin="${delay.toFixed(1)}s" repeatCount="indefinite"/>
                <animate attributeName="x" values="${x.toFixed(1)}%;${(x+sway).toFixed(1)}%;${(x-sway).toFixed(1)}%;${x.toFixed(1)}%" dur="${swayDur.toFixed(1)}s" begin="${delay.toFixed(1)}s" repeatCount="indefinite"/>
            </text>`;
        }
        particlesHtml += `</svg>`;
        const svg = `<svg width="60" height="60" viewBox="0 0 100 100"><path d="M50 85 C 20 55, 10 30, 25 15 C 35 5, 50 20, 50 20 C 50 20, 65 5, 75 15 C 90 30, 80 55, 50 85 Z" fill="none" stroke="${pC}" stroke-width="3"><animateTransform attributeName="transform" type="scale" values="1; 1.05; 1" dur="1.5s" repeatCount="indefinite" additive="sum"/></path></svg>`;

        let finalHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"><style>*{margin:0;padding:0;box-sizing:border-box;font-family:sans-serif;-webkit-tap-highlight-color:transparent}body{background:#0d001a;color:#fff;overflow-x:hidden}.bg{position:fixed;inset:0;z-index:-1;background:radial-gradient(circle at 20% 30%,${sC} 0,transparent 50%),radial-gradient(circle at 80% 70%,${sC} 0,transparent 50%)}.psvg{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;opacity:0.6}.c{padding:10px;z-index:1}.h{text-align:center;margin-bottom:12px}.hi{display:flex;justify-content:center}.hi svg{animation:d 2s ease-in-out infinite alternate}@keyframes d{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-8px) scale(1.05)}}h1{font-size:20px;color:${pC};text-shadow:0 0 10px ${sC}}p{color:#8c9eff;font-size:11px}.cl{display:grid;grid-template-columns:1fr 1fr;gap:8px}.cr{display:flex;flex-direction:column;align-items:center;text-align:center;background:#fff1;border-bottom:2px solid ${pC};padding:10px 4px;border-radius:10px;gap:4px;z-index:1;position:relative}.cr:active{background:${sC}}b{font-size:13px}i{font-size:9px;color:#aaa;font-style:normal;line-height:1.2}span{background:#0009;padding:3px 8px;border-radius:4px;font-family:monospace;font-size:10px;color:${pC};border:1px solid #fff2;margin-top:2px}.f{text-align:center;color:#555;font-size:9px;padding:10px 0}.pop{position:fixed;background:${pC};color:#fff;padding:4px 8px;border-radius:10px;font-size:11px;font-weight:700;pointer-events:none;transition:.4s;z-index:9999}.pa{opacity:0;transform:translateY(-30px)}</style></head><body><div class=bg></div>${particlesHtml}<div class=c><div class=h><div class=hi>${svg}</div><h1>SADEW-MINI MENU</h1><p>Tap a category to send!</p></div><div class=cl id=cl>${buttonsHtml}</div></div><div class=f>SADEW X MINI</div><script>function cp(v,c){let e=document.createElement('textarea');e.value=c;document.body.appendChild(e);e.select();try{document.execCommand('copy')}catch(e){}e.remove();let p=document.createElement('div');p.innerText='Sending...';p.className='pop';p.style.left=(v.clientX-20)+'px';p.style.top=(v.clientY-20)+'px';document.body.appendChild(p);setTimeout(()=>p.classList.add('pa'),10);setTimeout(()=>p.remove(),400)}document.getElementById('cl').onclick=e=>{let t=e.target.closest('.cr');if(t)cp(e,t.getAttribute('c'))};</script></body></html>`;

        const randomResId = crypto.randomUUID(); 
        const randomBotResId = crypto.randomUUID();
        const unifiedDataJson = JSON.stringify({
            "response_id": randomResId,
            "sections": [{
                "view_model": {
                    "primitive": {
                        "__typename": "GenAIaeacdsnwHtmlPrimitive",
                        "payload": finalHtml,
                        "trusted_sources": ["wa.me", "whatsapp.com"]
                    },
                    "__typename": "GenAISingleLayoutViewModel"
                }
            }]
        });
        
        const unifiedData = Buffer.from(unifiedDataJson).toString('base64');
        const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
        
        let buttonMessage = generateWAMessageFromContent(from, {
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [{ messageType: 2, messageText: menuText }],
                        unifiedResponse: { data: unifiedData },
                        contextInfo: { 
                            forwardingScore: 1, 
                            isForwarded: true, 
                            forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" }, 
                            forwardOrigin: 4 
                        }
                    }
                }
            }
        }, { quoted: mek });

        buttonMessage.message.messageContextInfo = {
            deviceListMetadata: {}, deviceListMetadataVersion: 2,
            botMetadata: {
                messageDisclaimerText: "", botResponseId: randomBotResId,
                verificationMetadata: {
                    proofs: [{
                        version: 1, useCase: 1,
                        signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
                        certificateChain: [
                            "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg",
                            "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZLXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYbNBkuLoZnQAq4j8yRekrQ=="
                        ]
                    }]
                }
            }
        };

        // Send the Webview Menu Image & Buttons Message
        const sentMsg = await conn.relayMessage(from, buttonMessage.message, { messageId: buttonMessage.key.id });
        const messageID = buttonMessage.key.id;

        // Listener for number replies (e.g., when the user taps a webview button, it sends "1", "2" back)
        const listener = async ({ messages }) => {
            const replyMsg = messages[0];
            if (!replyMsg.message) return;

            const text = replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text;
            const replyId = replyMsg.message.extendedTextMessage?.contextInfo?.stanzaId;

            // Optional: You can either strictly require a reply to the exact menu message, 
            // or just listen for the number if you want. We'll stick to strictly replying:
            if (replyId !== messageID) return;

            const categoryNum = (text || "").trim();
            if (categories[categoryNum]) {
                const txt = buildCategoryText(categoryNum, prefix);
                const nextRandomImg = menuImages[Math.floor(Math.random() * menuImages.length)];

                await conn.sendMessage(from, {
                    image: { url: nextRandomImg },
                    caption: txt,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363395674230271@newsletter",
                            newsletterName: "SADEW - MD - MINI",
                            serverMessageId: 1
                        }
                    }
                }, { quoted: replyMsg });
            }
        };

        conn.ev.on("messages.upsert", listener);

    } catch (e) {
        console.log(e);
    }
});
