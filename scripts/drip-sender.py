#!/usr/bin/env python3
"""
LofiBuddha drip email sender (Resend).

Stuurt de dag-N drip-mail naar elke actieve abonnee die dag N nieuw heeft
bereikt. Draait dagelijks via cron.

Modes:
  (geen args)       -> normale run: verstuur alle due drip-mails
  --dry-run          -> toon wat er verstuurd zou worden, zonder te versturen
  --test --day N --email X [--tier mindful|enlightened]
                     -> verstuur 1 specifieke dag-mail naar 1 adres (voor preview)

Tracking staat in data/drip-sent.json (persistent, overleeft builds).
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

ROOT = "/opt/data/bodhi-dashboard"
RUNTIME_DATA = os.path.join(ROOT, ".next", "standalone", "data")
SRC_DATA = os.path.join(ROOT, "data")
TRACKING_FILE = os.path.join(SRC_DATA, "drip-sent.json")

BASE_URL = "https://lofibuddha.com"
FROM = "LofiBuddha <buddha@lofibuddha.com>"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"

# Scheduled drip days per tier (matches data/drip-content.json "days" keys)
SCHEDULE = {
    "mindful": [1, 2, 3, 5, 7, 9, 12, 16, 19, 23, 26],
    "enlightened": [1, 3, 7, 14, 21, 28],
}


def get_key(name):
    for pat in (name + '="[^"]*"', name + '=[^ ]*'):
        try:
            out = subprocess.check_output(
                ["grep", "-oE", pat, "/etc/systemd/system/lofibuddha.service"]
            )
            v = out.decode().strip().split("=", 1)[1].strip('"')
            if v:
                return v
        except Exception:
            pass
    return ""


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def read_subscribers():
    # runtime copy is where the Stripe webhook writes real subscribers
    for p in (os.path.join(RUNTIME_DATA, "subscribers.json"),
              os.path.join(SRC_DATA, "subscribers.json")):
        data = load_json(p, [])
        if data:
            return data
    return []


def read_drip_content():
    for p in (os.path.join(RUNTIME_DATA, "drip-content.json"),
              os.path.join(SRC_DATA, "drip-content.json")):
        data = load_json(p, {})
        if data:
            return data
    return {}


def read_tracking():
    return load_json(TRACKING_FILE, {})


def write_tracking(t):
    os.makedirs(os.path.dirname(TRACKING_FILE), exist_ok=True)
    with open(TRACKING_FILE, "w", encoding="utf-8") as f:
        json.dump(t, f, indent=2)


def calculate_drip_day(sub):
    start = sub.get("startDate")
    if start:
        try:
            d = datetime.fromisoformat(str(start).replace("Z", "+00:00"))
            if d.tzinfo is None:
                d = d.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            return max(1, int((now - d).total_seconds() // 86400) + 1)
        except Exception:
            pass
    return int(sub.get("dripDay") or 1)


def md_to_html(text):
    """Lightweight markdown -> HTML: **bold**, \n\n paragraphs, numbered lists."""
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text or "")
    out = []
    buf = []

    def flush():
        nonlocal buf
        if buf:
            if all(re.match(r"^\d+\.\s", l) for l in buf):
                items = "".join(
                    '<li style="margin:0 0 6px">'
                    + re.sub(r"^\d+\.\s*", "", l)
                    + "</li>"
                    for l in buf
                )
                out.append(
                    '<ol style="margin:0 0 16px;padding-left:20px;color:#d4c8b8">'
                    + items + "</ol>"
                )
            else:
                out.append(
                    '<p style="margin:0 0 16px;color:#d4c8b8">'
                    + "<br>".join(buf) + "</p>"
                )
            buf = []

    for line in text.split("\n"):
        if not line.strip():
            flush()
            continue
        buf.append(line)
    flush()
    return "".join(out)


def drip_html(tier, tier_title, day, item, subscriber_email):
    title = item.get("title", "")
    subtitle = item.get("subtitle", "")
    body = item.get("body", "")
    duration = item.get("duration", "")
    action = item.get("action")
    download = item.get("download")

    action_html = ""
    if action and action.get("url"):
        url = action["url"]
        if url.startswith("/"):
            url = BASE_URL + url
        action_html = (
            '<tr><td style="padding:16px 40px 8px;text-align:center">'
            f'<a href="{url}" style="display:inline-block;background:linear-gradient(135deg,#c49464,#a0784c);'
            'color:#fff;text-decoration:none;padding:14px 32px;border-radius:30px;'
            'font-size:14px;font-weight:600;letter-spacing:1px">'
            f'{action.get("label", "Continue")}</a></td></tr>'
        )

    download_html = ""
    if download and download.get("url"):
        url = download["url"]
        if url.startswith("/"):
            url = BASE_URL + url
        download_html = (
            '<tr><td style="padding:4px 40px 16px;text-align:center">'
            f'<a href="{url}" style="display:inline-block;color:#c49464;text-decoration:none;'
            'font-size:13px;border:1px solid rgba(196,148,100,0.4);padding:10px 22px;border-radius:24px">'
            f'&#128196; {download.get("label", "Download PDF")}</a></td></tr>'
        )

    dur_badge = ""
    if duration:
        dur_badge = (
            f'<span style="display:inline-block;margin-top:8px;color:#9a9488;font-size:11px;'
            f'letter-spacing:1px;text-transform:uppercase">{duration}</span>'
        )

    unsub = f"{BASE_URL}/api/subscribers?action=unsubscribe&email={subscriber_email}"

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');</style></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1a1715;border-radius:16px;overflow:hidden;border:1px solid #3d362f">

<tr><td style="background:linear-gradient(135deg,#2a2318,#1a1715);padding:32px 40px;text-align:center">
<img src="https://lofibuddha.com/images/brand/lofibuddha-icon.png" alt="LofiBuddha" width="72" height="72" style="width:72px;height:72px;display:block;margin:0 auto 16px">
<p style="margin:0;color:#c49464;font-size:10px;letter-spacing:3px;text-transform:uppercase">lofibuddha · {tier_title} · Day {day}</p>
<h1 style="margin:12px 0 0;color:#f0ebe0;font-size:24px;font-weight:700;line-height:1.25">{title}</h1>
{subtitle if subtitle else ''}
</td></tr>

<tr><td style="height:1px;background:linear-gradient(90deg,transparent,#c49464,transparent)"></td></tr>

<tr><td style="padding:32px 40px 8px;font-size:16px;line-height:1.65">{md_to_html(body)}</td></tr>
<tr><td style="padding:0 40px 8px;text-align:center">{dur_badge}</td></tr>
{action_html}
{download_html}

<tr><td style="padding:24px 40px 28px;text-align:center;border-top:1px solid #2a2318;margin-top:16px">
<p style="margin:0;color:#6b6358;font-size:11px">You're receiving this email as part of your LofiBuddha journey.</p>
<p style="margin:8px 0 0;color:#6b6358;font-size:11px"><a href="{unsub}" style="color:#9a9488;text-decoration:underline">Unsubscribe</a></p>
</td></tr>

</table></td></tr></table>
</body></html>"""


