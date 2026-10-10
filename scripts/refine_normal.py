import numpy as np
from PIL import Image

# Re-extract normal.png from full_nobg.png cleanly
full_img = Image.open(r"d:\shtx\demo\crops_nobg\full_nobg.png")
rgba = np.array(full_img)

# Normal bounding box from find_components: (668, 562, 995, 1024)
crop = rgba[562:1024, 668:995].copy()
h, w, _ = crop.shape

# Let's inspect the left side (x < 60):
# The hair has blonde colors (high R, high G, low B, R > B + 30).
# The shadow/stray marks have low saturation or dark grey (abs(R-G) < 15, abs(R-B) < 15) or low alpha.
for y in range(h):
    for x in range(min(70, w)):
        r, g, b, a = crop[y, x]
        if a > 0:
            # Check if this is grey shadow (R ~ G ~ B) and not blonde hair (R > 160, G > 140, B < 140)
            is_blonde = (r > 160 and g > 140 and r > b + 20)
            is_dark_robe = (r < 60 and g < 60 and b < 60) # robe is at x > 30 and y > 380
            if not is_blonde and not is_dark_robe:
                crop[y, x] = [0, 0, 0, 0]

# Also, at the very bottom left corner (y > 350, x < 25), clear any remaining stray grey
for y in range(350, h):
    for x in range(min(25, w)):
        r, g, b, a = crop[y, x]
        if not (r > 160 and g > 140):
            crop[y, x] = [0, 0, 0, 0]

out = Image.fromarray(crop, "RGBA")
bbox = out.getbbox()
if bbox:
    out = out.crop(bbox)

out.save(r"d:\shtx\assets\normal.png", "PNG")
print("Saved perfect normal.png:", out.size)
