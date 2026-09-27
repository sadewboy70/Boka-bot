const { cmd } = require('../command');

// In-memory store: { [pollId]: pollObject }
const activePolls = {};

// ── CREATE POLL ──────────────────────────────────────
cmd({
    pattern: "poll",
    desc: "Create a voting poll",
    category: "group",
    react: "📊",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    sender,
    reply,
    isGroup
}) => {

    try {

        if (!q) {
            return reply(
`╔═══════════════════════╗
   📊 *DCT POLL CREATOR*
╚═══════════════════════╝

📌 *Usage:*
.poll Question | Option1 | Option2 | Option3

📌 *Example:*
.poll Best color? | Red | Blue | Green`
            );
        }

        const parts = q.split("|").map(p => p.trim()).filter(Boolean);

        if (parts.length < 3) {
            return reply("❌ Need at least *1 question* and *2 options*.\n\nExample: .poll Best color? | Red | Blue");
        }

        const question = parts[0];
        const options = parts.slice(1);

        if (options.length > 8) {
            return reply("❌ Maximum *8 options* allowed.");
        }

        const pollId = `${from}_${Date.now()}`;
        const numEmojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣"];

        activePolls[pollId] = {
            question,
            options,
            votes: {},        // { sender: optionIndex }
            createdBy: sender,
            from,
            createdAt: Date.now(),
            closed: false
        };

        // Save pollId in group store so vote command knows which poll is active
        // Use from (group jid) as key for latest poll
        activePolls[`latest_${from}`] = pollId;

        let optionLines = options.map((opt, i) =>
            `  ${numEmojis[i]}  ${opt}`
        ).join("\n");

        await conn.sendMessage(from, {
            text:
`✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦
📊 *NEW POLL STARTED!*
✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦

❓ *${question}*

━━━━━━━━━━━━━━━━━━━━━━━
${optionLines}
━━━━━━━━━━━━━━━━━━━━━━━

🗳️ *How to vote:*
  └ *.vote 1*  to vote for option 1
  └ *.vote 2*  to vote for option 2

📌 *See results:* *.presults*
🔒 *Close poll:* *.pclose* _(creator only)_

> ⚡ *DCT MINI BOT* | dct.fwh.is`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Failed to create poll: " + e.message);
    }
});


// ── VOTE ─────────────────────────────────────────────
cmd({
    pattern: "vote",
    desc: "Vote in active poll",
    category: "group",
    react: "🗳️",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    sender,
    reply
}) => {

    try {

        const pollId = activePolls[`latest_${from}`];

        if (!pollId || !activePolls[pollId]) {
            return reply("❌ No active poll in this group.\nCreate one with *.poll*");
        }

        const poll = activePolls[pollId];

        if (poll.closed) {
            return reply("🔒 This poll is already *closed*.");
        }

        const choice = parseInt(q?.trim());

        if (isNaN(choice) || choice < 1 || choice > poll.options.length) {
            return reply(`❌ Vote with a number between *1* and *${poll.options.length}*\n\nExample: *.vote 1*`);
        }

        const prevVote = poll.votes[sender];
        poll.votes[sender] = choice - 1;

        const numEmojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣"];

        if (prevVote !== undefined && prevVote !== choice - 1) {
            // Changed vote
            await conn.sendMessage(from, {
                react: { text: "🔄", key: mek.key }
            });
            return reply(
`🔄 *Vote changed!*

  ${numEmojis[prevVote]} ~~${poll.options[prevVote]}~~
  ➜ ${numEmojis[choice-1]} *${poll.options[choice-1]}*`
            );
        }

        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

        reply(
`✅ *Vote recorded!*

  └ ${numEmojis[choice-1]} *${poll.options[choice-1]}*

📊 See results: *.presults*`
        );

    } catch (e) {
        console.log(e);
        reply("❌ Vote failed: " + e.message);
    }
});


