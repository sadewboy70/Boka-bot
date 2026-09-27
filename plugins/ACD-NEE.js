const config = require('../config')
const { cmd, commands } = require('../command')

// 1. 🧮 SIMPLE CALCULATOR (.calc)
cmd({ pattern: "calc", alias: ["math"], react: "🧮", desc: "Solve simple math expressions", category: "other", filename: __filename },
async(conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("*⚠️ කරුණාකර සුළු කල යුතු ගණිත ගැටලුව ලබාදෙන්න! (උදා: .calc 5+5*2)*")
    try {
        // Safe evaluation for basic math only
        const cleaned = text.replace(/[^0-9+\-*/().\s]/g, '')
        const result = Function(`return (${cleaned})`)()
        await reply(`*🧮 ${config.BOT_NAME || 'HASHAN-MD MINI'} MATH *\n\n> 🔢 *ගැටලුව:* ${text}\n> ✅ *පිළිතුර:* ${result}`)
    } catch { reply("*❌ වැරදි ගණිත ප්‍රකාශනයකි!*") }
})

// 2. 🕵️‍♂️ FRIENDSHIP PERCENTAGE (.friend)
cmd({ pattern: "friend", react: "🤝", desc: "Check friendship percentage", category: "other", filename: __filename },
async(conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("*⚠️ කරුණාකර යහළුවන් දෙදෙනෙකුගේ නම් ඇතුලත් කරන්න!*")
    const score = Math.floor(Math.random() * 101)
    await reply(`*🤝 ${config.BOT_NAME || 'HASHAN-MD MINI'} FRIENDSHIP TEST *\n\n> 👥 *මිත්‍රත්වය:* ${text}\n> 📊 *මිතුරු මට්ටම:* ${score}%`)
})

// 3. 📅 DAY FINDER (.day)
cmd({ pattern: "day", react: "📅", desc: "Find the day of any given date", category: "other", filename: __filename },
async(conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("*⚠️ කරුණාකර දිනයක් ලබාදෙන්න! (Format: YYYY-MM-DD, උදා: .day 2026-05-16)*")
    const days = ["ඉරිදා", "සඳුදා", "අඟහරුවාදා", "බදාදා", "බ්‍රහස්පතින්දා", "සිකුරාදා", "සෙනසුරාදා"]
    const dayName = days[new Date(text).getDay()]
    if (!dayName) return reply("*❌ වැරදි දින වකවානුවකි!*")
    await reply(`*📅 ${config.BOT_NAME || 'HASHAN-MD MINI'} DAY FINDER *\n\n> 📆 *දිනය:* ${text}\n> ⏳ *එම දිනය:* ${dayName} දවසකි.`)
})

// 4. 🔀 TEXT RANDOMIZER / SHUFFLE (.shuffle)
cmd({ pattern: "shuffle", react: "🔀", desc: "Shuffle text characters", category: "other", filename: __filename },
async(conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("*⚠️ කරුණාකර වචනයක් හෝ text එකක් දෙන්න!*")
    const shuffled = text.split('').sort(() => 0.5 - Math.random()).join('')
    await reply(shuffled)
})

// 5. 🌡️ FEVER/TEMPERATURE SIMULATOR (.bodytemp)
cmd({ pattern: "bodytemp", react: "🌡️", desc: "Check your body temperature for fun", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    const temp = (Math.random() * (39.5 - 36.0) + 36.0).toFixed(1)
    let status = temp > 37.5 ? "උණ වගේ (Fever) 🤒" : "නිරෝගීයි (Normal) ✅"
    await reply(`*🌡️ ${config.BOT_NAME || 'HASHAN-MD MINI'} HEALTH CHECK *\n\n> 📊 *ශරීර උෂ්ණත්වය:* ${temp} °C\n> 🎯 *තත්වය:* ${status}`)
})

