import numpy as np
from PIL import Image
from scipy.ndimage import label

p = r"d:\shtx\assets\normal.png"
img = Image.open(p)
rgba = np.array(img)
alpha = rgba[:, :, 3]

# Keep only the main connected component (and any hair directly attached)
binary = alpha > 20
labeled, num_features = label(binary)

# Find sizes
sizes = [np.sum(labeled == i) for i in range(1, num_features + 1)]
main_label = np.argmax(sizes) + 1

# Check if there are small floating artifacts (like the sliver on the left edge)
for i in range(1, num_features + 1):
    if i != main_label:
        # Check size of island
        island_size = np.sum(labeled == i)
        print(f"Island {i}: size={island_size}")
        if island_size < 1000:
            rgba[labeled == i] = [0, 0, 0, 0]

# Also inspect the left edge: x < 15, y between 180 and 300
for y in range(150, 320):
    for x in range(min(12, rgba.shape[1])):
        r, g, b, a = rgba[y, x]
        if a > 0 and r < 50 and g < 50 and b < 50:
            rgba[y, x] = [0, 0, 0, 0]

out = Image.fromarray(rgba, "RGBA")
bbox = out.getbbox()
if bbox:
    out = out.crop(bbox)

out.save(p, "PNG")
print("Cleaned normal.png successfully! Size:", out.size)
