#!/bin/bash
# Verify which payment methods this Stripe account accepts in subscription mode.
set -u

SK=$(grep -oP 'Environment=STRIPE_SECRET_KEY=\K[^\s"]+' /etc/systemd/system/lofibuddha.service | tr -d '"')
STRIPE=/root/.local/bin/stripe
PRICE="price_1U8ktSB7GXjClDhqrR3xTq4O"   # Mindful EUR 1.99/month

echo "Subscription-mode support per payment method:"
echo

for pm in card ideal sepa_debit bancontact paypal link; do
  printf "  %-12s " "$pm"
  OUT=$("$STRIPE" --api-key "$SK" post /v1/checkout/sessions \
      -d "mode=subscription" \
      -d "line_items[0][price]=$PRICE" \
      -d "line_items[0][quantity]=1" \
      -d "payment_method_types[0]=$pm" \
      -d "success_url=https://lofibuddha.com/success" \
      -d "cancel_url=https://lofibuddha.com/cancel" 2>&1)

  if echo "$OUT" | grep -q cs_live; then
    echo "OK   session created"
  else
    MSG=$(echo "$OUT" | grep -oP '"message":\s*"\K[^"]+' | head -1 | cut -c1-160)
    echo "NO   ${MSG:-unknown error}"
  fi
done

echo
echo "Automatic payment methods (what the live checkout actually offers):"
OUT=$("$STRIPE" --api-key "$SK" post /v1/checkout/sessions \
    -d "mode=subscription" \
    -d "line_items[0][price]=$PRICE" \
    -d "line_items[0][quantity]=1" \
    -d "success_url=https://lofibuddha.com/success" \
    -d "cancel_url=https://lofibuddha.com/cancel" 2>&1)
echo "$OUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    print('  could not parse response'); raise SystemExit
pmt = d.get('payment_method_types') or []
print('  ', ', '.join(pmt) if pmt else '(none returned)')
print('   session:', d.get('id', '-'))
"
