import re, base64, os

html_file = "/Users/Nael/Documents/workspace/SiteWebFR (18_04_2026 17：38：20).html"
out_dir = "/Users/Nael/Documents/workspace/sitewebfr/assets/images"

with open(html_file, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Find all base64 images in src attributes (img tags)
pattern = r'<img[^>]+src="(data:image/(png|webp|avif|jpeg|jpg|svg\+xml);base64,([^"]+))"'
matches = re.findall(pattern, content)

print(f"Found {len(matches)} images in img tags")

for i, (full_data, fmt, b64data) in enumerate(matches):
    ext = fmt.replace("+xml", "").replace("svg", "svg")
    filename = f"extracted_{i+1}.{ext}"
    filepath = os.path.join(out_dir, filename)
    try:
        img_data = base64.b64decode(b64data)
        with open(filepath, "wb") as f:
            f.write(img_data)
        size_kb = len(img_data) / 1024
        print(f"  Saved {filename} ({size_kb:.1f} KB)")
    except Exception as e:
        print(f"  Error saving {filename}: {e}")

# Also find background images in CSS
bg_pattern = r'url\("(data:image/(png|webp|avif|jpeg|jpg);base64,([^"]+))"\)'
bg_matches = re.findall(bg_pattern, content)
print(f"\nFound {len(bg_matches)} images in CSS backgrounds")

for i, (full_data, fmt, b64data) in enumerate(bg_matches):
    ext = fmt
    filename = f"bg_{i+1}.{ext}"
    filepath = os.path.join(out_dir, filename)
    try:
        img_data = base64.b64decode(b64data)
        with open(filepath, "wb") as f:
            f.write(img_data)
        size_kb = len(img_data) / 1024
        print(f"  Saved {filename} ({size_kb:.1f} KB)")
    except Exception as e:
        print(f"  Error saving {filename}: {e}")

print("\nDone!")
