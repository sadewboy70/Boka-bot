const { cmd } = require('../command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');

cmd({
    pattern: "imgurl",
    desc: "Get image URL",
    category: "tools",
},
async (conn, mek, m, { reply }) => {
    // රිප්ලයි එකේ මැසේජ් එක අල්ලගන්නවා
    const quoted = m.quoted ? m.quoted : m;
    
    // මේක බලපං - ෆොටෝ එකක් ද නැද්ද කියලා
    if (!quoted.imageMessage) {
        return reply("❌ Please reply to an image!");
    }

    try {
        reply("⏳ Generating link...");

        // downloadMediaMessage එක පාවිච්චි කරද්දී 'buffer' විදියට ගමු
        const media = await downloadMediaMessage(quoted, 'buffer', {});

        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', media, 'file.jpg');

        const res = await axios.post('https://litterbox.catbox.moe/resources/internals/api.php', form, {
            headers: form.getHeaders()
        });

        reply(`✅ Success!\n\n${res.data}`);

    } catch (e) {
        reply("❌ Error: " + e.message);
    }
});
