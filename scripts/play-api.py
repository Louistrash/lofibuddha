#!/usr/bin/env python3
"""Google Play Developer API helper voor lofibuddha (com.lofibuddha.app).

Auth via service-account JSON (secrets/google-play-service-account.json).
Werkt via de EDIT-flow (de app-resource GET/PATCH geeft een 404-quirk;
de edit-endpoints werken wél).

Gebruik:
  python3 scripts/play-api.py listing:get en-US
  python3 scripts/play-api.py listing:set en-US --title "..." --short "..." --full "path/to/full.txt"
"""
import json, sys, time, argparse
import jwt, requests

SA_PATH = "/opt/data/bodhi-dashboard/secrets/google-play-service-account.json"
PACKAGE = "com.lofibuddha.app"
BASE = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{PACKAGE}"
SCOPE = "https://www.googleapis.com/auth/androidpublisher"


def get_token():
    sa = json.load(open(SA_PATH))
    now = int(time.time())
    claims = {
        "iss": sa["client_email"],
        "scope": SCOPE,
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now,
        "exp": now + 3600,
    }
    signed = jwt.encode(claims, sa["private_key"], algorithm="RS256")
    r = requests.post(
        "https://oauth2.googleapis.com/token",
        data={"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": signed},
        timeout=30,
    )
    return r.json()["access_token"]


def headers():
    return {"Authorization": f"Bearer {get_token()}", "Content-Type": "application/json"}


def create_edit():
    return requests.post(f"{BASE}/edits", headers=headers(), timeout=30).json()["id"]


def get_listing(lang):
    edit_id = create_edit()
    r = requests.get(f"{BASE}/edits/{edit_id}/listings/{lang}", headers=headers(), timeout=30)
    return r.json() if r.status_code == 200 else {"error": r.text}


def set_listing(lang, title, short, full):
    edit_id = create_edit()
    payload = {"title": title, "shortDescription": short, "fullDescription": full}
    r = requests.put(
        f"{BASE}/edits/{edit_id}/listings/{lang}", headers=headers(), json=payload, timeout=30
    )
    if r.status_code != 200:
        return {"error": r.text}
    c = requests.post(f"{BASE}/edits/{edit_id}:commit", headers=headers(), timeout=30)
    return {"put": r.status_code, "commit": c.status_code}


# Beeld uploadt via de speciale /upload URI + ?uploadType=media (NIET de gewone resource-URI,
# die de bytes als JSON probeert te parsen en 400 geeft).
# NB: listings/<lang>/<imageType> retourneert een DICT {"images": [...]}, geen direct object/lijst.
def upload_image(lang, image_type, image_path, content_type="image/png"):
    edit_id = create_edit()
    with open(image_path, "rb") as f:
        data = f.read()
    url = (
        f"https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/"
        f"{PACKAGE}/edits/{edit_id}/listings/{lang}/{image_type}?uploadType=media"
    )
    r = requests.post(
        url,
        headers={"Authorization": f"Bearer {get_token()}", "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if r.status_code != 200:
        return {"error": r.text}
    c = requests.post(f"{BASE}/edits/{edit_id}:commit", headers=headers(), timeout=30)
    return {"upload": r.status_code, "commit": c.status_code, "image": r.json().get("image")}


def get_images(lang, image_type):
    edit_id = create_edit()
    r = requests.get(f"{BASE}/edits/{edit_id}/listings/{lang}/{image_type}", headers=headers(), timeout=30)
    if r.status_code != 200:
        return {"error": r.text}
    return {"images": r.json().get("images", [])}


def delete_image(lang, image_type, image_id):
    edit_id = create_edit()
    r = requests.delete(
        f"{BASE}/edits/{edit_id}/listings/{lang}/{image_type}/{image_id}", headers=headers(), timeout=30
    )
    if r.status_code not in (200, 204):
        return {"error": r.text}
    c = requests.post(f"{BASE}/edits/{edit_id}:commit", headers=headers(), timeout=30)
    return {"delete": r.status_code, "commit": c.status_code}


def get_track(track):
    edit_id = create_edit()
    r = requests.get(f"{BASE}/edits/{edit_id}/tracks/{track}", headers=headers(), timeout=30)
    if r.status_code != 200:
        return {"error": r.text}
    return {"releases": r.json().get("releases", [])}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("action", help="listing:get|listing:set|images:get|images:delete|track:get")
    ap.add_argument("lang", help="bijv. en-US (of track-naam voor track:get)")
    ap.add_argument("--title")
    ap.add_argument("--short")
    ap.add_argument("--full", help="pad naar full-description .txt")
    ap.add_argument("--image-type", choices=["phoneScreenshots", "featureGraphic", "icon"])
    ap.add_argument("--image-id", help="image-id voor images:delete")
    a = ap.parse_args()

    if a.action == "listing:get":
        print(json.dumps(get_listing(a.lang), indent=2, ensure_ascii=False))
    elif a.action == "listing:set":
        full = open(a.full).read() if a.full else ""
        if not (a.title and a.short and full):
            print("--title, --short en --full zijn verplicht"); sys.exit(1)
        print(set_listing(a.lang, a.title, a.short, full))
    elif a.action == "images:get":
        print(json.dumps(get_images(a.lang, a.image_type or "phoneScreenshots"), indent=2, ensure_ascii=False))
    elif a.action == "images:delete":
        if not (a.image_type and a.image_id):
            print("--image-type en --image-id zijn verplicht"); sys.exit(1)
        print(delete_image(a.lang, a.image_type, a.image_id))
    elif a.action == "track:get":
        print(json.dumps(get_track(a.lang), indent=2, ensure_ascii=False))
    else:
        print("onbekende actie"); sys.exit(1)


if __name__ == "__main__":
    main()