// 6. 🦖 ANIMAL SOUL FINDER (.myanimal)
cmd({ pattern: "myanimal", react: "🦖", desc: "Find your inner animal soul", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    const animals = ["සිංහයා (Lion) 🦁", "බළලා (Cat) 🐱", "නරියා (Fox) 🦊", "වලහා (Bear) 🐻", "වඳුරා (Monkey) 🐒", "කෙස්වටුවා (Owl) 🦉"]
    await reply(`*🦖 ${config.BOT_NAME || 'HASHAN-MD MINI'} ANIMAL SOUL *\n\n> 🔮 ඔයාගේ ඇතුලාන්තයේ ඉන්න සත්ත්වයා: *${animals[Math.floor(Math.random() * animals.length)]}*`)
})

// 7. 🔮 LEAK MY FUTURE JOB (.myjob)
cmd({ pattern: "myjob", react: "💼", desc: "Predict your future career", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    const jobs = ["Software Engineer 🧑‍💻", "Doctor 🧑‍⚕️", "Astronaut (අභ්‍යවකාශගාමී) 🚀", "Business Owner 💸", "Hacker 🕵️‍♂️", "Youtuber 🎥"]
    await reply(`*💼 FUTURE CAREER PREDICTOR *\n\n> 🔮 ඔයා අනාගතයේදී වෙන්නේ: *${jobs[Math.floor(Math.random() * jobs.length)]}*`)
})

// 8. 💸 WEALTH CHECKER (.wealth)
cmd({ pattern: "wealth", react: "💸", desc: "Check your bank account level for fun", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    const cash = ["රුපියල් 50යි 😹", "කෝටිපතියෙක් 💰", "හිඟන්නෙක් 📉", "ලක්ෂපතියෙක් 💵"]
    await reply(`*💸 ${config.BOT_NAME || 'HASHAN-MD MINI'} BANK BALANCE *\n\n> 🔮 ඔයාගේ වත්කම: *${cash[Math.floor(Math.random() * cash.length)]}*`)
})

// 9. 🧟 ZOMBIE SURVIVAL CHANCE (.zombie)
cmd({ pattern: "zombie", react: "🧟", desc: "Your survival rate in a zombie apocalypse", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    const rate = Math.floor(Math.random() * 101)
    await reply(`*🧟 ZOMBIE SURVIVAL RATE *\n\n> ⚔️ සොම්බි ප්‍රහාරයකින් ඔයා බේරීමේ සම්භාවිතාව: *${rate}%*`)
})

// 10. 🤥 LIE DETECTOR (.lie)
cmd({ pattern: "lie", react: "🤥", desc: "Check if replied text is a lie", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    if (!m.quoted) return reply("*⚠️ කරුණාකර චෙක් කල යුතු මැසේජ් එකකට රිප්ලයි කරන්න!*")
    const result = Math.random() > 0.5 ? "100%ක්ම ඇත්ත (TRUTH) ✅" : "පට්ට පල් බොරුවක් (LIE) 🤥"
    await reply(`*🤥 ${config.BOT_NAME || 'HASHAN-MD MINI'} LIE DETECTOR *\n\n> 📊 *පරීක්ෂණ වාර්තාව:* ${result}`)
})

// 11. 🧼 SLIME GENERATOR TEXT (.slime)
cmd({ pattern: "slime", react: "🧼", desc: "Convert text to slime style look", category: "other", filename: __filename },
async(conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("*⚠️ text එකක් දෙන්න!*")
    await reply(`~_${text}_~`)
})

// 12. 👻 AM I SCARY (.scary)
cmd({ pattern: "scary", react: "👻", desc: "Check your scary level", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    const num = Math.floor(Math.random() * 101)
    await reply(`*👻 ${config.BOT_NAME || 'HASHAN-MD MINI'} SCARY SCALE *\n\n> 📊 *බය හිතෙන මට්ටම:* ${num}%`)
})

// 13. 📄 LINE COUNT (.lines)
cmd({ pattern: "lines", react: "📄", desc: "Count lines in a message", category: "other", filename: __filename },
async(conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("*⚠️ text එකක් ලියන්න!*")
    const count = text.split('\n').length
    await reply(`*📄 LINE COUNTER *\n\n> 📊 Total Lines: *${count}*`)
})

