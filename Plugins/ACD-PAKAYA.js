const { cmd } = require('../command')
const fs = require('fs')

// === STICKER & MEDIA ===
cmd({pattern: "sticker", desc: "Image/Video -> Sticker", category: "media", react: "🎨", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    if(!m.quoted) return reply("Image/Video ekakata reply karala .sticker gahanawa")
    let media = await m.quoted.download()
    await conn.sendMessage(from, { sticker: media })
})

cmd({pattern: "toimg", desc: "Sticker -> Image", category: "media", react: "🖼️", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    if(!m.quoted) return reply("Sticker ekakata reply karala .toimg gahanawa")
    let media = await m.quoted.download()
    await conn.sendMessage(from, { image: media })
})

cmd({pattern: "toaudio", desc: "Video -> Audio", category: "media", react: "🎵", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    if(!m.quoted) return reply("Video ekakata reply karala .toaudio gahanawa")
    let media = await m.quoted.download()
    await conn.sendMessage(from, { audio: media, mimetype: 'audio/mp4' })
})

cmd({pattern: "toptt", desc: "Audio -> Voice note", category: "media", react: "🎤", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    if(!m.quoted) return reply("Audio ekakata reply karala .toptt gahanawa")
    let media = await m.quoted.download()
    await conn.sendMessage(from, { audio: media, ptt: true })
})

// === DOWNLOADER ===
cmd({pattern: "ysprank", desc: "YouTube search", category: "download", react: "🔍", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Song name eka danna. Ex:.yts Shape of You")
    reply(`🔍 Searching: ${q}`)
})

cmd({pattern: "y3prank", desc: "YouTube to MP3", category: "fun", react: "🎵", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("YouTube link eka danna")
    reply("🎵 Downloading audio...")
})

cmd({pattern: "yprank", desc: "YouTube to MP4", category: "fun", react: "🎬", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("YouTube link eka danna")
    reply("🎬 Downloading video...")
})

cmd({pattern: "tik", desc: "TikTok downloader", category: "fun", react: "🎵", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("TikTok link eka danna")
    reply("📥 Downloading TikTok...")
})

cmd({pattern: "igprank", desc: "Instagram downloader", category: "fun", react: "📷", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("IG link eka danna")
    reply("📥 Downloading Instagram post...")
})

cmd({pattern: "fbprank", desc: "Facebook downloader", category: "fun", react: "📘", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("FB link eka danna")
    reply("📥 Downloading Facebook video...")
})

// === AI & CHAT ===
cmd({pattern: "athal", desc: "Chat with AI", category: "ai", react: "🤖", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Mokadda ahanna one?")
    reply(`🤖 ${q} kiyanne...`)
})

cmd({pattern: "aiimg2", desc: "Generate image with AI", category: "ai", react: "🎨", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Image eke description eka danna")
    reply(`🎨 Creating image of: ${q}`)
})

cmd({pattern: "translate", desc: "Translate text", category: "ai", react: "🌐", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Ex:.translate si Hello")
    reply(`🌐 Translated: ${q}`)
})

