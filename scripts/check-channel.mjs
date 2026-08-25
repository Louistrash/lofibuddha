import { execSync } from "child_process";
import { readFileSync } from "fs";

// Keys uit systemd unit
const envOut = execSync("systemctl show lofibuddha -p Environment").toString();
const get = (k) => (envOut.match(new RegExp(k + "=([^\\s]+)")) || [])[1] || "";
const cId = get("GOOGLE_CLIENT_ID");
const cSec = get("GOOGLE_CLIENT_SECRET");

// Runtime tokens (cwd = .next/standalone)
const tokensPath = ".next/standalone/data/youtube-tokens.json";
const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
console.log("token connected:", tokens.connected, "| refreshed at:", new Date(tokens.expires_at || 0).toISOString());

// Refresh
const tr = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ client_id: cId, client_secret: cSec, refresh_token: tokens.refresh_token, grant_type: "refresh_token" }),
});
const td = await tr.json();
if (!td.access_token) {
  console.log("REFRESH MISLUKT:", td.error, td.error_description || "");
  process.exit(0);
}
console.log("REFRESH OK");

// Channel ID ophalen (mine=true — vereist read-scope, kan 403 geven)
const ch = await fetch("https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true",
  { headers: { Authorization: "Bearer " + td.access_token } });
const chd = await ch.json();
if (chd.items?.[0]) {
  console.log("CHANNEL (mine=true):", chd.items[0].id, "—", chd.items[0].snippet?.title);
} else {
  console.log("channels.list mine=true:", chd.error?.code, chd.error?.message || "(geen read-scope)");
}

// Fallback: test-upload van de kleinste promo om het channelId uit de insert-response te halen
console.log("\n=== test-upload promo-sleep.mp4 om channelId te bepalen ===");
import { existsSync } from "fs";
const videoPath = ".next/standalone/public/videos/promos/promo-sleep.mp4";
if (!existsSync(videoPath)) { console.log("video niet gevonden:", videoPath); process.exit(0); }
const videoBuffer = readFileSync(videoPath);

const boundary = "BODHI-" + Date.now();
const CRLF = "\r\n";
const metadata = {
  snippet: { title: "CHANNEL-CHECK (delete me)", description: "channel check", tags: ["test"], categoryId: "22" },
  status: { privacyStatus: "private" },
};
const body = Buffer.concat([
  Buffer.from("--" + boundary + CRLF + "Content-Type: application/json; charset=UTF-8" + CRLF + CRLF + JSON.stringify(metadata) + CRLF),
  Buffer.from("--" + boundary + CRLF + "Content-Type: video/mp4" + CRLF + CRLF),
  videoBuffer,
  Buffer.from(CRLF + "--" + boundary + "--" + CRLF),
]);
const up = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status", {
  method: "POST",
  headers: { Authorization: "Bearer " + td.access_token, "Content-Type": "multipart/related; boundary=" + boundary, "Content-Length": String(body.length) },
  body,
});
const upd = await up.json();
if (upd.snippet) {
  console.log("UPLOAD NAAR KANAAL:", upd.snippet.channelId, "—", upd.snippet.channelTitle);
} else {
  console.log("upload error:", JSON.stringify(upd.error || upd).substring(0, 300));
}
