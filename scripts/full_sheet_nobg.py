import os
from PIL import Image
import numpy as np

src_path = r"C:\Users\GG\.gemini\antigravity-ide\brain\64b01992-37c9-4e51-9410-4b108f945982\.user_uploaded\media_1791655704768.jpg"
img = Image.open(src_path).convert("RGB")
w, h = img.size

# Let's inspect the crops in detail:
# Top-Left (high tsun):
# In original image, High tsun is at top left.
# To prevent shy (top right) or center (half tsun) from leaking in:
# High tsun X max is around 385. Center girl starts around X=410, Y=350.
# So for high tsun, box = (20, 10, 390, 520). If center girl's hair tip touches X=390, we can zero out X > 385 for Y > 350!

# Let's write an intelligent polygon/masking extractor:
from rembg import remove, new_session
session = new_session("isnet-anime")

# First, let's remove background from the ENTIRE sheet if possible, or crop with clean boundaries!
# If we remove background from the ENTIRE 1024x1024 sheet:
print("Removing background from entire 1024x1024 sheet...")
nobg_full = remove(img, session=session)
nobg_full.save(r"d:\shtx\demo\crops_nobg\full_nobg.png")
print("Full sheet nobg saved!")
