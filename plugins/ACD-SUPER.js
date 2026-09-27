const { cmd } = require('../command')
const crypto = require('crypto')
const os = require('os')

// ========== 1-20: MATH & LOGIC ==========
cmd({pattern: "sqrt", desc: "Square root", category: "math", react: "√", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("√ " + Math.sqrt(parseFloat(q||0))))

cmd({pattern: "pow", desc: "Power", category: "math", react: "xʸ", filename: __filename},
async (conn, mek, m, { from, args, reply }) => reply("xʸ " + Math.pow(parseFloat(args[0]||0), parseFloat(args[1]||0))))

cmd({pattern: "sin", desc: "Sin", category: "math", react: "sin", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("sin " + Math.sin(parseFloat(q||0))))

cmd({pattern: "cos", desc: "Cos", category: "math", react: "cos", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("cos " + Math.cos(parseFloat(q||0))))

cmd({pattern: "tan", desc: "Tan", category: "math", react: "tan", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("tan " + Math.tan(parseFloat(q||0))))

cmd({pattern: "log", desc: "Log10", category: "math", react: "log", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("log " + Math.log10(parseFloat(q||1))))

cmd({pattern: "ln", desc: "Natural log", category: "math", react: "ln", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("ln " + Math.log(parseFloat(q||1))))

cmd({pattern: "abs", desc: "Absolute", category: "math", react: "|x|", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("|x| " + Math.abs(parseFloat(q||0))))

cmd({pattern: "ceil", desc: "Ceil", category: "math", react: "⌈x⌉", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("⌈x⌉ " + Math.ceil(parseFloat(q||0))))

cmd({pattern: "floor", desc: "Floor", category: "math", react: "⌊x⌋", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("⌊x⌋ " + Math.floor(parseFloat(q||0))))

cmd({pattern: "round", desc: "Round", category: "math", react: "≈", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("≈ " + Math.round(parseFloat(q||0))))

cmd({pattern: "fact", desc: "Factorial", category: "math", react: "!", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let n = parseInt(q||0), res=1
    for(let i=2;i<=n;i++)res*=i
    reply("! " + res)
})

cmd({pattern: "gcd", desc: "GCD", category: "math", react: "gcd", filename: __filename},
async (conn, mek, m, { from, args, reply }) => {
    let a=parseInt(args[0]), b=parseInt(args[1])
    while(b){let t=b; b=a%b; a=t}
    reply("gcd " + a)
})

cmd({pattern: "lcm", desc: "LCM", category: "math", react: "lcm", filename: __filename},
async (conn, mek, m, { from, args, reply }) => {
    let a=parseInt(args[0]), b=parseInt(args[1])
    reply("lcm " + (a*b)/((a,b)=>{while(b){let t=b;b=a%b;a=t}return a})(a,b))
})

cmd({pattern: "prime", desc: "Check prime", category: "math", react: "🔢", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let n=parseInt(q||0), prime=n>1
    for(let i=2;i<=Math.sqrt(n);i++)if(n%i==0)prime=false
    reply(prime?"Prime":"Not prime")
})

cmd({pattern: "fib", desc: "Fibonacci", category: "math", react: "🔢", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let n=parseInt(q||0), a=0,b=1
    for(let i=0;i<n;i++){let t=a+b;a=b;b=t}
    reply("Fib: " + a)
})

cmd({pattern: "avg", desc: "Average", category: "math", react: "∑", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let arr=q.split(',').map(Number)
    reply("Avg: " + (arr.reduce((a,b)=>a+b,0)/arr.length))
})

cmd({pattern: "sum", desc: "Sum", category: "math", react: "∑", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let arr=q.split(',').map(Number)
    reply("Sum: " + arr.reduce((a,b)=>a+b,0))
})

cmd({pattern: "min", desc: "Min value", category: "math", react: "↓", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("Min: " + Math.min(...q.split(',').map(Number))))

cmd({pattern: "max", desc: "Max value", category: "math", react: "↑", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply("Max: " + Math.max(...q.split(',').map(Number))))

// ========== 21-40: STRING MANIPULATION ==========
cmd({pattern: "titlecase", desc: "Title Case", category: "text", react: "Aa", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.replace(/\w\S*/g, w=>w[0].toUpperCase()+w.slice(1))))

cmd({pattern: "camelcase", desc: "camelCase", category: "text", react: "🐪", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.replace(/\s+(.)/g,(m,c)=>c.toUpperCase())))

cmd({pattern: "snakecase", desc: "snake_case", category: "text", react: "🐍", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.toLowerCase().replace(/\s+/g,'_')))

cmd({pattern: "kebabcase", desc: "kebab-case", category: "text", react: "🔪", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.toLowerCase().replace(/\s+/g,'-')))

cmd({pattern: "removeemoji", desc: "Remove emoji", category: "text", react: "🚫", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.replace(/[\u{1F600}-\u{1F64F}]/gu,'')))

cmd({pattern: "removenum", desc: "Remove numbers", category: "text", react: "🔢", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.replace(/[0-9]/g,'')))

cmd({pattern: "removespace", desc: "Remove spaces", category: "text", react: "🚫", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.replace(/\s/g,'')))

cmd({pattern: "dupline", desc: "Remove duplicate lines", category: "text", react: "📝", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply([...new Set(q.split('\n'))].join('\n')))

cmd({pattern: "sortline", desc: "Sort lines", category: "text", react: "🔤", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.split('\n').sort().join('\n')))

cmd({pattern: "revline", desc: "Reverse lines", category: "text", react: "🔄", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.split('\n').reverse().join('\n')))

cmd({pattern: "swapcase", desc: "Swap case", category: "text", react: "⇅", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.split('').map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join('')))

cmd({pattern: "strikethru", desc: "Strikethrough", category: "text", react: "~~", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.split('').join('\u0336')))

cmd({pattern: "underline", desc: "Underline", category: "text", react: "__", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.split('').join('\u0332')))

cmd({pattern: "wide", desc: "Fullwidth text", category: "text", react: "Ｗ", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.replace(/./g,c=>String.fromCharCode(c.charCodeAt(0)+65248))))

cmd({pattern: "smallcaps", desc: "Small caps", category: "text", react: "ᴀ", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.toLowerCase().replace(/[a-z]/g,c=>'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ'['abcdefghijklmnopqrstuvwxyz'.indexOf(c)])))

cmd({pattern: "bubble", desc: "Bubble text", category: "text", react: "ⓐ", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.replace(/[a-z]/gi,c=>'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ'['abcdefghijklmnopqrstuvwxyz'.indexOf(c.toLowerCase())])))

cmd({pattern: "square", desc: "Square text", category: "text", react: "🅰️", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.replace(/[a-z]/gi,c=>'🅰️🅱️🅲️🅳️🅴️🅵️🅶️🅷️🅸️🅹️🅺️🅻️🅼️🅽️🅾️🅿️🆀️🆁️🆂️🆃️🆄️🆅️🆆️🆇️🆈️🆉️'['abcdefghijklmnopqrstuvwxyz'.indexOf(c.toLowerCase())])))

cmd({pattern: "mirror", desc: "Mirror text", category: "text", react: "🪞", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.split('').reverse().map(c=>({')':'(', '(':')','[':']',']':'[','{':'}','}':'{'}[c]||c)).join('')))

cmd({pattern: "zigzag", desc: "Zigzag text", category: "text", react: "⚡", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q.split('').map((c,i)=>i%2?c.toUpperCase():c.toLowerCase()).join('')))

// ========== 41-60: SYSTEM & INFO ==========
cmd({pattern: "hostname", desc: "Hostname", category: "system", react: "🖥️", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🖥️ " + os.hostname()))

cmd({pattern: "platform", desc: "OS platform", category: "system", react: "💻", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("💻 " + os.platform()))

cmd({pattern: "arch", desc: "CPU arch", category: "system", react: "⚙️", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("⚙️ " + os.arch()))

cmd({pattern: "freem", desc: "Free memory", category: "system", react: "💾", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("💾 " + (os.freem()/1024/1024).toFixed(2)+"MB"))

cmd({pattern: "totalmem", desc: "Total memory", category: "system", react: "💾", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("💾 " + (os.totalmem()/1024/1024).toFixed(2)+"MB"))

cmd({pattern: "cpus", desc: "CPU count", category: "system", react: "🧠", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🧠 " + os.cpus().length + " cores"))

cmd({pattern: "uptimeos", desc: "OS uptime", category: "system", react: "⏱️", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("⏱️ " + Math.floor(os.uptime()/3600)+"h"))

cmd({pattern: "nodever", desc: "Node version", category: "system", react: "🟢", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🟢 " + process.version))

cmd({pattern: "env", desc: "Env var", category: "system", react: "🔧", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(process.env[q]||"Not found"))

cmd({pattern: "pid", desc: "Process ID", category: "system", react: "🆔", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🆔 " + process.pid))

cmd({pattern: "cwd", desc: "Current dir", category: "system", react: "📁", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📁 " + process.cwd()))

cmd({pattern: "argv", desc: "Process args", category: "system", react: "📋", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📋 " + process.argv.join(' ')))

cmd({pattern: "execpath", desc: "Node path", category: "system", react: "📍", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📍 " + process.execPath))

cmd({pattern: "tempdir", desc: "Temp dir", category: "system", react: "📁", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📁 " + os.tmpdir()))

cmd({pattern: "homedir", desc: "Home dir", category: "system", react: "🏠", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🏠 " + os.homedir()))

cmd({pattern: "user", desc: "Username", category: "system", react: "👤", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("👤 " + os.userInfo().username))

cmd({pattern: "loadavg", desc: "Load average", category: "system", react: "📊", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📊 " + os.loadavg().join(', ')))

cmd({pattern: "network", desc: "Network interfaces", category: "system", react: "🌐", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🌐 " + Object.keys(os.networkInterfaces()).join(', ')))

cmd({pattern: "release", desc: "OS release", category: "system", react: "📦", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📦 " + os.release()))

cmd({pattern: "type", desc: "OS type", category: "system", react: "💻", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("💻 " + os.type()))

// ========== 61-80: HASH & ENCODE ==========
cmd({pattern: "sha1", desc: "SHA1 hash", category: "hash", react: "🔒", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(crypto.createHash('sha1').update(q||"").digest('hex')))

cmd({pattern: "sha256", desc: "SHA256 hash", category: "hash", react: "🔒", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(crypto.createHash('sha256').update(q||"").digest('hex')))

cmd({pattern: "sha512", desc: "SHA512 hash", category: "hash", react: "🔒", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(crypto.createHash('sha512').update(q||"").digest('hex')))

cmd({pattern: "sha384", desc: "SHA384 hash", category: "hash", react: "🔒", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(crypto.createHash('sha384').update(q||"").digest('hex')))

cmd({pattern: "md4", desc: "MD4 hash", category: "hash", react: "🔒", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(crypto.createHash('md4').update(q||"").digest('hex')))

cmd({pattern: "ripemd", desc: "RIPEMD hash", category: "hash", react: "🔒", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(crypto.createHash('ripemd160').update(q||"").digest('hex')))

cmd({pattern: "hmac", desc: "HMAC", category: "hash", react: "🔑", filename: __filename},
async (conn, mek, m, { from, args, reply }) => reply(crypto.createHmac('sha256',args[0]||"").update(args[1]||"").digest('hex')))

cmd({pattern: "urlenc", desc: "URL encode", category: "hash", react: "🔗", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(encodeURIComponent(q||"")))

cmd({pattern: "urldec", desc: "URL decode", category: "hash", react: "🔗", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(decodeURIComponent(q||"")))

cmd({pattern: "escape", desc: "Escape string", category: "hash", react: "🏃", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(escape(q||"")))

cmd({pattern: "unescape", desc: "Unescape string", category: "hash", react: "🏃", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(unescape(q||"")))

cmd({pattern: "jsonparse", desc: "Parse JSON", category: "hash", react: "📦", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    try{reply(JSON.stringify(JSON.parse(q||"{}"),null,2))}catch{reply("Invalid JSON")}
})

cmd({pattern: "jsonstring", desc: "Stringify JSON", category: "hash", react: "📦", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(JSON.stringify(q||{})))

cmd({pattern: "base64url", desc: "Base64 URL safe", category: "hash", react: "🔐", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(Buffer.from(q||"").toString('base64url')))

cmd({pattern: "hexdump", desc: "Hex dump", category: "hash", react: "🔍", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(Buffer.from(q||"").toString('hex').match(/.{1,2}/g).join(' ')))

cmd({pattern: "binarydump", desc: "Binary dump", category: "hash", react: "💻", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply([...Buffer.from(q||"")].map(b=>b.toString(2).padStart(8,'0')).join(' ')))

cmd({pattern: "ascii", desc: "ASCII codes", category: "hash", react: "🔢", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply([...q||""].map(c=>c.charCodeAt(0)).join(' ')))

cmd({pattern: "charcode", desc: "Char from code", category: "hash", react: "🔤", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(String.fromCharCode(parseInt(q||0))))

cmd({pattern: "unicode", desc: "Unicode name", category: "hash", react: "🔤", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(q?`U+${q.charCodeAt(0).toString(16).toUpperCase()}`:""))

cmd({pattern: "crc32", desc: "CRC32 hash", category: "hash", react: "🔒", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(crypto.createHash('crc32').update(q||"").digest('hex')))

// ========== 81-100: DATE & TIME UTILS ==========
cmd({pattern: "epoch", desc: "Unix timestamp", category: "time", react: "⏰", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("⏰ " + Date.now()))

cmd({pattern: "isotime", desc: "ISO time", category: "time", react: "🕐", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🕐 " + new Date().toISOString()))

cmd({pattern: "utc", desc: "UTC time", category: "time", react: "🌍", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🌍 " + new Date().toUTCString()))

cmd({pattern: "timezone", desc: "Timezone", category: "time", react: "🌐", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("🌐 " + Intl.DateTimeFormat().resolvedOptions().timeZone))

cmd({pattern: "weekday", desc: "Weekday", category: "time", react: "📅", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📅 " + new Date().toLocaleDateString('en', {weekday:'long'})))

cmd({pattern: "month", desc: "Month name", category: "time", react: "📅", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📅 " + new Date().toLocaleDateString('en', {month:'long'})))

cmd({pattern: "year", desc: "Year", category: "time", react: "📅", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("📅 " + new Date().getFullYear()))

cmd({pattern: "leap", desc: "Leap year check", category: "time", react: "🗓️", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let y=parseInt(q||new Date().getFullYear())
    reply(y%4==0&&y%100!=0||y%400==0?"Leap year":"Not leap year")
})

cmd({pattern: "daynum", desc: "Day of year", category: "time", react: "📅", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    let now=new Date()
    let start=new Date(now.getFullYear(),0,0)
    reply("📅 Day: " + Math.floor((now-start)/86400000))
})

cmd({pattern: "weeknum", desc: "Week number", category: "time", react: "📅", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    let d=new Date()
    d.setHours(0,0,0,0)
    d.setDate(d.getDate()+3-(d.getDay()+6)%7)
    let week=1+Math.round(((d.getTime()-new Date(d.getFullYear(),0,4).getTime())/86400000-3)/7)
    reply("📅 Week: " + week)
})

cmd({pattern: "addday", desc: "Add days", category: "time", react: "➕", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let d=new Date(); d.setDate(d.getDate()+parseInt(q||0))
    reply("➕ " + d.toDateString())
})

cmd({pattern: "subday", desc: "Subtract days", category: "time", react: "➖", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let d=new Date(); d.setDate(d.getDate()-parseInt(q||0))
    reply("➖ " + d.toDateString())
})

cmd({pattern: "diffday", desc: "Days diff", category: "time", react: "📊", filename: __filename},
async (conn, mek, m, { from, args, reply }) => {
    let d1=new Date(args[0]), d2=new Date(args[1])
    reply("📊 " + Math.abs((d2-d1)/86400000)+" days")
})

cmd({pattern: "timestamp", desc: "Readable time", category: "time", react: "⏰", filename: __filename},
async (conn, mek, m, { from, q, reply }) => reply(new Date(parseInt(q||Date.now())).toLocaleString()))

cmd({pattern: "countdown", desc: "Countdown", category: "time", react: "⏳", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let target=new Date(q)
    let diff=target-Date.now()
    reply("⏳ " + Math.floor(diff/86400000)+" days left")
})

cmd({pattern: "age", desc: "Age calc", category: "time", react: "🎂", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    let birth=new Date(q)
    reply("🎂 Age: " + Math.floor((Date.now()-birth)/31536000000)+" years")
})

cmd({pattern: "timezoneconv", desc: "Convert timezone", category: "time", react: "🌐", filename: __filename},
async (conn, mek, m, { from, q, reply }) => {
    reply(new Date().toLocaleString('en-US',{timeZone:q||'Asia/Colombo'}))
})

cmd({pattern: "daylight", desc: "Daylight check", category: "time", react: "☀️", filename: __filename},
async (conn, mek, m, { from, reply }) => {
    let jan=new Date(new Date().getFullYear(),0,1)
    let jul=new Date(new Date().getFullYear(),6,1)
    reply(Math.abs(jan.getTimezoneOffset())!=Math.abs(jul.getTimezoneOffset())?"DST active":"No DST")
})

cmd({pattern: "millis", desc: "Milliseconds", category: "time", react: "⏱️", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("⏱️ " + Date.now()+"ms"))

cmd({pattern: "seconds", desc: "Seconds since epoch", category: "time", react: "⏱️", filename: __filename},
async (conn, mek, m, { from, reply }) => reply("⏱️ " + Math.floor(Date.now()/1000)+"s"))
