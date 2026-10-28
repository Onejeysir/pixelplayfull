"""Crée les fichiers de test des photos (JPEG, PNG, WebP, GIF, PDF, image trop lourde) dans e2e/fixtures/."""
import os
from pathlib import Path
from PIL import Image

d = Path(__file__).resolve().parent / "fixtures"
d.mkdir(exist_ok=True)
for i in range(1, 8):
    Image.new("RGB", (320, 240), (30 * i, 80, 200)).save(d / f"photo{i}.jpg", "JPEG")
Image.new("RGB", (320, 240), (108, 59, 234)).save(d / "p.png", "PNG")
Image.new("RGB", (320, 240), (108, 59, 234)).save(d / "w.webp", "WEBP")
Image.new("RGB", (320, 240), (108, 59, 234)).save(d / "anim.gif", "GIF")
(d / "doc.pdf").write_bytes(b"%PDF-1.4\n%fake\n")
(d / "gros.jpg").write_bytes(b"\xff\xd8\xff\xe0" + os.urandom(6 * 1024 * 1024))  # > 5 Mo
print("fixtures prêtes :", sorted(p.name for p in d.iterdir()))