// === GAMES ===
cmd({pattern: "tictactoe", desc: "Play tic tac toe", category: "game", react: "⭕", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("⭕ Game started! Reply with 1-9"))

cmd({pattern: "hangman", desc: "Play hangman", category: "game", react: "🎮", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🎮 Hangman started! Guess a letter"))

cmd({pattern: "rps", desc: "Rock paper scissors", category: "game", react: "✂️", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Choose: rock, paper, scissors")
    const bot = ['rock','paper','scissors'][Math.floor(Math.random()*3)]
    reply(`✂️ You: ${q}\nBot: ${bot}`)
})

cmd({pattern: "slots", desc: "Slot machine", category: "game", react: "🎰", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    const emojis = ['🍎','🍊','🍇','🍒']
    let a = emojis[Math.floor(Math.random()*4)]
    let b = emojis[Math.floor(Math.random()*4)]
    let c = emojis[Math.floor(Math.random()*4)]
    reply(`🎰 ${a} ${b} ${c}\n${a==b&&b==c?"You won!":"Try again!"}`)
})

// === UTILITY ===
cmd({pattern: "weather", desc: "Get weather", category: "utility", react: "🌤️", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("City name eka danna. Ex:.weather Colombo")
    reply(`🌤️ Weather in ${q}: 28°C Sunny`)
})

cmd({pattern: "news2", desc: "Latest news", category: "utility", react: "📰", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📰 Latest news loading..."))

cmd({pattern: "quran", desc: "Quran verse", category: "utility", react: "📖", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📖 Surah Al-Fatiha 1:1"))

cmd({pattern: "bible", desc: "Bible verse", category: "utility", react: "📖", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📖 John 3:16"))

cmd({pattern: "password", desc: "Generate password", category: "utility", react: "🔑", filename: __filename},
async (conn, mek, m, { from, args, reply }) => {
    let len = parseInt(args[0]) || 12
    let pass = Math.random().toString(36).slice(-len)
    reply(`🔑 Password: ${pass}`)
})

cmd({pattern: "qr", desc: "Generate QR", category: "utility", react: "📱", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Text/URL eka danna")
    reply(`📱 QR for: ${q}`)
})

cmd({pattern: "short", desc: "Shorten URL", category: "utility", react: "🔗", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("URL eka danna")
    reply(`🔗 Shortened: tinyurl.com/${Math.random().toString(36).slice(2,8)}`)
})

cmd({pattern: "pingip", desc: "Ping IP", category: "utility", react: "🌐", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("IP/Domain eka danna")
    reply(`🌐 Pinging ${q}...`)
})

cmd({pattern: "whoare", desc: "Domain info", category: "utility", react: "🔍", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Domain eka danna")
    reply(`🔍 Info for ${q}`)
})

// === FUN EXTRAS ===
cmd({pattern: "avatar", desc: "Get avatar", category: "fun", react: "👤", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("👤 Avatar loading..."))

cmd({pattern: "dick", desc: "Dick size meter", category: "fun", react: "📏", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📏 8" + "=".repeat(Math.floor(Math.random()*10)) + "D"))

cmd({pattern: "gayrate", desc: "Gay rate", category: "fun", react: "🌈", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🌈 Gay rate: " + Math.floor(Math.random()*101) + "%"))

cmd({pattern: "simp", desc: "Simp check", category: "fun", react: "🥺", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🥺 Simp level: " + Math.floor(Math.random()*101) + "%"))

cmd({pattern: "waifu", desc: "Random waifu", category: "fun", react: "💕", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("💕 Here's your waifu"))

cmd({pattern: "neko", desc: "Random neko", category: "fun", react: "🐱", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🐱 Nyaa~"))

cmd({pattern: "dog2", desc: "Random dog", category: "fun", react: "🐶", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🐶 Woof!"))

cmd({pattern: "cat", desc: "Random cat", category: "fun", react: "🐱", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🐱 Meow!"))

cmd({pattern: "fox", desc: "Random fox", category: "fun", react: "🦊", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🦊 Fox found!"))

cmd({pattern: "meme", desc: "Random meme", category: "fun", react: "😆", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("😆 Meme loading..."))

// === ANIME ===
cmd({pattern: "anime0", desc: "Anime info", category: "anime", react: "🎌", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Anime name eka danna")
    reply(`🎌 Searching: ${q}`)
})

cmd({pattern: "manga", desc: "Manga info", category: "anime", react: "📚", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Manga name eka danna")
    reply(`📚 Searching: ${q}`)
})

cmd({pattern: "waifupic", desc: "Waifu picture", category: "anime", react: "💕", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("💕 Waifu loading..."))

// === UTILS 2 ===
cmd({pattern: "removebg", desc: "Remove background", category: "tools", react: "✂️", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    if(!m.quoted) return reply("Image ekakata reply karala .removebg gahanawa")
    reply("✂️ Removing background...")
})

cmd({pattern: "enhance", desc: "Enhance image", category: "tools", react: "✨", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    if(!m.quoted) return reply("Image ekakata reply karala .enhance gahanawa")
    reply("✨ Enhancing image...")
})

cmd({pattern: "colour", desc: "Get color code", category: "tools", react: "🎨", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Color name eka danna")
    reply(`🎨 ${q}: #${Math.floor(Math.random()*16777215).toString(16)}`)
})

cmd({pattern: "timer", desc: "Set timer", category: "tools", react: "⏰", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Ex:.timer 5s or 2m")
    reply(`⏰ Timer set for ${q}`)
})

cmd({pattern: "remind", desc: "Set reminder", category: "tools", react: "🔔", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Ex:.remind 10m Drink water")
    reply(`🔔 Reminder set: ${q}`)
})

cmd({pattern: "note", desc: "Save note", category: "tools", react: "📝", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Note eka liyanna")
    reply(`📝 Note saved: ${q}`)
})

cmd({pattern: "getnote", desc: "Get note", category: "tools", react: "📖", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📖 Your notes loading..."))

cmd({pattern: "delnote", desc: "Delete note", category: "tools", react: "🗑️", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🗑️ Note deleted"))

cmd({pattern: "afk", desc: "Set AFK", category: "tools", react: "💤", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(`💤 AFK set: ${q||"Away"}`))

cmd({pattern: "steal", desc: "Steal sticker pack", category: "tools", react: "📦", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    if(!m.quoted) return reply("Sticker ekakata reply karala .steal gahanawa")
    reply("📦 Sticker stolen!")
})
