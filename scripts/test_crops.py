import os
from PIL import Image
import numpy as np

src_path = r"C:\Users\GG\.gemini\antigravity-ide\brain\64b01992-37c9-4e51-9410-4b108f945982\.user_uploaded\media_1791655704768.jpg"
img = Image.open(src_path)
print(f"Original size: {img.size}")

# Let's inspect the bounding boxes of the 5 poses:
# 1. Top-Left: High Tsun
# 2. Top-Right: Shy
# 3. Center: Half Tsun
# 4. Bottom-Left: Little High Tsun
# 5. Bottom-Right: Normal

# Let's define generous crop boxes:
crops = {
    "high tsun": (30, 20, 420, 520),
    "shy": (580, 10, 990, 520),
    "half tsun": (330, 340, 670, 915),
    "little high tsun": (10, 530, 380, 1010),
    "normal": (630, 530, 995, 1010)
}

os.makedirs(r"d:\shtx\demo\crops_test", exist_ok=True)
for name, box in crops.items():
    cropped = img.crop(box)
    cropped.save(rf"d:\shtx\demo\crops_test\{name}.png")
    print(f"Saved crop for {name}: {cropped.size}")
