#!/usr/bin/env python3
"""Tulis src/lib/media-dims.json: dimensi (w,h) gambar di public/media/local-wisdom.
Dipakai untuk og:image:width/height dan JSON-LD panduan. Jalankan ulang setelah menambah foto."""
import json, pathlib
from PIL import Image
root = pathlib.Path(__file__).resolve().parent.parent
out = {}
for f in sorted((root / 'public/media/local-wisdom').glob('*.webp')):
    out['/' + str(f.relative_to(root / 'public'))] = list(Image.open(f).size)
(root / 'src/lib/media-dims.json').write_text(json.dumps(out, separators=(',', ':')) + '\n')
print(len(out), 'entries')
