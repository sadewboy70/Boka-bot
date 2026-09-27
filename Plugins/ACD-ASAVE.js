const { cmd } = require('../command');
const axios = require("axios");

// මෙතන ඔයාගේ විස්තර දාන්න
const GIST_ID = "7c0c715651a947ca7322ed55d4792e34"; 
const GITHUB_TOKEN = "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"; // මෙතනට ඔයාගේ Token එක දාන්න

// 1. .save Command
cmd({
    pattern: "save",
    desc: "Save user to GitHub Gist DB",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    if (!m.quoted) return reply("❌ කෙනෙක්ව Reply කරලා .save <session_name> දෙන්න.");
    const sessionName = args[0] || "default";
    const userJid = m.quoted.sender;

    try {
        // Gist එකෙන් පරණ දත්ත ගන්නවා
        const { data: gist } = await axios.get(`https://api.github.com/gists/${GIST_ID}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        
        let db = JSON.parse(gist.files['db.json'].content);
        
        // අලුත් දත්ත එකතු කරනවා
        db.push({ jid: userJid, session: sessionName, date: new Date().toLocaleDateString() });

        // GitHub එකට update කරනවා
        await axios.patch(`https://api.github.com/gists/${GIST_ID}`, {
            files: { 'db.json': { content: JSON.stringify(db, null, 2) } }
        }, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });

        reply(`✅ ${userJid.split('@')[0]} සාර්ථකව GitHub Gist එකේ save විය!`);
    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});

// 2. .listsave Command
cmd({
    pattern: "listsave",
    desc: "List saved users from Gist",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const { data: gist } = await axios.get(`https://api.github.com/gists/${GIST_ID}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        
        const db = JSON.parse(gist.files['db.json'].content);
        if (db.length === 0) return reply("❌ තවම කිසිම කෙනෙක් save කරලා නැහැ!");

        let listText = "┏━━━━━━━━━━━━━━━━━━━━┓\n┃ ✨ *𝐆𝐈𝐓𝐇𝐔𝐁 𝐒𝐀𝐕𝐄𝐃 𝐔𝐒𝐄𝐑𝐒* ✨\n┗━━━━━━━━━━━━━━━━━━━━┛\n";
        db.forEach((item, index) => {
            listText += `┃ ${index+1}. ${item.jid.split('@')[0]} | *${item.session}*\n`;
        });
        listText += "┗━━━━━━━━━━━━━━━━━━━━┛\n*⚡ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐂𝐓 𝐅𝐑𝐄𝐄 𝐁𝐎𝐓*";
        reply(listText);
    } catch (err) {
        reply("❌ Error fetching from GitHub: " + err.message);
    }
});
