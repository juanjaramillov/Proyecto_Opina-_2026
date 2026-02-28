-- Script to remove duplicate battle_options (keeping the oldest one)
BEGIN;

WITH duplicates AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY LOWER(TRIM(label)) 
               ORDER BY created_at ASC
           ) as row_num
    FROM battle_options
)
DELETE FROM battle_options 
WHERE id IN (
    SELECT id 
    FROM duplicates 
    WHERE row_num > 1
);

COMMIT;
