#!/usr/bin/env python3
"""
Genereer sitemap.xml + robots.txt voor lofibuddha.com.

Routes:
- Statische app-pagina's (/, /today, /explore, /library, /ai, /mindfulness, ...)
- Dynamisch: /music/<id> (uit packages/shared/src/music.ts), /category/<id>,
  /course/<slug> (uit /api/courses/public), /legal/*
- Next.js marketing: /mindfulness, /browse, /learn, /podcast

Output: mobile/public/sitemap.xml + mobile/public/robots.txt
(nginx root = mobile/dist; try_files $uri serveert ze direct na `expo export`.)

Her-draaien na content-wijziging: python3 scripts/generate-sitemap.py
"""
import re, os, sys, subprocess, json, datetime, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://lofibuddha.com"
OUT_DIR = os.path.join(ROOT, "mobile", "public")

# --- 1. muziek-track id's uit shared/music.ts ---
music_ts = open(os.path.join(ROOT, "packages", "shared", "src", "music.ts"), encoding="utf-8").read()
MUSIC_IDS = re.findall(r'id:\s*"([^"]+)"', music_ts)

# --- 2. courses uit de live API (slugs) ---
def fetch_courses():
    try:
        with urllib.request.urlopen(f"{SITE}/api/courses/public", timeout=10) as r:
            data = json.load(r)
        courses = data.get("courses", data) if isinstance(data, dict) else data
        return [c["slug"] for c in courses if c.get("slug")]
    except Exception as e:
        print(f"  ⚠️ courses API niet bereikbaar ({e}) — fallback op vaste slugs")
        return ["beginners-mindfulness", "yoga-foundations", "breathwork-essentials", "lofi-deep-focus"]

COURSES = fetch_courses()
CATEGORIES = ["focus", "breathe", "sleep", "relax"]

# --- 3. URL-lijst opbouwen ---
# (path, changefreq, priority)
urls = [
    ("/", "daily", "1.0"),
    ("/today", "daily", "0.9"),
    ("/explore", "daily", "0.9"),
    ("/library", "daily", "0.9"),
    ("/ai", "weekly", "0.8"),
    ("/mindfulness", "weekly", "0.8"),
    ("/browse", "weekly", "0.7"),
    ("/learn", "weekly", "0.7"),
    ("/podcast", "weekly", "0.7"),
]
for cat in CATEGORIES:
    urls.append((f"/category/{cat}", "weekly", "0.8"))
for slug in COURSES:
    urls.append((f"/course/{slug}", "weekly", "0.7"))
for mid in MUSIC_IDS:
    urls.append((f"/music/{mid}", "weekly", "0.7"))
for p in ("/legal", "/legal/privacy", "/legal/terms", "/legal/disclaimer"):
    urls.append((p, "yearly", "0.3"))

today = datetime.date.today().isoformat()

# --- 4. sitemap.xml schrijven ---
lines = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for path, freq, prio in urls:
    lines.append("  <url>")
    lines.append(f"    <loc>{SITE}{path}</loc>")
    lines.append(f"    <lastmod>{today}</lastmod>")
    lines.append(f"    <changefreq>{freq}</changefreq>")
    lines.append(f"    <priority>{prio}</priority>")
    lines.append("  </url>")
lines.append("</urlset>")

os.makedirs(OUT_DIR, exist_ok=True)
sitemap_path = os.path.join(OUT_DIR, "sitemap.xml")
open(sitemap_path, "w", encoding="utf-8").write("\n".join(lines) + "\n")

# --- 5. robots.txt schrijven ---
robots = f"""User-agent: *
Allow: /

# Disallow app-interne / niet-indexeerbare routes
Disallow: /auth/
Disallow: /login
Disallow: /signup
Disallow: /account
Disallow: /app
Disallow: /studio
Disallow: /social
Disallow: /settings
Disallow: /subscribers
Disallow: /analytics
Disallow: /newsletter
Disallow: /hermes
Disallow: /video
Disallow: /sounds
Disallow: /images
Disallow: /content
Disallow: /player/
Disallow: /cancel
Disallow: /success

Sitemap: {SITE}/sitemap.xml
"""
open(os.path.join(OUT_DIR, "robots.txt"), "w", encoding="utf-8").write(robots)

print(f"✅ {sitemap_path} — {len(urls)} URL's "
      f"({len(MUSIC_IDS)} music, {len(CATEGORIES)} categorieën, {len(COURSES)} courses)")
print(f"✅ {os.path.join(OUT_DIR, 'robots.txt')}")
