import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = 'https://neltawfiwpvunkwyvfse.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHRhd2Zpd3B2dW5rd3l2ZnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQ2NzYsImV4cCI6MjA4NzY1NDY3Nn0.RUszyzGL4Hb8Sa30_GJwYOVWVFHtbtUMm9J4mP_Ox2I';

const supabase = createClient(url, key);

async function check() {
  const { data: entities } = await supabase.from('entities').select('id, slug, name').order('name');
  if (!entities) return;

  const exts = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
  const logosDir = path.join(process.cwd(), 'public', 'logos', 'entities');
  
  const missingEntities = [];
  
  for (const entity of entities) {
    let found = false;
    if (entity.slug) {
      for (const ext of exts) {
        if (fs.existsSync(path.join(logosDir, `${entity.slug}${ext}`))) {
          found = true;
          break;
        }
      }
    }
    if (!found) {
      missingEntities.push(`- ${entity.name}`);
    }
  }
  
  console.log("### Marcas y Entidades sin Logo Local (" + missingEntities.length + ")\n");
  console.log(missingEntities.join('\n'));
  
}

check().catch(console.error);
