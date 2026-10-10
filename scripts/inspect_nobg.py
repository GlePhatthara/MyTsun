from PIL import Image
import numpy as np

src_path = r"C:\Users\GG\.gemini\antigravity-ide\brain\64b01992-37c9-4e51-9410-4b108f945982\.user_uploaded\media_1791655704768.jpg"
img = Image.open(src_path)

# Let's inspect the other 3 generated images in demo/crops_nobg:
for name in ["shy", "half tsun", "little high tsun"]:
    p = rf"d:\shtx\demo\crops_nobg\{name}.png"
    im = Image.open(p)
    print(f"{name}: size={im.size}")
