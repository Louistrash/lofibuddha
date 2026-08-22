#!/usr/bin/env python3
"""
LofiBuddha Welcome Email Engine
================================
Sends the 3-part welcome email sequence to new Stripe subscribers.
Can be called from the Stripe webhook (email 1) or via cron (emails 2 & 3).

Usage:
  python3 welcome_emails.py [--dry-run] [--transport himalaya|resend]

Transports:
  resend    — Uses Resend REST API (RESEND_API_KEY from .env.local)
  himalaya  — Uses Himalaya CLI (~/.config/himalaya/config.toml)
"""

import json
import os
import sys
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# ── Configuration ─────────────────────────────────────────

# Paths — autodetect container vs host
import os as _os
_script_dir = Path(__file__).resolve().parent
if (_script_dir / ".." / "package.json").exists():
    APP_ROOT = (_script_dir / "..").resolve()  # Running from project root
else:
    APP_ROOT = Path("/app")  # Docker container mount
DATA_DIR = APP_ROOT / "data"
SUBSCRIBERS_FILE = DATA_DIR / "subscribers.json"
WELCOME_TRACKER_FILE = DATA_DIR / "welcome_emails.json"
TEMPLATES_FILE = _script_dir / "email_templates.json"

FROM_NAME = "LofiBuddha"
FROM_EMAIL = "peace@lofibuddha.com"

# Email sequence definition
SEQUENCE = [
    {"key": "welcome_immediate", "delay_days": 0, "name": "Welcome + Links"},
    {"key": "welcome_day2", "delay_days": 2, "name": "Tour + Tips"},
    {"key": "welcome_day5", "delay_days": 5, "name": "Community"},
]

# ── Helpers ────────────────────────────────────────────────

def load_json(path):
    """Load a JSON file, return {} or [] on failure."""
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return [] if "subscribers" in str(path) or "welcome" in str(path) else {}


def save_json(path, data):
    """Save data as JSON, creating directories."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)


def load_env_file(env_path):
    """Parse .env.local-style file into a dict."""
    env = {}
    try:
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, _, val = line.partition("=")
                    env[key.strip()] = val.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return env


def get_subscriber_language(email):
    """Guess language from subscriber data or default to 'en'."""
    subs = load_json(APP_ROOT / "public" / "data" / "subscribers.json")
    for s in subs:
        if s.get("email") == email:
            return s.get("language", "en")
    return "en"


# ── Transports ─────────────────────────────────────────────

def send_via_resend(to_email, subject, html_body, text_body, dry_run=False):
    """Send email via Resend REST API."""
    env = load_env_file(APP_ROOT / ".env.local")
    api_key = env.get("RESEND_API_KEY", "")
    if not api_key:
        print("[resend] ERROR: RESEND_API_KEY not found in .env.local")
        return False

    if dry_run:
        print(f"[DRY-RUN] Would send via Resend to {to_email}: {subject}")
        return True

    payload = {
        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
        "to": [to_email],
        "subject": subject,
        "html": html_body,
        "text": text_body,
        "reply_to": FROM_EMAIL,
    }

    import urllib.request

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            print(f"[resend] Sent to {to_email}: {result.get('id', 'ok')}")
            return True
    except urllib.error.HTTPError as e:
        print(f"[resend] ERROR: {e.code} {e.reason} — {e.read().decode()}")
        return False
    except Exception as e:
        print(f"[resend] ERROR: {e}")
        return False


def send_via_himalaya(to_email, subject, html_body, text_body, dry_run=False):
    """Send email via Himalaya CLI."""
    himalaya_bin = os.path.expanduser("~/.local/bin/himalaya")
    if not os.path.exists(himalaya_bin):
        print("[himalaya] ERROR: himalaya binary not found at ~/.local/bin/himalaya")
        return False

    if dry_run:
        print(f"[DRY-RUN] Would send via Himalaya to {to_email}: {subject}")
        return True

    # Use MML format for Himalaya template send
    mml = f"""From: {FROM_NAME} <{FROM_EMAIL}>
To: {to_email}
Subject: {subject}
Content-Type: text/plain; charset=utf-8

