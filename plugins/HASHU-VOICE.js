const { cmd } = require('../command');

// Voice Replies Object - ඔයාගේ ඔක්කොම වොයිස් ටික මෙතන තියෙනවා
const _VOICE_REPLIES = {
    'gm': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/gm.ogg',
    'good morning': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/gm.ogg',
    'hi': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/hi%20lassana%20lamayo.ogg',
    'hello': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/hi%20lassana%20lamayo.ogg',
    'mk': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/mk.ogg',
    'hey': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/hi%20lassana%20lamayo.ogg',
    'ponnaya': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/bad%20words.ogg',
    'adarey': 'https://github.com/TECH-HORIZON-SCHOOL-OFFICIAL/PROJECT_HORIZON/raw/refs/heads/main/voice%20clips/adarei.mp3',
    'hako': 'https://github.com/TECH-HORIZON-SCHOOL-OFFICIAL/PROJECT_HORIZON/raw/refs/heads/main/voice%20clips/hako.mp3',
    'bot': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/hi%20lassana%20lamayo.ogg',
    'mokada karanne': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/mk.ogg',
    'hm': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/hm.ogg',
    'bye': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/bye%20lassana%20lamayo.ogg',
    'hutta': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/bad%20words.ogg',
    'pakaya': 'https://raw.githubusercontent.com/dct-dula/database/48c3556468d3f7f81ce6b4ec974a83f2aea1b467/voice/bad%20words.ogg'
    // තව ඒවා ඕන නම් මෙතනට එකතු කරන්න
};

// Auto-Reply Logic - 100% Always ON
cmd({
    on: "body"
},
async(conn, mek, m, { from, body, isCmd }) => {
    // isCmd නම් මේක වැඩ කරන්නේ නැහැ (Command එකට බාධාවක් වෙන්නේ නැහැ)
    // m.key.fromMe නම් බොට්ගේ මැසේජ් වලට රිප්ලයි කරන්නේ නැහැ
    if (isCmd || m.key.fromMe) return;

    const msg = body.toLowerCase().trim();
    
    // Voice එක තියෙනවද කියලා බලනවා
    if (_VOICE_REPLIES[msg]) {
        await conn.sendMessage(from, { 
            audio: { url: _VOICE_REPLIES[msg] }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        }, { quoted: mek });
    }
});
