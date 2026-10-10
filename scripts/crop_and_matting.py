import os
import sys
from PIL import Image

ORIGINAL_IMAGE = r"C:\Users\GG\.gemini\antigravity-ide\brain\64b01992-37c9-4e51-9410-4b108f945982\.user_uploaded\media_1791655704768.jpg"
OUTPUT_DIR = r"d:\shtx\assets"

def main():
    print("Testing Pillow & Rembg...")
    try:
        from rembg import remove, new_session
        print("rembg successfully imported!")
    except Exception as e:
        print(f"rembg import error: {e}")
        return

    img = Image.open(ORIGINAL_IMAGE).convert("RGBA")
    w, h = img.size
    print(f"Original image size: {w}x{h}")

if __name__ == "__main__":
    main()
