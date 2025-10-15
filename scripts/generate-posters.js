// scripts/generate-posters.js
// שימוש:
//   node scripts/generate-posters.js --type reels
//   node scripts/generate-posters.js --type stories
//   node scripts/generate-posters.js --src src/assets/custom --type custom --overwrite --json
//
// יוצר פוסטר JPG עבור כל וידאו ומייצר קובץ JSON במבנה {src, poster}

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { execFile } = require("child_process");

// === קריאת פרמטרים מהפקודה ===
const args = process.argv.slice(2);
const getFlag = (name, def) => {
  const i = args.findIndex((a) => a === `--${name}`);
  if (i === -1) return def;
  const val = args[i + 1];
  if (!val || val.startsWith("--")) return true;
  return val;
};

// === קביעת סוג ומיקום ברירת מחדל ===
const TYPE = getFlag("type", "reels"); // reels | stories | custom
const SRC_DIR = path.resolve(getFlag("src", `src/assets/${TYPE}`));
const POSTERS_DIR = path.join(SRC_DIR, "posters");
const TS = getFlag("ts", "00:00:00.2"); // מאיזה זמן לקחת פריים
const WIDTH = parseInt(getFlag("width", "540"), 10); // רוחב פוסטר
const QUALITY = parseInt(getFlag("quality", "3"), 10); // 2-31 (נמוך=איכות גבוהה)
const OVERWRITE = !!getFlag("overwrite", false);
const WRITE_JSON = !!getFlag("json", true);

const exts = new Set([".mp4", ".mov", ".m4v", ".webm"]);

async function ensureDir(dir) {
  try {
    await fsp.mkdir(dir, { recursive: true });
  } catch (e) {
    console.warn("⚠️ Failed to ensure dir:", dir, e.message);
  }
}

function runFFmpeg(input, output) {
  return new Promise((resolve, reject) => {
    const args = [
      "-hide_banner",
      "-loglevel", "error",
      "-ss", TS,
      "-i", input,
      "-frames:v", "1",
      "-vf", `scale=${WIDTH}:-1`,
      "-q:v", String(QUALITY),
    ];
    if (OVERWRITE) args.push("-y"); else args.push("-n");
    args.push(output);

    execFile("ffmpeg", args, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

(async () => {
  try {
    await fsp.access(SRC_DIR);
    await ensureDir(POSTERS_DIR);

    const files = await fsp.readdir(SRC_DIR);
    const videos = files.filter((f) => exts.has(path.extname(f).toLowerCase()));

    const results = [];

    for (const f of videos) {
      const inAbs = path.join(SRC_DIR, f);
      const base = f.replace(/\.[^.]+$/, "");
      const outFile = `${base}.jpg`;
      const outAbs = path.join(POSTERS_DIR, outFile);

      try {
        if (!OVERWRITE) {
          // אם כבר קיים פוסטר – דלג
          await fsp.access(outAbs);
          console.log(`✅ Poster already exists for ${TYPE}/${f}`);
        } else {
          console.log(`🎥 Regenerating poster for ${TYPE}/${f}`);
          await runFFmpeg(inAbs, outAbs);
        }
      } catch {
        console.log(`🎥 Generating poster for: ${TYPE}/${f}`);
        await runFFmpeg(inAbs, outAbs).catch((e) => {
          console.warn(`⚠️ Failed poster for ${TYPE}/${f}:`, e.message);
        });
      }

      // הוסף לרשימת התוצאות (נתיבים יחסיים לדפדפן)
      results.push({
        src: path.posix.join("assets", TYPE, f),
        poster: path.posix.join("assets", TYPE, "posters", outFile),
      });
    }

    if (WRITE_JSON) {
      const jsonPath = path.join(SRC_DIR, `${TYPE}.json`);
      await fsp.writeFile(jsonPath, JSON.stringify(results, null, 2), "utf8");
      console.log(`✅ [${TYPE}] Wrote ${results.length} entries to ${jsonPath}`);
    } else {
      console.log(`✅ Posters generated. JSON not requested (--json to enable).`);
    }

    console.log("✨ Done.");
  } catch (e) {
    console.error("❌ Error:", e.message);
    process.exit(1);
  }
})();
