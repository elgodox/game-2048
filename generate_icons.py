from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\Users\elgod\Desktop\Personal\2048")
ICON_DIR = ROOT / "icons"
ICON_DIR.mkdir(parents=True, exist_ok=True)


def find_font(size: int):
    candidates = [
        r"C:\Windows\Fonts\seguisb.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\calibrib.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def make_icon(size: int, path: Path):
    img = Image.new("RGB", (size, size), "#100e0c")
    draw = ImageDraw.Draw(img)
    pad = int(size * 0.11)
    radius = int(size * 0.20)
    draw.rounded_rectangle(
        [pad, pad, size - pad - 1, size - pad - 1],
        radius=radius,
        fill="#e3b341",
    )
    font = find_font(int(size * 0.28))
    text = "2048"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1] + int(size * 0.015)
    draw.text((x, y), text, font=font, fill="#ffffff")
    img.save(path, "PNG")
    print(path, img.size)


for s, name in ((180, "icon-180.png"), (192, "icon-192.png"), (512, "icon-512.png")):
    make_icon(s, ICON_DIR / name)

Image.open(ICON_DIR / "icon-180.png").save(ROOT / "apple-touch-icon.png")
print("ok")
