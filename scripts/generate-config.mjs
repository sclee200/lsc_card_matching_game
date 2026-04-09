import fs from "node:fs";
import path from "node:path";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const leaderboardLimit = Number(process.env.LEADERBOARD_LIMIT || "10");

const root = process.cwd();
const targetPath = path.join(root, "src", "config.js");
const publicDir = path.join(root, "public");

const content = `window.__APP_CONFIG__ = {
  supabaseUrl: ${JSON.stringify(supabaseUrl)},
  supabaseAnonKey: ${JSON.stringify(supabaseAnonKey)},
  leaderboardLimit: ${Number.isFinite(leaderboardLimit) ? leaderboardLimit : 10}
};
`;

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, content, "utf8");

// Vercel is configured to expect a "public" output directory.
// Build a deployable static bundle there.
fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(publicDir, "index.html"));
fs.copyFileSync(path.join(root, "styles.css"), path.join(publicDir, "styles.css"));
fs.cpSync(path.join(root, "src"), path.join(publicDir, "src"), { recursive: true });

console.log(`Generated ${targetPath}`);
console.log(`Prepared static output at ${publicDir}`);
