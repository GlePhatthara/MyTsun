import numpy as np
from PIL import Image

# Clean normal.png bottom-left shadow artifact
p = r"d:\shtx\assets\normal.png"
img = Image.open(p)
rgba = np.array(img)
h, w, _ = rgba.shape

# Let's inspect where the character's body is vs the artifact:
# The character's green robe and arm start above and to the right.
# The shadow is at the lower-left corner (x < 65, y > 300).
# Let's check what's in that box:
for y in range(300, h):
    for x in range(0, min(70, w)):
        # If it's the faint grey shadow (R, G, B roughly equal, low brightness or faint alpha)
        # Check RGB and alpha
        r, g, b, a = rgba[y, x]
        if a > 0:
            # Let's check if this is disconnected from the green robe
            # The green robe has significant green channel or dark coat
            # Actually, looking at the image, at x < 55 and y > 300 there is NO character body,
            # the character's black robe boundary starts at x around 60-70!
            pass

# Let's see: let's inspect the original normal.png from the backup or previous version
old_normal = Image.open(r"d:\shtx\assets\backup_original\normal.png")
print("Old normal size:", old_normal.size)
print("New normal size:", img.size)

# In the previous normal.png:
# Let's check where the left boundary of the body was:
# In the original sprite sheet (media_1791655704768.jpg), around bottom right:
# The center character's sleeve shadow extends towards the bottom-right character.
# If we clear x < 45 for y > 320:
mask_clear = np.zeros((h, w), dtype=bool)
for y in range(310, h):
    for x in range(0, 52):
        mask_clear[y, x] = True

rgba[mask_clear] = [0, 0, 0, 0]

# Let's also do a tiny trim of transparent borders if needed
cleaned_img = Image.fromarray(rgba, "RGBA")
bbox = cleaned_img.getbbox()
if bbox:
    cleaned_img = cleaned_img.crop(bbox)

cleaned_img.save(p, "PNG")
print(f"Cleaned normal.png saved! New size: {cleaned_img.size}")
