import os
from PIL import Image
from rembg import remove, new_session

# Test rembg on crops
crops = {
    "high tsun": (30, 20, 420, 520),
    "shy": (580, 10, 990, 520),
    "half tsun": (330, 340, 670, 915),
    "little high tsun": (10, 530, 380, 1010),
    "normal": (630, 530, 995, 1010)
}

src_path = r"C:\Users\GG\.gemini\antigravity-ide\brain\64b01992-37c9-4e51-9410-4b108f945982\.user_uploaded\media_1791655704768.jpg"
img = Image.open(src_path)

print("Initializing session...")
# Let's test with default or isnet-anime
session = new_session("isnet-anime")

os.makedirs(r"d:\shtx\demo\crops_nobg", exist_ok=True)
for name, box in crops.items():
    cropped = img.crop(box)
    nobg = remove(cropped, session=session)
    nobg.save(rf"d:\shtx\demo\crops_nobg\{name}.png")
    print(f"Processed and saved: {name}")