{text_body}"""

    try:
        result = subprocess.run(
            [himalaya_bin, "template", "send"],
            input=mml,
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            print(f"[himalaya] Sent to {to_email}")
            return True
        else:
            print(f"[himalaya] ERROR: {result.stderr.strip()}")
            return False
    except subprocess.TimeoutExpired:
        print("[himalaya] ERROR: timeout")
        return False
    except Exception as e:
        print(f"[himalaya] ERROR: {e}")
        return False


# ── Core Logic ─────────────────────────────────────────────

def should_send_email(email, sequence_key, delay_days, subscriber_created_at, dry_run=False):
    """
    Determine if an email in the sequence should be sent.
    
    Logic:
    - Check if already sent (via tracker)
    - Check if enough days have passed since signup
    - For immediate (delay_days=0): always send if not yet sent
    """
    tracker = load_json(WELCOME_TRACKER_FILE)

    # Check tracker
    for entry in tracker:
        if entry["email"] == email and entry["sequence_key"] == sequence_key:
            return False  # Already sent

    # Check timing
    try:
        created = datetime.fromisoformat(subscriber_created_at.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        print(f"[warn] Invalid date for {email}: {subscriber_created_at}")
        return False

    now = datetime.now(timezone.utc)
    days_since = (now - created).days

    if delay_days == 0:
        return True  # Immediate: send right away if not yet sent
    else:
        return days_since >= delay_days


def record_email_sent(email, sequence_key):
    """Record that an email was sent."""
    tracker = load_json(WELCOME_TRACKER_FILE)
    tracker.append({
        "email": email,
        "sequence_key": sequence_key,
        "sent_at": datetime.now(timezone.utc).isoformat(),
    })
    save_json(WELCOME_TRACKER_FILE, tracker)


def process_subscriber(subscriber, transport_fn, dry_run=False):
    """Process one subscriber: send any due welcome emails."""
    email = subscriber.get("email", "")
    created_at = subscriber.get("createdAt", "")
    tier = subscriber.get("tier", "unknown")
    status = subscriber.get("status", "")

    if not email or status != "active":
        return 0

    # Skip free tier
    if tier == "zen":
        return 0

    lang = get_subscriber_language(email)
    templates = load_json(TEMPLATES_FILE)
    sent_count = 0

    for seq in SEQUENCE:
        if should_send_email(email, seq["key"], seq["delay_days"], created_at, dry_run):
            template = templates.get(seq["key"], {}).get(lang)
            if not template:
                template = templates.get(seq["key"], {}).get("en", {})
            if not template:
                print(f"[warn] No template for {seq['key']}/{lang}")
                continue

            success = transport_fn(
                to_email=email,
                subject=template["subject"],
                html_body=template.get("body_html", ""),
                text_body=template.get("body_text", ""),
                dry_run=dry_run,
            )

            if success or dry_run:
                record_email_sent(email, seq["key"])
                sent_count += 1
                print(f"  ✓ {seq['name']} → {email} ({lang})")
            else:
                print(f"  ✗ FAILED: {seq['name']} → {email}")

    return sent_count


# ── Main ───────────────────────────────────────────────────

def main():
    dry_run = "--dry-run" in sys.argv
    transport = "resend"
    for arg in sys.argv:
        if arg.startswith("--transport="):
            transport = arg.split("=", 1)[1]

    if transport == "himalaya":
        transport_fn = send_via_himalaya
    else:
        transport_fn = send_via_resend

    print(f"Welcome Email Engine — transport={transport}, dry_run={dry_run}")
    print(f"Subscribers file: {SUBSCRIBERS_FILE}")

    if not SUBSCRIBERS_FILE.exists():
        print("No subscribers file yet. Nothing to do.")
        return

    subscribers = load_json(SUBSCRIBERS_FILE)
    if not subscribers:
        print("No subscribers found.")
        return

    print(f"Processing {len(subscribers)} subscribers...")
    total_sent = 0
    for sub in subscribers:
        total_sent += process_subscriber(sub, transport_fn, dry_run)

    print(f"Done. Emails sent: {total_sent}")


if __name__ == "__main__":
    main()
