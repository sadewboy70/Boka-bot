const { cmd } = require('../command');
const axios = require('axios');
const fsSync = require('fs');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const moment = require('moment-timezone');
const ffmpegPath = require('ffmpeg-static');

// ──────────────────────────────────────────────
// 1. TIKTOK VIDEO DOWNLOADER (.tiktok / .tt)
// ──────────────────────────────────────────────
cmd({
    pattern: "tiktok",
    alias: ["tt"],
    react: "📥",
    desc: "Download TikTok videos (No Watermark)",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const query = args[0];
        if (!query) return reply("🔗 *ᴘʟᴇᴀꜱᴇ ꜱᴇɴᴅ ᴀ ᴛɪᴋᴛᴏᴋ ʟɪɴᴋ!*");

        const tiktokRegex = /(tiktok\.com|vt\.tiktok\.com)/;
        if (!tiktokRegex.test(query)) {
            return reply("❌ *ɪɴᴠᴀʟɪᴅ ᴛɪᴋᴛᴏᴋ ʟɪɴᴋ!*");
        }

        const fetchTikwmData = async (url) => {
            for (let i = 1; i <= 3; i++) {
                try {
                    const res = await axios.get("https://www.tikwm.com/api/", { 
                        params: { url, hd: 1 }, 
                        headers: { "User-Agent": "Mozilla/5.0" }
                    });
                    if (res.data?.code === 0) return res.data;
                } catch (e) { 
                    if (i < 3) await new Promise(r => setTimeout(r, 2000)); 
                }
            }
            throw new Error("API Blocked");
        };

        let data;
        try {
            data = await fetchTikwmData(query);
        } catch (err) {
            return reply("❌ *ᴀᴘɪ ᴇʀʀᴏʀ: ᴜɴᴀʙʟᴇ ᴛᴏ ꜰᴇᴛᴄʜ ᴅᴀᴛᴀ ʀɪɢʜᴛ ɴᴏᴡ.*");
        }

        let videoUrl = data.data.hdplay || data.data.play;
        if (!videoUrl) return reply("❌ *ᴠɪᴅᴇᴏ ʟɪɴᴋ ɴᴏᴛ ꜰᴏᴜɴᴅ!*");

        if (!videoUrl.startsWith('http')) {
            videoUrl = `https://www.tikwm.com${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
        }

        const isHD = !!data.data.hdplay;
        const channelName = data.data.author?.nickname || "ᴜɴᴋɴᴏᴡɴ ᴄʜᴀɴɴᴇʟ";
        const title = data.data.title || "ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ";
        const views = data.data.play_count || 0;
        const likes = data.data.digg_count || 0;

        let fileSizeMB = 'ᴜɴᴋɴᴏᴡɴ';
        let fileSizeBytes = data.data.hd_size || data.data.size || 0;
        if (fileSizeBytes) {
            fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
        }

        const hdStatusText = isHD ? "ʜᴅ 1080ᴘ ✅" : "ɴᴏʀᴍᴀʟ ⚠️️";

        const caption = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ 🎐 ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ 🎐
┊
┊ 👤 ᴄʜᴀɴɴᴇʟ : ${channelName}
┊ 🎬 ᴛɪᴛʟᴇ : ${title}
┊ ✨ Qᴜᴀʟɪᴛʏ : ${hdStatusText}
┊ ⚖️ ꜱɪᴢᴇ : ${fileSizeMB} ᴍʙ
┊ 👁️ ᴠɪᴇᴡꜱ : ${views}
┊ ❤️ ʟɪᴋᴇꜱ : ${likes}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0 🎐`;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        const tempVideoPath = path.join(os.tmpdir(), `tiktok_${Date.now()}.mp4`);
        
        try {
            const responseStream = await axios({
                method: 'GET',
                url: videoUrl,
                responseType: 'stream',
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            const writer = fsSync.createWriteStream(tempVideoPath);
            responseStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            await conn.sendMessage(from, {
                video: fsSync.readFileSync(tempVideoPath),
                mimetype: 'video/mp4',
                caption: caption,
                fileName: `Sadew_Mini_${Date.now()}.mp4`
            }, { quoted: mek });

            if (fsSync.existsSync(tempVideoPath)) fsSync.unlinkSync(tempVideoPath);
        } catch (downloadErr) {
            if (fsSync.existsSync(tempVideoPath)) fsSync.unlinkSync(tempVideoPath);
            throw new Error("ꜰᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ");
        }

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        reply(`❌ *ᴇʀʀᴏʀ:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});


// ──────────────────────────────────────────────
// 2. TIKTOK PHOTO SLIDESHOW TO VIDEO (.ttp)
// ──────────────────────────────────────────────
cmd({
    pattern: "ttp",
    react: "📸",
    desc: "Convert TikTok Photos to Video",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        let query = args.join(' ');
        if (!query && mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
            query = mek.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
        }

        const extractUrl = (text) => {
            const match = String(text || "").match(/https?:\/\/[^\s]+/i);
            return match ? match[0].replace(/[),.]+$/, "") : "";
        };

        const tiktokUrl = extractUrl(query);
        const quality = "hd";

        if (!tiktokUrl) return reply("📸 *ᴘʟᴇᴀꜱᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛɪᴋᴛᴏᴋ ᴘʜᴏᴛᴏ ꜱʟɪᴅᴇꜱʜᴏᴡ ʟɪɴᴋ!*");
        if (!/tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/i.test(tiktokUrl)) {
            return reply("❌ *ɪɴᴠᴀʟɪᴅ ᴛɪᴋᴛᴏᴋ ʟɪɴᴋ!*");
        }

        reply("📥 _ᴘʀᴏᴄᴇꜱꜱɪɴɢ ᴘʜᴏᴛᴏ ꜱʟɪᴅᴇꜱʜᴏᴡ... ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ._ ⏳");

        const TIKWM_API = "https://www.tikwm.com/api/";
        const MAX_IMAGES = 30;
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const buildTikwmUrl = (url) => (!url ? "" : /^https?:\/\//i.test(url) ? url : `https://www.tikwm.com${url.startsWith("/") ? "" : "/"}${url}`);

        const fetchTikwmData = async (url) => {
            for (let i = 1; i <= 3; i++) {
                try {
                    const res = await axios.get(TIKWM_API, { params: { url, hd: 1 }, headers: { "User-Agent": "Mozilla/5.0" }});
                    if (res.data?.code === 0) return res.data;
                } catch (e) { if (i < 3) await sleep(2000); }
            }
            throw new Error("ᴜɴᴀʙʟᴇ ᴛᴏ ꜰᴇᴛᴄʜ ᴅᴀᴛᴀ ꜰʀᴏᴍ ᴀᴘɪ.");
        };

        const pickImages = (data) => {
            const root = data?.data || {};
            const lists = [root.images, root.image_post?.images];
            const set = new Set();
            for (const list of lists) {
                if (Array.isArray(list)) list.forEach(img => {
                    if (typeof img === 'string') set.add(buildTikwmUrl(img));
                    else if (img?.url || img?.display_image) set.add(buildTikwmUrl(img.url || img.display_image));
                });
            }
            return [...set].slice(0, MAX_IMAGES);
        };

        const downloadBuffer = async (url, isAudio = false) => {
            const res = await axios.get(url, { responseType: "arraybuffer", headers: { "User-Agent": "Mozilla/5.0" } });
            return { buffer: Buffer.from(res.data), type: isAudio ? ".mp3" : ".jpg" };
        };

        const getAudioDuration = (audioPath) => {
            return new Promise((resolve) => {
                const child = spawn(ffmpegPath, ["-i", audioPath]);
                let output = "";
                child.stderr.on("data", d => output += d);
                child.on("close", () => {
                    const match = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d+)/);
                    if (match) {
                        const hours = parseInt(match[1], 10);
                        const minutes = parseInt(match[2], 10);
                        const seconds = parseFloat(match[3]);
                        resolve((hours * 3600) + (minutes * 60) + seconds);
                    } else {
                        resolve(15); 
                    }
                });
                child.on("error", () => resolve(15));
            });
        };

        const runCommand = (cmd, args) => {
            return new Promise((resolve, reject) => {
                const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
                let out = ""; child.stdout.on("data", d => out += d);
                let err = ""; child.stderr.on("data", d => err += d);

                const timer = setTimeout(() => {
                    child.kill('SIGKILL');
                    reject(new Error("FFmpeg Process Timeout!"));
                }, 180000);

                child.on("close", code => {
                    clearTimeout(timer);
                    code === 0 ? resolve(out) : reject(new Error(`FFmpeg Failed`));
                });
                child.on("error", (e) => {
                    clearTimeout(timer);
                    reject(new Error(`FFmpeg error: ${e.message}`));
                });
            });
        };

        const createVideo = async (imagePaths, audioPath, outPath, qlty) => {
            const profile = { w: 720, h: 1280 };
            const scaleFilter = `scale=${profile.w}:${profile.h}:force_original_aspect_ratio=decrease,pad=${profile.w}:${profile.h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,format=yuv420p`;

            const listPath = path.join(path.dirname(outPath), "images.txt");
            let listBody = "";

            if (imagePaths.length === 1) {
                listBody += `file '${imagePaths[0].replace(/\\/g, "/")}'\n`;
                listBody += `duration 600.000\n`; 
                listBody += `file '${imagePaths[0].replace(/\\/g, "/")}'\n`;
            } else {
                let audioDuration = await getAudioDuration(audioPath);
                if (!audioDuration || audioDuration <= 0) audioDuration = 15; 

                const eachDuration = audioDuration / imagePaths.length;
                for (let i = 0; i < imagePaths.length; i++) {
                    listBody += `file '${imagePaths[i].replace(/\\/g, "/")}'\n`;
                    if (i === imagePaths.length - 1) {
                        listBody += `duration 600.000\n`; 
                    } else {
                        listBody += `duration ${eachDuration.toFixed(3)}\n`;
                    }
                }
                listBody += `file '${imagePaths[imagePaths.length - 1].replace(/\\/g, "/")}'\n`;
            }

            await fs.writeFile(listPath, listBody);

            await runCommand(ffmpegPath, [
                "-y", "-f", "concat", "-safe", "0", "-i", listPath, "-i", audioPath,
                "-vf", scaleFilter,
                "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
                "-c:a", "aac", "-shortest", "-fflags", "+genpts", "-movflags", "+faststart", outPath
            ]);
            return profile;
        };

        const result = await fetchTikwmData(tiktokUrl);
        const images = pickImages(result);
        const audioUrl = buildTikwmUrl(result.data?.music_info?.play || result.data?.music);

        if (!images.length || !audioUrl) throw new Error("ɴᴏᴛ ᴀ ᴘʜᴏᴛᴏ ꜱʟɪᴅᴇꜱʜᴏᴡ ᴏʀ ᴀᴜᴅɪᴏ ᴍɪꜱꜱɪɴɢ.");

        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "sadew-ttp-"));
        let finalVideoBuffer;
        let videoMeta;

        try {
            const imagePaths = [];
            for (let i = 0; i < images.length; i++) {
                const img = await downloadBuffer(images[i], false);
                const p = path.join(tmpDir, `img${i}${img.type}`);
                await fs.writeFile(p, img.buffer);
                imagePaths.push(p);
            }
            const aud = await downloadBuffer(audioUrl, true);
            const audPath = path.join(tmpDir, `aud${aud.type}`);
            await fs.writeFile(audPath, aud.buffer);

            const outPath = path.join(tmpDir, "out.mp4");
            videoMeta = await createVideo(imagePaths, audPath, outPath, quality);
            finalVideoBuffer = await fs.readFile(outPath);
        } finally {
            await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
        }

        const fileSizeMB = (finalVideoBuffer.length / (1024 * 1024)).toFixed(2);

        const caption = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┊ 🎐 ᴛɪᴋᴛᴏᴋ ᴘʜᴏᴛᴏ ꜱʟɪᴅᴇ 🎐
┊
┊ 📸 ɪᴍᴀɢᴇꜱ : ${images.length}
┊ 📺 ʀᴇꜱᴏʟᴜᴛɪᴏɴ : ${videoMeta.w}x${videoMeta.h}
┊ ⚖️ ꜱɪᴢᴇ : ${fileSizeMB} ᴍʙ
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

> ꜱᴀᴅᴇᴡ ᴍɪɴɪ ᴠ1.0 🎐`;

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        await conn.sendMessage(from, {
            video: finalVideoBuffer,
            mimetype: 'video/mp4',
            caption: caption,
            fileName: `Sadew_TTP_${Date.now()}.mp4`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log("TTP CMD ERROR:", e);
        reply(`❌ *ᴇʀʀᴏʀ:* ${e.message || "Unknown error"}\n\nᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɴᴏᴛʜᴇʀ ʟɪɴᴋ!`);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