// 14. 🤫 SECRET CODE TEXT (.secret)
cmd({ pattern: "secret", react: "🤫", desc: "Convert text to encoded dots", category: "other", filename: __filename },
async(conn, mek, m, { from, text, reply }) => {
    if (!text) return reply("*⚠️ text එකක් ලියන්න!*")
    const secret = text.split('').map(() => "•").join(' ')
    await reply(`*🤫 ENCODED TEXT:* \n\n${secret}`)
})

// 15. 💨 VIRTUAL SLAP (.slap)
cmd({ pattern: "slap", react: "🖐️", desc: "Slap someone virtually", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    await reply(`*🖐️ ${config.BOT_NAME || 'HASHAN-MD MINI'} SLAP SYSTEM *\n\n> 💨 ඔයා ඉස්සරහා ඉන්න කෙනාගේ කන හරහා පාරක් ගැහුවා ලැජ්ජා නැතිවෙන්නම!`)
})

// 16. ☕ VIRTUAL COFFEE (.coffee)
cmd({ pattern: "coffee", react: "☕", desc: "Serve a warm cup of coffee", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    await reply(`*☕ ${config.BOT_NAME || 'HASHAN-MD MINI'} COFFEE SHOP *\n\n> ඔන්න ඔයාට උණු උණු කෝපි එකක් හැදුවා. බොන්න සලකන්න! ☕✨`)
})

// 17. 🦚 RANDOM COLOR GENERATOR (.color)
cmd({ pattern: "color", react: "🎨", desc: "Get a random HEX color code", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    const hex = "0123456789ABCDEF"
    let code = "#"
    for (let i = 0; i < 6; i++) { code += hex[Math.floor(Math.random() * 16)] }
    await reply(`*🎨 RANDOM HEX COLOR *\n\n> Color Code: *${code}*`)
})

// 18. 🚬 SMOKING SIMULATOR (.smoke)
cmd({ pattern: "smoke", react: "🚬", desc: "Fun smoking text trick", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    await reply("🚬\n☁️\n☁️☁️\n*🚭 දුම්පානය සෞඛ්‍යයට අහිතකරයි (Fun Only)!*")
})

// 19. 🥚 CHICKEN & EGG PUZZLE (.egg)
cmd({ pattern: "egg", react: "🥚", desc: "Solve the ultimate riddle", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    const ans = ["කෝකටත් කලින් බොට් ආවා 🤖", "බිත්තරේ තමා 🥚", "කිකිළි තමා 🐔"]
    await reply(`*🥚 THE EGG RIDDLE *\n\n> ❓ *ප්‍රශ්නය:* මුලින්ම ආවේ කිකිළිද බිත්තරේද?\n> 💡 *උත්තරේ:* ${ans[Math.floor(Math.random() * ans.length)]}`)
})

// 20. 📜 OTHER MENU 2 LIST (.othermenu2)
cmd({ pattern: "othermenu2", react: "📜", desc: "List all other category part 2 commands", category: "other", filename: __filename },
async(conn, mek, m, { from, reply }) => {
    let menu = `*🎡 ${config.BOT_NAME || 'HASHAN-MD MINI'} OTHER MENU (PART 2) *\n\n`
    menu += `> .calc - Solve math quiz\n`
    menu += `> .friend - Friendship rate\n`
    menu += `> .day - Find target calendar day\n`
    menu += `> .shuffle - Mix letters\n`
    menu += `> .bodytemp - Check fever scale\n`
    menu += `> .myanimal - Animal soul prediction\n`
    menu += `> .myjob - Career forecast\n`
    menu += `> .wealth - Money level meter\n`
    menu += `> .zombie - Survival possibility\n`
    menu += `> .lie - Reply lie detector\n`
    menu += `> .slime - Custom slime fonts\n`
    menu += `> .scary - Horrific look score\n`
    menu += `> .lines - Read line breakdown\n`
    menu += `> .secret - Hidden encryption effect\n`
    menu += `> .slap - Virtual hit interaction\n`
    menu += `> .coffee - Friendly beverage serve\n`
    menu += `> .color - Random CSS HEX palette\n`
    menu += `> .smoke - Abstract visual trick\n`
    menu += `> .egg - Scientific myth response\n`
    await reply(menu)
})
