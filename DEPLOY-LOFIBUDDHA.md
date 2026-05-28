# 🧘 lofibuddha.com → Eigen VPS — Installatiegids

## Stap 1: DNS
Wijzig het A-record van `lofibuddha.com` naar `85.215.43.194`:

```
Type: A
Name: @
Value: 85.215.43.194
TTL: 3600

Type: A
Name: www
Value: 85.215.43.194
TTL: 3600
```

## Stap 2: Nginx config (SSH naar je VPS)

```bash
# Kopieer de config
sudo cp /opt/data/bodhi-dashboard/nginx-lofibuddha.conf /etc/nginx/sites-available/lofibuddha.com

# Enable
sudo ln -s /etc/nginx/sites-available/lofibuddha.com /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

## Stap 3: SSL certificaat

```bash
# Installeer certbot (één keer)
sudo apt update && sudo apt install -y certbot python3-certbot-nginx

# Haal certificaat
sudo certbot --nginx -d lofibuddha.com -d www.lofibuddha.com

# Certbot past de config automatisch aan voor HTTPS
```

## Stap 4: Uncomment SSL block

Na certbot: de SSL server block in `/etc/nginx/sites-available/lofibuddha.com` is al actief.
Test SSL:

```bash
curl -I https://lofibuddha.com
```

## Stap 5: Test

```
https://lofibuddha.com/        → Landing page
https://lofibuddha.com/browse   → Free content
https://lofibuddha.com/signup   → Signup
https://lofibuddha.com/app      → Dashboard (Bodhi Pro)
https://lofibuddha.com/social   → Social calendar
```

## WordPress verwijderen

Zodra de nieuwe site live is:
- Exporteer je WordPress content via Tools → Export (XML)
- Annuleer de WordPress hosting
- De XML kan ik later importeren in de blog

---

✅ **Klaar!** De Next.js app draait al op je VPS — dit is puur de domein-koppeling.

Hulp nodig? Stuur de output van `sudo nginx -t` en ik check mee.
