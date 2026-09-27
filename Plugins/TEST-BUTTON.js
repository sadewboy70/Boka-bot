const { cmd } = require('../command');

cmd({
    pattern: "hashiya",
    desc: "Get bot menu",
    category: "main",
},
async (conn, mek, m, { reply }) => {
    
    // මේක අනිවාර්යයෙන්ම පේනවා
    const sections = [
        {
            title: "🚀 DOWNLOAD COMMANDS",
            rows: [
                { title: "Song Downloader", rowId: ".song", description: "සින්දු බාගත කිරීමට" },
                { title: "Video Downloader", rowId: ".video", description: "වීඩියෝ බාගත කිරීමට" }
            ]
        },
        {
            title: "⚙️ TOOLS",
            rows: [
                { title: "Google Search", rowId: ".google", description: "ගූගල් සර්ච්" },
                { title: "Weather Info", rowId: ".weather", description: "කාලගුණ විද්‍යාව" }
            ]
        }
    ];

    const listMessage = {
        text: `👋 ආයුබෝවන් *MR HASHUU*!\nDCT BOT මෙනු එකට සාදරයෙන් පිළිගනිමු.\n\nපහත මෙනු එකෙන් අවශ්‍ය දේ තෝරන්න:`,
        footer: "DCT BOT 2026",
        buttonText: "මෙනු එක බලන්න",
        sections: sections
    };

    await conn.sendMessage(m.chat, listMessage, { quoted: mek });
});
