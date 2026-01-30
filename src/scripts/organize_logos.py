
import os
import shutil
import re

LOGOS_DIR = "public/logos"

# Map folder name (cleaned) to ID
# This helps map "Burger King" -> "burgerking"
def clean_name(name):
    # Remove registered trademark, spaces, dashes, etc.
    name = name.replace("®", "").replace("™", "")
    return re.sub(r'[^a-zA-Z0-9]', '', name).lower()

# Priority: svg > png > jpg > jpeg > webp
EXT_PRIORITY = {'.svg': 0, '.png': 1, '.jpg': 2, '.jpeg': 2, '.webp': 3}

files_moved = []

if not os.path.exists(LOGOS_DIR):
    print(f"Directory {LOGOS_DIR} not found.")
    exit(1)

# specific manual overrides if fuzzy matching fails or standard logic is insufficient
OVERRIDES = {
    'cocacola': 'cocacola',
    'pepsi': 'pepsi',
    'mcdonalds': 'mcdonalds',
    'burgerking': 'burgerking',
    'mercadopago': 'mercadopago',
    'bancochile': 'bancochile',
    'bancodechile': 'bancochile',
    'bancoestado': 'bancoestado',
    'santaisabel': 'santaisabel',
    'newbalance': 'newbalance',
    'redbull': 'redbull',
    'applemusic': 'applemusic',
    'youtubemusic': 'youtube', # Map youtube to youtube for now, battles has youtube music as youtube? No it has unique id.
    # actually battles has id: "youtube" for "YouTube Music". 
    'primevideo': 'primevideo' 
}

# Go through directories
for item in os.listdir(LOGOS_DIR):
    path = os.path.join(LOGOS_DIR, item)
    if os.path.isdir(path):
        # It's a brand folder from unzip
        brand_id = clean_name(item)
        
        # Find best file
        best_file = None
        best_score = 100
        
        for root, dirs, files in os.walk(path):
            for file in files:
                name, ext = os.path.splitext(file)
                ext = ext.lower()
                if ext in EXT_PRIORITY:
                    score = EXT_PRIORITY[ext]
                    if score < best_score:
                        best_score = score
                        best_file = os.path.join(root, file)
        
        if best_file:
            # Determine new name
            _, ext = os.path.splitext(best_file)
            new_name = f"{brand_id}-logo{ext}"
            new_path = os.path.join(LOGOS_DIR, new_name)
            
            # Move
            shutil.move(best_file, new_path)
            files_moved.append(new_name)
            print(f"Moved {best_file} -> {new_name}")
            
            # Remove directory
            shutil.rmtree(path)
        else:
            print(f"No valid image found in {path}")
            shutil.rmtree(path)

# Handle loose flat files (rename them too if needed? User uploaded some flat files)
# For now, we list what we have
existing_files = [f for f in os.listdir(LOGOS_DIR) if os.path.isfile(os.path.join(LOGOS_DIR, f)) and f != ".DS_Store"]
print("Final Files:", existing_files)
