import os
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects

# Load full_nobg.png
img = Image.open(r"d:\shtx\demo\crops_nobg\full_nobg.png")
rgba = np.array(img)
alpha = rgba[:, :, 3]

binary = alpha > 30
labeled, num_features = label(binary)

slices = find_objects(labeled)
components = []
for i, s in enumerate(slices):
    size = np.sum(labeled[s] == (i + 1))
    ymin, ymax = s[0].start, s[0].stop
    xmin, xmax = s[1].start, s[1].stop
    components.append({
        "id": i + 1,
        "slice": s,
        "box": (xmin, ymin, xmax, ymax),
        "center": ((xmin + xmax) // 2, (ymin + ymax) // 2)
    })

# Map components to asset names by center location:
# Top-Left: center_x < 400, center_y < 500 -> high tsun
# Top-Right: center_x > 600, center_y < 500 -> shy
# Center: center_x between 350 and 650, center_y between 400 and 800 -> half tsun
# Bottom-Left: center_x < 400, center_y > 600 -> little high tsun
# Bottom-Right: center_x > 600, center_y > 600 -> normal

name_mapping = {}
for c in components:
    cx, cy = c["center"]
    if cy < 500:
        if cx < 500:
            name_mapping["high tsun"] = c
        else:
            name_mapping["shy"] = c
    elif cy > 700:
        if cx < 500:
            name_mapping["little high tsun"] = c
        else:
            name_mapping["normal"] = c
    else:
        name_mapping["half tsun"] = c

assets_dir = r"d:\shtx\assets"
os.makedirs(assets_dir, exist_ok=True)

# Save backup first
backup_dir = r"d:\shtx\assets\backup_original"
os.makedirs(backup_dir, exist_ok=True)

for name, c in name_mapping.items():
    comp_id = c["id"]
    s = c["slice"]
    xmin, ymin, xmax, ymax = c["box"]
    
    # Extract only this component (zero out any other pixels)
    comp_mask = (labeled == comp_id)
    comp_rgba = np.zeros_like(rgba)
    comp_rgba[comp_mask] = rgba[comp_mask]
    
    # Crop to bounding box
    cropped_rgba = comp_rgba[ymin:ymax, xmin:xmax]
    out_img = Image.fromarray(cropped_rgba, "RGBA")
    
    target_path = os.path.join(assets_dir, f"{name}.png")
    # Backup existing if not already backed up
    backup_path = os.path.join(backup_dir, f"{name}.png")
    if os.path.exists(target_path) and not os.path.exists(backup_path):
        import shutil
        shutil.copy2(target_path, backup_path)
        
    out_img.save(target_path, "PNG")
    print(f"Saved {name}.png with size {out_img.size} to {target_path}")

print("All 5 assets updated successfully!")
