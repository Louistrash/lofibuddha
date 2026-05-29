# 🔐 Security — LofiBuddha / Bodhi Dashboard

## Never commit these
- `.env.local` — API keys (DeepSeek, TikTok, OpenAI)
- `*.pem` — SSL/TLS private keys
- Any file containing `sk-`, `Bearer`, or `secret`

## If a key is exposed

1. **Revoke immediately** on the provider dashboard:
   - DeepSeek: https://platform.deepseek.com/api_keys
   - TikTok: https://developers.tiktok.com/apps/
   - OpenAI: https://platform.openai.com/api-keys
   - Gemini: https://aistudio.google.com/apikey
2. **Check Git history** (`git log --all --oneline -- .env*`)
3. **Generate new key**, update `.env.local` and VPS
4. **Restart affected services** (`docker restart bodhi-dashboard`)
5. **Check GitHub** for accidental pushes — if leaked, rotate + purge

## Key locations

| Key | File | Notes |
|-----|------|-------|
| DeepSeek | `.env.local` + VPS `.env.local` | Content generation + Hermes chat |
| TikTok | `.env.local` + VPS `.env.local` | Social scheduling |
| OpenAI | `~/.hermes/.env` | Hermes agent backend |
| Gemini | `~/.hermes/.env` | Vision + image gen |

## Prevention

- `.gitignore` already blocks `.env*` 
- Use `DETECT_SECRETS` or `git-secrets` pre-commit hook
- Rotate keys every 90 days
- Never share `.env.local` via chat, screenshot, or logs