// ── RESULTS ──────────────────────────────────────────
cmd({
    pattern: "presults",
    alias: ["pollresults", "pvotes"],
    desc: "Show poll results",
    category: "group",
    react: "📊",
    filename: __filename
},
async (conn, mek, m, {
    from,
    reply
}) => {

    try {

        const pollId = activePolls[`latest_${from}`];

        if (!pollId || !activePolls[pollId]) {
            return reply("❌ No active poll in this group.");
        }

        const poll = activePolls[pollId];
        const totalVotes = Object.keys(poll.votes).length;
        const numEmojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣"];

        // Count votes per option
        const counts = new Array(poll.options.length).fill(0);
        for (let v of Object.values(poll.votes)) {
            counts[v]++;
        }

        // Build bar chart
        const buildBar = (count, total) => {
            if (total === 0) return "░░░░░░░░░░ 0%";
            const pct = Math.round((count / total) * 100);
            const filled = Math.round(pct / 10);
            const bar = "█".repeat(filled) + "░".repeat(10 - filled);
            return `${bar} ${pct}%`;
        };

        // Find winner(s)
        const maxVotes = Math.max(...counts);
        const winners = counts
            .map((c, i) => ({ i, c }))
            .filter(x => x.c === maxVotes && maxVotes > 0)
            .map(x => x.i);

        let resultLines = poll.options.map((opt, i) => {
            const isWinner = winners.includes(i) && !poll.closed === false || winners.includes(i);
            return `${numEmojis[i]} *${opt}*${isWinner && totalVotes > 0 ? " 👑" : ""}
  └ ${buildBar(counts[i], totalVotes)} _(${counts[i]} votes)_`;
        }).join("\n\n");

        await conn.sendMessage(from, {
            text:
`✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦
📊 *POLL RESULTS*${poll.closed ? " 🔒 *[CLOSED]*" : " 🟢 *[LIVE]*"}
✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦

❓ *${poll.question}*

━━━━━━━━━━━━━━━━━━━━━━━
${resultLines}
━━━━━━━━━━━━━━━━━━━━━━━

👥 *Total Votes:* ${totalVotes}
${poll.closed ? "🔒 *Poll is closed*" : "🗳️ Vote: *.vote 1/2/3...*"}

> ⚡ *DCT MINI BOT* | dct.fwh.is`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Failed to get results: " + e.message);
    }
});


// ── CLOSE POLL ───────────────────────────────────────
cmd({
    pattern: "pclose",
    alias: ["pollclose", "endpoll"],
    desc: "Close active poll",
    category: "group",
    react: "🔒",
    filename: __filename
},
async (conn, mek, m, {
    from,
    sender,
    reply
}) => {

    try {

        const pollId = activePolls[`latest_${from}`];

        if (!pollId || !activePolls[pollId]) {
            return reply("❌ No active poll in this group.");
        }

        const poll = activePolls[pollId];

        if (poll.closed) {
            return reply("🔒 Poll is already closed.");
        }

        if (poll.createdBy !== sender) {
            return reply("❌ Only the *poll creator* can close this poll.");
        }

        poll.closed = true;

        const totalVotes = Object.keys(poll.votes).length;
        const counts = new Array(poll.options.length).fill(0);
        for (let v of Object.values(poll.votes)) counts[v]++;

        const maxVotes = Math.max(...counts);
        const numEmojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣"];

        const winnerIdxs = counts
            .map((c, i) => ({ i, c }))
            .filter(x => x.c === maxVotes && maxVotes > 0)
            .map(x => x.i);

        const winnerText = winnerIdxs.length > 0
            ? winnerIdxs.map(i => `${numEmojis[i]} *${poll.options[i]}*`).join(" & ")
            : "No votes cast";

        await conn.sendMessage(from, {
            text:
`✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦
🔒 *POLL CLOSED!*
✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦

❓ *${poll.question}*

━━━━━━━━━━━━━━━━━━━━━━━
🏆 *WINNER${winnerIdxs.length > 1 ? "S" : ""}:*
  ${winnerText}
━━━━━━━━━━━━━━━━━━━━━━━

👥 *Total Votes:* ${totalVotes}

📊 Full results: *.presults*

> ⚡ *DCT MINI BOT* | dct.fwh.is`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Failed to close poll: " + e.message);
    }
});
