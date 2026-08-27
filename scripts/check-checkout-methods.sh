#!/bin/bash
# What the app's own checkout endpoint offers, per customer locale.
set -u

SK=$(grep -oP 'Environment=STRIPE_SECRET_KEY=\K[^\s"]+' /etc/systemd/system/lofibuddha.service | tr -d '"')
STRIPE=/root/.local/bin/stripe

probe () {
  local label="$1" payload="$2"
  echo "$payload" > /tmp/pm-probe.json
  local url
  url=$(curl -s -X POST https://www.lofibuddha.com/api/stripe/checkout \
        -H 'Content-Type: application/json' --data @/tmp/pm-probe.json \
        | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('url') or '')")

  if [ -z "$url" ]; then
    echo "  $label -> no checkout url"
    return
  fi

  # cs_live_<id> is embedded in the returned url; ask Stripe what it offers
  local sid
  sid=$(echo "$url" | grep -oP 'cs_live_[A-Za-z0-9]+' | head -1)
  "$STRIPE" --api-key "$SK" get "/v1/checkout/sessions/$sid" 2>/dev/null | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('  $label')
print('     currency :', d.get('currency'))
print('     amount   :', (d.get('amount_total') or 0)/100)
print('     methods  :', ', '.join(d.get('payment_method_types') or []))
"
}

probe "NL customer (nl-NL / Europe-Amsterdam)" \
  '{"tier":"mindful","email":"nl@example.com","locale":"nl-NL","timeZone":"Europe/Amsterdam"}'

probe "US customer (en-US / America-New_York)" \
  '{"tier":"mindful","email":"us@example.com","locale":"en-US","timeZone":"America/New_York"}'
