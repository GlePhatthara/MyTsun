import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects

# Load full_nobg.png
img = Image.open(r"d:\shtx\demo\crops_nobg\full_nobg.png")
rgba = np.array(img)
alpha = rgba[:, :, 3]

# Threshold alpha to find objects
binary = alpha > 30

# Label connected components
labeled, num_features = label(binary)
print(f"Number of connected components: {num_features}")

# Find objects
slices = find_objects(labeled)
components = []
for i, s in enumerate(slices):
    size = np.sum(labeled[s] == (i + 1))
    ymin, ymax = s[0].start, s[0].stop
    xmin, xmax = s[1].start, s[1].stop
    components.append({
        "id": i + 1,
        "size": size,
        "box": (xmin, ymin, xmax, ymax),
        "center": ((xmin + xmax) // 2, (ymin + ymax) // 2)
    })

# Sort by size descending
components.sort(key=lambda c: c["size"], reverse=True)
for c in components[:10]:
    print(c)
