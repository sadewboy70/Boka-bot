const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pair",
    desc: "Get WhatsApp Pair Code",
    category: "system",
    react: "👨‍💻",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // Validate if number is provided
        if (!q) {
            return reply("❌ *Error:* Please provide a valid WhatsApp number.\n\n*Example:* `.pair 94771234567` (with country code, without + sign)");
        }

        // Clean input number by removing spaces, plus signs, or dashes
        const cleanNumber = q.replace(/[^0-9]/g, '');

        await reply("*⚖️ Generating Code Please wait...*");

        // Fixed API URL
        const apiUrl = `https://dct-mini-server3-production.up.railway.app/pair?number=${cleanNumber}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Extracting pairing code safely
        let pairingCode = '';
        if (data) {
            if (data.code) {
                pairingCode = data.code;
            } else if (data.result && data.result.code) {
                pairingCode = data.result.code;
            } else if (typeof data.result === 'string') {
                pairingCode = data.result;
            }
        }

        // If no code was returned by the server
        if (!pairingCode) {
            return reply("❌ *Error:* Could not generate a pairing code. Number might be already active or invalid.");
        }

        // Format code nicely into split blocks (e.g., XXXX-XXXX)
        if (pairingCode.length === 8 && !pairingCode.includes('-')) {
            pairingCode = pairingCode.match(/.{1,4}/g).join('-');
        }

        // 1. Premium Typography Instruction Message
        const pairMessage = `🔗 *DCT FREE BOT PAIR CODE 👨‍💻✔️*\n\n` +
                            `📱 *Target Number:* +${cleanNumber}\n` +
                            `🔑 *Pairing Code:* \`${pairingCode.toUpperCase()}\`\n\n` +
                            `😚✨ *HOW TO CONNECT:*\n` +
                            `1️⃣ Copy the code sent below.\n` +
                            `2️⃣ Open WhatsApp on the target phone.\n` +
                            `3️⃣ Go to *Linked Devices* -> *Link with Phone Number*.\n` +
                            `4️⃣ Paste the code to deploy your bot instantly! ✨`;

        // Main info text එක යවනවා
        await conn.sendMessage(from, { text: pairMessage }, { quoted: mek });

        // 2. EASY COPY FIX: Code එක විතරක් ලේසියෙන් copy කරගන්න වෙනම මැසේජ් එකක් විදිහට යවනවා
        // Backticks (```) දාලා තියෙන නිසා user එකපාරක් click කරපු ගමන් code එක විතරක් copy වෙනවා
        await conn.sendMessage(from, { text: `\`\`\`${pairingCode.toUpperCase()}\`\`\`` }, { quoted: mek });

        // React with success badge
        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

    } catch (e) {
        console.error("Pairing Plugin Error Log:", e);
        reply("❌ *API Connection Error:* The pairing server is currently offline or unreachable.");
    }
});
