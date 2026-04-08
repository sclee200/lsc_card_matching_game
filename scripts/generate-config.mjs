import fs from "node:fs";
import path from "node:path";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const leaderboardLimit = Number(process.env.LEADERBOARD_LIMIT || "10");

const targetPath = path.join(process.cwd(), "src", "config.js");

const content = `window.__APP_CONFIG__ = {
  supabaseUrl: ${JSON.stringify(supabaseUrl)},
  supabaseAnonKey: ${JSON.stringify(supabaseAnonKey)},
  leaderboardLimit: ${Number.isFinite(leaderboardLimit) ? leaderboardLimit : 10}
};
`;

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, content, "utf8");

console.log(`Generated ${targetPath}`);
