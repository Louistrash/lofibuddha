#!/usr/bin/env python3
"""
Interactieve, invulbare werkboeken (reportlab AcroForm) — lofibuddha branding.

Maakt donkere "Mindfulness OS"-PDF's met:
  - invulbare tekstvelden (reflectie-vragen)
  - aanklikbare checkboxes (habit-tracker)
  - klikbare links (naar de app / site)
  - LED-kleur per categorie op de cover

Run:  python3 scripts/build-workbooks.py [slug]
Slugs: monthly-reflection-journal (default)
"""
import math, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ── branding ──
BG = HexColor("#08070C")
SURFACE = HexColor("#101019")
INK = HexColor("#F6F2EA")
MUTED = HexColor("#9A94A6")
GOLD = HexColor("#E4B872")
GOLD_DEEP = HexColor("#B89258")
LINE = HexColor("#2A2633")
LED = {"focus": "#E8A33D", "breathe": "#2DD4BF", "sleep": "#B89258", "relax": "#A855F7"}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "mobile/node_modules/@expo-google-fonts/manrope")
OUT_DIR = os.path.join(ROOT, "data/drip-content/pdf")
os.makedirs(OUT_DIR, exist_ok=True)

pdfmetrics.registerFont(TTFont("Manrope", f"{FONT_DIR}/400Regular/Manrope_400Regular.ttf"))
pdfmetrics.registerFont(TTFont("Manrope-Semi", f"{FONT_DIR}/600SemiBold/Manrope_600SemiBold.ttf"))
pdfmetrics.registerFont(TTFont("Manrope-Bold", f"{FONT_DIR}/800ExtraBold/Manrope_800ExtraBold.ttf"))

W, H = A4
MARGIN = 50
CONTENT_W = W - 2 * MARGIN


def mandala(c, cx, cy, r, color=GOLD):
    c.setStrokeColor(color)
    c.setLineWidth(0.6)
    for radius in [r, r * 0.78, r * 0.56, r * 0.34, r * 0.15]:
        c.circle(cx, cy, radius, stroke=1, fill=0)
    for i in range(16):
        a = i * math.pi / 8
        c.line(cx + math.cos(a) * r * 0.15, cy + math.sin(a) * r * 0.15,
               cx + math.cos(a) * r, cy + math.sin(a) * r)
    c.setFillColor(color)
    c.circle(cx, cy, 2.5, fill=1, stroke=0)


def cover(c, title, subtitle, accent):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    mandala(c, W / 2, H * 0.60, 64, accent)
    c.setFillColor(INK)
    c.setFont("Manrope-Bold", 33)
    c.drawCentredString(W / 2, H * 0.40, title)
    c.setFillColor(MUTED)
    c.setFont("Manrope", 13)
    c.drawCentredString(W / 2, H * 0.355, subtitle)
    c.setStrokeColor(accent)
    c.setLineWidth(1)
    c.line(W / 2 - 40, H * 0.31, W / 2 + 40, H * 0.31)
    c.setFillColor(MUTED)
    c.setFont("Manrope-Bold", 11)
    c.drawCentredString(W / 2, H * 0.88, "L O F I B U D D H A")
    c.showPage()


class Page:
    """Eenvoudige y-cursor die automatisch pagineert."""
    def __init__(self, c):
        self.c = c
        self.y = H - 64
        self.new_page()

    def new_page(self):
        self.c.setFillColor(BG)
        self.c.rect(0, 0, W, H, fill=1, stroke=0)
        # footer
        self.c.setFillColor(MUTED)
        self.c.setFont("Manrope", 8)
        self.c.drawCentredString(W / 2, 28, "LofiBuddha · Mindfulness OS")
        self.y = H - 64

    def ensure(self, needed):
        if self.y - needed < 70:
            self.c.showPage()
            self.new_page()

    def heading(self, text, accent):
        self.ensure(60)
        self.c.setFillColor(accent)
        self.c.setFont("Manrope-Bold", 15)
        self.c.drawString(MARGIN, self.y, text)
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(0.6)
        self.c.line(MARGIN, self.y - 8, W - MARGIN, self.y - 8)
        self.y -= 30

    def question(self, label, field_name, accent):
        self.ensure(120)
        self.c.setFillColor(INK)
        self.c.setFont("Manrope-Semi", 10.5)
        self.c.drawString(MARGIN, self.y, label)
        self.y -= 16
        x = MARGIN
        h = 44
        y_bottom = self.y - h
        # zichtbaar invulvak (achtergrond + rand, zelf getekend)
        self.c.setFillColor(HexColor("#15121F"))
        self.c.roundRect(x, y_bottom, CONTENT_W, h, 5, fill=1, stroke=0)
        self.c.setStrokeColor(HexColor("#4A4158"))
        self.c.setLineWidth(1)
        self.c.roundRect(x, y_bottom, CONTENT_W, h, 5, fill=0, stroke=1)
        # interactief (onzichtbaar) veld erboven
        self.c.acroForm.textfield(
            name=field_name, tooltip=label,
            x=x + 6, y=y_bottom + 4, width=CONTENT_W - 12, height=h - 8,
            value="", maxlen=0, fontName="Helvetica", fontSize=10,
            borderStyle="solid", borderWidth=0, borderColor=None, fillColor=None,
            textColor=INK, fieldFlags="multiline",
        )
        self.y -= h + 12


