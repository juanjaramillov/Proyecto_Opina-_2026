-- 1. Add image_url column to battle_options
ALTER TABLE battle_options
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Add index for performance
CREATE INDEX IF NOT EXISTS idx_battle_options_image_url
ON battle_options (image_url);
