const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "joke",
    desc: "Get a random joke with clickable buttons.",
    category: "main",
    react: "🤣",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const jokes = [
            "ඇයි මදුරුවෝ රෑට විතරක් කන් ලඟට ඇවිත් සින්දු කියන්නේ? 🤔\n\n- මොකද උන් දන්නවා දවල්ට අපේ අතින් මැරුම් කන්න වෙනවා කියලා! 😂",
            "ගුරුවරයා: ලමයෝ 'බබා' කියන එකේ බහුවචනය මොකක්ද?\nශිෂ්‍යයා: 'බබාලා' සර්.\nගුරුවරයා: එතකොට 'බබා හම්බවෙනවා' කියන එකේ බහුවචනය?\nශිෂ්‍යයා: 'නිවුන් බබාලා' සර්! 🤣",
            "Why don't scientists trust atoms? 🤔\n\n- Because they make up everything! 😆",
            "මම අද උදේ කණ්නාඩිය ඉස්සරහට ගිහින් ඇහුවා 'ඇයි මම මෙච්චර ලස්සන?' කියලා..\n\nකණ්නාඩිය කිව්වා 'කරුණාකරලා විහිළු නොකර මූණ හෝදගෙන එන්න' කියලා! 🥲😂"
        ];

        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        const botName = config.BOT_NAME || 'HASHAN-MD';
        const logo = 'https://files.catbox.moe/vbo0vq.png';

        // 📝 පණිවිඩය සකස් කිරීම
        let jokeText = `✨ *ᴊᴏᴋᴇ ᴏꜰ ᴛʜᴇ ᴍᴏᴍᴇɴᴛ* ✨\n\n${randomJoke}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`;

        // 🔘 අලුත් Button (Interactive) ක්‍රමය
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔄 ɴᴇxᴛ ᴊᴏᴋᴇ",
                    id: ".joke"
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "📋 ᴍᴇɴᴜ",
                    id: ".menu"
                })
            }
        ];

        const msg = {
            viewOnce: true,
            header: {
                title: `*${botName}*`,
                hasMediaAttachment: true,
                imageMessage: (await conn.prepareMessageMedia({ image: { url: logo } }, { upload: conn.waUploadToServer })).imageMessage
            },
            body: { text: jokeText },
            footer: { text: "ꜱᴇʟᴇᴄᴛ ᴀɴ ᴏᴘᴛɪᴏɴ ʙᴇʟᴏᴡ" },
            nativeFlowMessage: {
                buttons: buttons
            }
        };

        // පණිවිඩය යැවීම
        await conn.relayMessage(from, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: msg
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        // Buttons වැඩ නැතිනම් සාමාන්‍ය reply එකක් යවන්න
        reply(`🤣 *Joke:* \n\n${randomJoke}`);
    }
})
