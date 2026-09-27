const { cmd } = require('../command')

cmd({pattern: "usee", desc: "Calculator", category: "tools", react: "🧮", filename: __filename},
async (conn, mek, m, { from, args, reply }) => {
    if(!args[0]) return reply("Ex:.calc 2+2")
    try { reply("🧮 " + eval(args.join(' '))) } catch { reply("Invalid") }
})

cmd({pattern: "say", desc: "Bot says", category: "tools", react: "💬", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q || "Say what?"))

cmd({pattern: "repeat", desc: "Repeat text", category: "tools", react: "🔁", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q || "Repeat what?"))

cmd({pattern: "upper", desc: "Uppercase", category: "tools", react: "🔠", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q.toUpperCase() : "Text eka danna"))

cmd({pattern: "lower", desc: "Lowercase", category: "tools", react: "🔡", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q.toLowerCase() : "Text eka danna"))

cmd({pattern: "reverse", desc: "Reverse text", category: "tools", react: "🔄", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q.split('').reverse().join('') : "Text eka danna"))

cmd({pattern: "length", desc: "Text length", category: "tools", react: "📏", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("📏 Length: " + (q? q.length : 0)))

cmd({pattern: "count", desc: "Word count", category: "tools", react: "🔢", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("🔢 Words: " + (q? q.split(' ').length : 0)))

cmd({pattern: "b64enc", desc: "Base64 encode", category: "tools", react: "🔐", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(Buffer.from(q||"").toString('base64')))

cmd({pattern: "b64dec", desc: "Base64 decode", category: "tools", react: "🔓", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(Buffer.from(q||"","base64").toString()))

cmd({pattern: "binary", desc: "To binary", category: "tools", react: "💻", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q.split('').map(c=>c.charCodeAt(0).toString(2)).join(' ') : "Text eka danna"))

cmd({pattern: "hex", desc: "To hex", category: "tools", react: "🎨", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? Buffer.from(q).toString('hex') : "Text eka danna"))

cmd({pattern: "md5", desc: "MD5 hash", category: "tools", react: "🔒", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    const crypto = require('crypto')
    reply(crypto.createHash('md5').update(q||"").digest('hex'))
})

cmd({pattern: "random", desc: "Random number", category: "tools", react: "🎲", filename: __filename},
async (conn, mek, m, { from, args, reply }) => {
    let max = parseInt(args[0]) || 100
    reply("🎲 " + Math.floor(Math.random()*max))
})

cmd({pattern: "mock", desc: "Mock text", category: "tools", react: "🙃", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Text eka danna")
    reply(q.split('').map((c,i)=> i%2?c.toLowerCase():c.toUpperCase()).join(''))
})

cmd({pattern: "clap", desc: "Clap text", category: "tools", react: "👏", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q.split(' ').join(' 👏 ') : "Text eka danna"))

cmd({pattern: "vowel", desc: "Remove vowels", category: "tools", react: "✂️", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q.replace(/[aeiouAEIOU]/g,'') : "Text eka danna"))

cmd({pattern: "leet", desc: "Leet speak", category: "tools", react: "🕶️", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Text eka danna")
    reply(q.replace(/a/gi,'4').replace(/e/gi,'3').replace(/i/gi,'1').replace(/o/gi,'0'))
})

cmd({pattern: "fliptext", desc: "Flip text", category: "tools", react: "🙃", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q.split('').reverse().join('') : "Text eka danna"))

cmd({pattern: "space", desc: "Add spaces", category: "tools", react: "📝", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q.split('').join(' ') : "Text eka danna"))

cmd({pattern: "zalgo", desc: "Zalgo text", category: "tools", react: "👻", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q+'̶' : "Text eka danna"))

cmd({pattern: "fancy", desc: "Fancy text", category: "tools", react: "✨", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q? q.split('').map(c=>'𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛'['abcdefghijklmnopqrstuvwxyz'.indexOf(c.toLowerCase())]||c).join('') : "Text eka danna"))

cmd({pattern: "lenny", desc: "Lenny face", category: "tools", react: "😎", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("( ͡° ͜ʖ ͡°)"))

cmd({pattern: "shrug", desc: "Shrug", category: "tools", react: "🤷", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("¯\\_(ツ)_/¯"))
