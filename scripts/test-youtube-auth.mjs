import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";

// Keys uit de systemd unit halen (standalone server laadt geen .env)
const envOut = execSync("systemctl show lofibuddha -p Environment").toString();
const get = (k) => {
  const m = envOut.match(new RegExp(k + "=([^\\s]+)"));
  return m ? m[1] : "";
};
const cId = get("GOOGLE_CLIENT_ID");
const cSec = get("GOOGLE_CLIENT_SECRET");

// De standalone server draait met cwd = .next/standalone, dus de runtime tokens
// staan in .next/standalone/data/youtube-tokens.json (niet de project-root data/).
const tokensPath = ".next/standalone/data/youtube-tokens.json";
if (!existsSync(tokensPath)) {
  console.log("Runtime tokens file niet gevonden:", tokensPath);
  process.exit(1);
}
const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
const refreshToken = tokens.refresh_token || "";

console.log("client_id present:", !!cId);
console.log("client_secret present:", !!cSec);
console.log("refresh_token present:", !!refreshToken);

if (!cId || !cSec || !refreshToken) {
  console.log("RESULT: NIET VERBONDEN (ontbrekende creds)");
  process.exit(0);
}

const res = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: cId, client_secret: cSec,
    refresh_token: refreshToken, grant_type: "refresh_token",
  }),
});
const data = await res.json();

if (!data.access_token) {
  console.log("RESULT: REFRESH MISLUKT →", data.error, "-", data.error_description || "");
  process.exit(0);
}

console.log("RESULT: REFRESH OK — nieuwe access_token, expires_in", data.expires_in, "s");

// Channel info ophalen om te bevestigen welk kanaal
const ch = await fetch(
  "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
  { headers: { Authorization: "Bearer " + data.access_token } }
);
const chd = await ch.json();
if (chd.items?.[0]) {
  console.log("CHANNEL:", chd.items[0].snippet.title);
  console.log("CHANNEL ID:", chd.items[0].id);
} else {
  console.log("CHANNEL: kon niet ophalen:", JSON.stringify(chd.error || chd).substring(0, 200));
}

// Persist ververste token naar BEIDE locaties (runtime + source) zodat ze in sync blijven
tokens.access_token = data.access_token;
tokens.expires_at = Date.now() + (data.expires_in || 3600) * 1000;
writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
if (existsSync("data/youtube-tokens.json")) {
  writeFileSync("data/youtube-tokens.json", JSON.stringify(tokens, null, 2));
}
console.log("Token ververst en opgeslagen (runtime + source)");
