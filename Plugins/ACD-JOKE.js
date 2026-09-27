const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "joke",
    alias: ["vihu","fun"],
    react: "🤣",
    desc: "Get a random joke",
    category: "fun",
    filename: __filename
},
async(conn, mek, m, { from, reply }) => {
    try {
        const jokes = [
            "අම්මා: පුතේ, ඔයා රෑට නිදාගන්න කලින් ඇයි සපත්තු දෙක ඇඳගෙන නිදාගන්නේ?\nපුතා: මට හීනෙන් ගොඩක් ඇවිදින්න වෙනවා අම්මේ... ඒකයි!",
            "ගුරුවරයා: ළමයි, ලෝකේ තියෙන ලොකුම සතා කවුද?\nළමයා: ලොකුම සතා 'බය' සර්.\nගුරුවරයා: ඒ ඇයි?\nළමයා: මොකද බය නිසා මිනිස්සුන්ට ලොකු අලි පේනවා කියනවනේ!",
            "හොරා: මට රත්තරන් බඩු ටික දීපන් නැත්නම් මම වෙඩි තියනවා!\nගෘහණිය: රත්තරන් බඩු උගස් තියලා මල්ලි... ඕන නම් පොලී පොත දෙන්නම්!",
            "යාළුවෙක්: මචං, උඹේ බල්ලා හරි බුද්ධිමත්නේ. මම කියන දේ තේරුම් ගන්නවා.\nඅනිත් එක්කෙනා: ඔව් මචං, මට වඩා උට සිංහල තේරෙනවා!",
            "පුතා: තාත්තේ, ඉස්කෝලේ සර් ඇහුවා මට මල්ලිලා කී දෙනෙක් ඉන්නවද කියලා.\nතාත්තා: ඉතින් උඹ මොකක්ද කිව්වේ?\nපුතා: මම කිව්වා මම තාම දන්නේ නෑ, තාත්තාගෙන් අහලා කියන්නම් කියලා!"
        ];

        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        
        const jokeBotName = config.BOT_NAME || 'HASHAN-MD-MINI';
        let jokeMsg = `*╭──────────●●►*
*🤣 ${jokeBotName} JOKES*

${randomJoke}

*Created by MR HASHAN*
*╰──────────●●►*`
        await reply(jokeMsg);
    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
})
