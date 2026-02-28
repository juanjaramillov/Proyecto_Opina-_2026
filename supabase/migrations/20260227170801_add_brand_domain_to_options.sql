-- Add brand_domain column to options table to support Brandfetch CDN logic
ALTER TABLE battle_options ADD COLUMN IF NOT EXISTS brand_domain text;
