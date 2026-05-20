from pathlib import Path
from PIL import Image, ImageOps
import json

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "images" / "Siv"
THUMB_DIR = SRC_DIR / "thumbs"

SUPPORTED = {".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"}


def flatten_to_rgb(im: Image.Image) -> Image.Image:
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGB", "L"):
        if im.mode == "L":
            return im.convert("RGB")
        return im
    if im.mode in ("RGBA", "LA"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.getchannel("A"))
        return bg
    return im.convert("RGB")


def save_webp(src_path: Path, out_path: Path, size: tuple[int, int] | None = None, quality: int = 80):
    with Image.open(src_path) as im:
        im = flatten_to_rgb(im)
        if size is not None:
            im = im.copy()
            im.thumbnail(size, Image.Resampling.LANCZOS)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        im.save(out_path, format="WEBP", quality=quality, method=4)


def main():
    files = sorted([p for p in SRC_DIR.iterdir() if p.suffix.lower() in SUPPORTED and p.is_file()])
    sheets = []

    for src in files:
        stem = src.stem
        thumb = THUMB_DIR / f"{stem}.webp"
        save_webp(src, thumb, size=(480, 480), quality=78)
        sheets.append({
            "name": src.name,
            "thumb": f"images/Siv/thumbs/{stem}.webp",
            "full": f"images/Siv/{src.name}",
        })

    js = "window.BOOK_SHEETS = " + json.dumps(sheets, indent=2, ensure_ascii=False) + ";\n"
    json_out = json.dumps(sheets, indent=2, ensure_ascii=False) + "\n"

    (SRC_DIR / "manifest.js").write_text(js, encoding="utf-8")
    (SRC_DIR / "manifest.json").write_text(json_out, encoding="utf-8")
    print(f"Generated {len(sheets)} sheets and {len(sheets)} thumbs.")


if __name__ == "__main__":
    main()