def send_email(to, subject, html):
    payload = {"from": FROM, "to": [to], "subject": subject, "html": html}
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": "Bearer " + KEY,
            "Content-Type": "application/json",
            "User-Agent": UA,
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        r = urllib.request.urlopen(req)
        return True, r.read().decode()
    except urllib.error.HTTPError as e:
        return False, f"{e.code} {e.read().decode()}"


def parse_args(argv):
    opts = {"test": False, "dry_run": False, "day": None, "email": None, "tier": None}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--test":
            opts["test"] = True
        elif a == "--dry-run":
            opts["dry_run"] = True
        elif a == "--day" and i + 1 < len(argv):
            opts["day"] = int(argv[i + 1]); i += 1
        elif a == "--email" and i + 1 < len(argv):
            opts["email"] = argv[i + 1]; i += 1
        elif a == "--tier" and i + 1 < len(argv):
            opts["tier"] = argv[i + 1]; i += 1
        i += 1
    return opts


def main():
    global KEY
    KEY = get_key("RESEND_API_KEY")
    if not KEY:
        print("Geen RESEND_API_KEY gevonden.")
        sys.exit(1)

    opts = parse_args(sys.argv[1:])

    drip = read_drip_content()

    # ---- TEST MODE: send one specific day to one address ----
    if opts["test"]:
        if not opts["email"] or not opts["day"]:
            print("Gebruik: --test --day N --email X [--tier mindful|enlightened]")
            sys.exit(1)
        tier = opts["tier"] or "enlightened"
        tier_title = drip.get(tier, {}).get("title", tier)
        item = drip.get(tier, {}).get("days", {}).get(str(opts["day"]))
        if not item:
            print(f"Geen content voor {tier} day {opts['day']}.")
            sys.exit(1)
        html = drip_html(tier, tier_title, opts["day"], item, opts["email"])
        subject = f"🪷 {tier_title} · Day {opts['day']} — {item.get('title','')}"
        if opts["dry_run"]:
            print(f"[DRY-RUN] zou versturen naar {opts['email']}: {subject}")
        else:
            ok, res = send_email(opts["email"], subject, html)
            print(("OK " if ok else "ERR ") + res)
        return

    # ---- NORMAL MODE: send due drip to all active subscribers ----
    subscribers = read_subscribers()
    tracking = read_tracking()
    sent_count = 0

    for sub in subscribers:
        if sub.get("status") not in (None, "active"):
            continue
        email = sub.get("email")
        tier = sub.get("tier")
        if not email or tier not in SCHEDULE:
            continue

        drip_day = calculate_drip_day(sub)
        tier_title = drip.get(tier, {}).get("title", tier)
        days = drip.get(tier, {}).get("days", {})

        for day in SCHEDULE[tier]:
            if day > drip_day:
                break
            key = f"{email}|{tier}|{day}"
            if key in tracking:
                continue
            item = days.get(str(day))
            if not item:
                continue

            subject = f"🪷 {tier_title} · Day {day} — {item.get('title','')}"
            if opts["dry_run"]:
                print(f"[DRY-RUN] {email} ({tier} day {day}): {subject}")
            else:
                ok, res = send_email(email, drip_html(tier, tier_title, day, item, email), subject)
                status = "OK" if ok else "ERR"
                print(f"{status} {email} day {day}: {res[:80]}")
                if ok:
                    tracking[key] = datetime.now(timezone.utc).isoformat()
                    sent_count += 1

    if not opts["dry_run"] and sent_count:
        write_tracking(tracking)

    print(f"\nKlaar. {sent_count} drip-mail(s) verstuurd.")


if __name__ == "__main__":
    main()
