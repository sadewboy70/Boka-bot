const { cmd } = require('../command')

const jokes = ["Why do programmers prefer dark mode? Bugs!", "I told my PC I need a break. Now it sends KitKat ads.", "404 joke not found"]
const quotes = ['"Code is like humor."', '"First solve, then code."', '"Simplicity is key."']
const facts = ["Honey never spoils", "Octopuses have 3 hearts", "Bananas are berries"]

cmd({pattern: "veryjoke", desc: "Random joke", category: "fun", react: "😂", filename: __filename},
async (conn, mek, m, { from, reply }) => reply(jokes[Math.floor(Math.random()*jokes.length)]))

cmd({pattern: "quote", desc: "Random quote", category: "fun", react: "💬", filename: __filename},
async (conn, mek, m, { from, reply }) => reply(quotes[Math.floor(Math.random()*quotes.length)]))

cmd({pattern: "fact", desc: "Random fact", category: "fun", react: "🤓", filename: __filename},
async (conn, mek, m, { from, reply }) => reply(facts[Math.floor(Math.random()*facts.length)]))

cmd({pattern: "8ball", desc: "Ask 8ball", category: "fun", react: "🎱", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Ask a question")
    const ans = ["Yes","No","Maybe","Ask again","Definitely"]
    reply("🎱 " + ans[Math.floor(Math.random()*ans.length)])
})

cmd({pattern: "truth", desc: "Truth game", category: "fun", react: "🤔", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🤔 Truth: What's your biggest secret?"))

cmd({pattern: "dare", desc: "Dare game", category: "fun", react: "🔥", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🔥 Dare: Send a voice note singing"))

cmd({pattern: "ship", desc: "Ship 2 people", category: "fun", react: "💕", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("💕 Compatibility: " + Math.floor(Math.random()*100) + "%"))

cmd({pattern: "hug", desc: "Hug someone", category: "fun", react: "🤗", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("*Hugs you tight* 🤗"))

cmd({pattern: "kiss", desc: "Kiss someone", category: "fun", react: "😘", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("*Kisses you* 😘"))

cmd({pattern: "slap", desc: "Slap someone", category: "fun", react: "👋", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("*Slaps you* 👋"))

cmd({pattern: "roast", desc: "Roast someone", category: "fun", react: "🔥", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🔥 You're like a cloud. When you disappear, it's a beautiful day."))

cmd({pattern: "compliment", desc: "Give compliment", category: "fun", react: "💖", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("💖 You have a great smile!"))

cmd({pattern: "roll", desc: "Roll dice", category: "fun", react: "🎲", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🎲 You rolled: " + (Math.floor(Math.random()*6)+1)))

cmd({pattern: "flip", desc: "Flip coin", category: "fun", react: "🪙", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🪙 " + (Math.random()>0.5?"Heads":"Tails")))

cmd({pattern: "pick", desc: "Pick random", category: "fun", react: "🎯", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    if(!q) return reply("Ex:.pick apple,banana,mango")
    const items = q.split(',')
    reply("🎯 I pick: " + items[Math.floor(Math.random()*items.length)])
})

cmd({pattern: "rate", desc: "Rate something", category: "fun", react: "⭐", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("⭐ I rate it " + Math.floor(Math.random()*10+1) + "/10"))

cmd({pattern: "meme", desc: "Send meme text", category: "fun", react: "😆", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("😆 When you realize it's Monday tomorrow"))

cmd({pattern: "laugh", desc: "Laugh", category: "fun", react: "😂", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("hahahaha"))

cmd({pattern: "cry", desc: "Cry", category: "fun", react: "😭", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("😭 boo hoo hoo"))

cmd({pattern: "angry", desc: "Angry face", category: "fun", react: "😡", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("😡 Grrrrr!"))

cmd({pattern: "love", desc: "Love react", category: "fun", react: "❤️", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("❤️ I love you too"))

cmd({pattern: "sleep", desc: "Sleep", category: "fun", react: "😴", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("😴 Good night"))

cmd({pattern: "happy", desc: "Happy", category: "fun", react: "😊", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("😊 I'm so happy!"))