def build_journal():
    out = os.path.join(OUT_DIR, "monthly-reflection-journal.pdf")
    c = canvas.Canvas(out, pagesize=A4)
    c.setTitle("Monthly Reflection Journal")
    c.setAuthor("LofiBuddha")
    cover(c, "Monthly Reflection Journal", "LofiBuddha — a guide for your practice", GOLD)

    p = Page(c)
    weeks = [
        ("Week 1 — Arriving", [
            "Day 1 · What brought me here? What am I hoping to find?",
            "Day 2 · How does my body feel right now? Where do I hold tension?",
            "Day 3 · What thought pattern keeps repeating in my mind?",
            "Day 4 · When did I feel most present today?",
            "Day 5 · What am I avoiding?",
            "Day 6 · What felt like resistance? What felt like flow?",
            "Day 7 · One thing I noticed this week that I'd never noticed before.",
        ]),
        ("Week 2 — Inquiring", [
            "Day 8 · What story am I telling myself about who I am?",
            "Day 9 · Where do I seek external validation?",
            "Day 10 · What would I do differently if I weren't afraid?",
            "Day 11 · A belief I'm ready to question.",
            "Day 12 · When did I judge myself today? What would compassion say instead?",
            "Day 13 · What emotion am I not allowing myself to feel?",
            "Day 14 · Halfway reflection — what has shifted since Day 1?",
        ]),
        ("Week 3 — Integrating", [
            "Day 15 · How am I bringing practice into everyday moments?",
            "Day 16 · A difficult moment I navigated differently than before.",
            "Day 17 · What boundary needs attention?",
            "Day 18 · What nourishes me that I've been neglecting?",
            "Day 19 · A gratitude I haven't expressed yet.",
            "Day 20 · What's one thing I can let go of?",
            "Day 21 · The quality I most admire in myself.",
        ]),
        ("Week 4 — Deepening", [
            "Day 22 · What question am I still avoiding?",
            "Day 23 · How has my relationship with stillness changed?",
            "Day 24 · A moment of spontaneous presence.",
            "Day 25 · What does 'enough' feel like?",
            "Day 26 · Who am I when I stop trying to be someone?",
            "Day 27 · What practice will I carry forward?",
            "Day 28 · An intention for the next 28 days.",
        ]),
    ]
    for week, days in weeks:
        p.heading(week, GOLD)
        for i, q in enumerate(days):
            p.question(q, f"w{weeks.index((week, days))}_d{i+1}", GOLD)

    # Monthly review
    p.heading("Monthly Review", GOLD)
    p.question("What themes emerged this month?", "review_themes", GOLD)
    p.question("What surprised you?", "review_surprise", GOLD)
    p.question("Where did you grow?", "review_growth", GOLD)
    p.question("What's calling for more attention?", "review_attention", GOLD)

    # Klikbare link onderaan
    p.ensure(40)
    c.linkURL("https://lofibuddha.com/deepen",
              (MARGIN, p.y - 12, W - MARGIN, p.y + 10), relative=0, thickness=0)
    c.setFillColor(GOLD)
    c.setFont("Manrope-Semi", 10)
    c.drawString(MARGIN, p.y, "→ Continue your practice in the app · lofibuddha.com")

    c.save()
    print("Geschreven:", out)


if __name__ == "__main__":
    build_journal()
