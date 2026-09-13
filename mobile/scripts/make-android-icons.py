#!/usr/bin/env python3
"""
Generate Android adaptive icon layers from the master app icon.

Android adaptive icons are shown as a background layer plus a foreground
layer. The launcher masks the whole thing to the device's icon shape
(circle, squircle, rounded square...) and may apply a parallax parallax.
Only the centre ~66% of the 108dp canvas is guaranteed to be visible, so
the foreground motif is scaled down and centred inside that safe zone.

Source: assets/images/icon.png (1024x1024, RGB, opaque).
Outputs:
  assets/images/android-icon-background.png  (1024x1024, opaque)
  assets/images/android-icon-foreground.png  (1024x1024, RGBA, motif only)
  assets/images/android-icon-monochrome.png  (1024x1024, RGBA, white silhouette)
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"
SRC = IMAGES / "icon.png"

SIZE = 1024
# The visible safe zone of an adaptive icon is the inner 66% of the canvas.
SAFE_ZONE = 0.66
# Background colour, matches app.json backgroundColor.
BG_COLOR = (8, 7, 12, 255)


def is_dark(pixel: tuple[int, int, int], threshold: int = 22) -> bool:
    """True when a pixel is (near) black, i.e. part of the icon's backdrop."""
    return pixel[0] < threshold and pixel[1] < threshold and pixel[2] < threshold


def build_foreground(master: Image.Image) -> Image.Image:
    """
    Keep only the motif, drop the black backdrop to transparency, then
    scale it into the safe zone.
    """
    rgba = master.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            if is_dark((r, g, b)):
                pixels[x, y] = (r, g, b, 0)

    # Trim to the motif's bounding box so centring is exact.
    bbox = rgba.getbbox()
    motif = rgba.crop(bbox) if bbox else rgba

    target = int(SIZE * SAFE_ZONE)
    motif = motif.resize((target, target), Image.LANCZOS)

    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    offset = (SIZE - target) // 2
    canvas.paste(motif, (offset, offset), motif)
    return canvas


def build_background() -> Image.Image:
    """Flat dark backdrop with a subtle radial lift behind the motif."""
    canvas = Image.new("RGBA", (SIZE, SIZE), BG_COLOR)
    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    # Warm centre, very subtle, so the icon does not read as flat black.
    draw.ellipse(
        (SIZE * 0.18, SIZE * 0.18, SIZE * 0.82, SIZE * 0.82),
        fill=(26, 42, 42, 255),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(SIZE * 0.18))
    return Image.alpha_composite(canvas, glow)


def build_monochrome(foreground: Image.Image) -> Image.Image:
    """
    Android 13+ themed icons: a single-colour silhouette the system tints.
    The alpha channel of the foreground becomes the shape, painted white.
    """
    alpha = foreground.split()[3]
    white = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255))
    white.putalpha(alpha)
    return white


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Master icon not found: {SRC}")

    master = Image.open(SRC)
    if master.size != (SIZE, SIZE):
        raise SystemExit(f"Master icon must be {SIZE}x{SIZE}, got {master.size}")

    fg = build_foreground(master)
    bg = build_background()
    mono = build_monochrome(fg)

    fg.save(IMAGES / "android-icon-foreground.png")
    bg.save(IMAGES / "android-icon-background.png")
    mono.save(IMAGES / "android-icon-monochrome.png")
    print("Wrote android-icon-foreground.png, -background.png, -monochrome.png")


if __name__ == "__main__":
    main()
