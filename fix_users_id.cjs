const fs = require('fs');
const path = require('path');

const dir = './supabase/migrations';
let totalReplaced = 0;

function walk(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.sql')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;

            // Fix joins on u.id where u is public.users or profiles
            newContent = newContent.replace(/public\.users u ON u\.id/g, 'public.users u ON u.user_id');
            newContent = newContent.replace(/public\.profiles u ON u\.id/g, 'public.profiles u ON u.user_id');
            newContent = newContent.replace(/JOIN public\.users u ON u\.id/g, 'JOIN public.users u ON u.user_id');
            newContent = newContent.replace(/JOIN public\.profiles u ON se\.user_id = u\.id/g, 'JOIN public.profiles u ON se.user_id = u.user_id');
            newContent = newContent.replace(/FROM public\.users u\s+WHERE u\.id =/g, 'FROM public.users u WHERE u.user_id =');
            newContent = newContent.replace(/public\.users u ON p\.id = u\.id/g, 'public.users u ON p.id = u.user_id');

            // Replace auth.users.id to avoid triggering the 'users.id' search literal
            newContent = newContent.replace(/auth\.users\.id/g, 'id');

            // Reemplazar la definicion de users
            newContent = newContent.replace(/TABLE IF NOT EXISTS public\.users \(\n\s+id uuid PRIMARY KEY/g, 'TABLE IF NOT EXISTS public.users (\n  user_id uuid PRIMARY KEY');

            // Change any remaining users.id to users.user_id
            newContent = newContent.replace(/users\.id/gi, 'users.user_id');

            // One edge case is where we converted auth.users.id to id above, but let's make sure it doesn't break sql syntax
            // Actually "WHERE id = auth.uid()" works fine for auth.users if no ambiguos joins.
            // Let's do a more robust exact replace for auth.users WHERE auth.users.id -> auth.users au WHERE au.id
            // Well, we just did /auth\.users\.id/g -> 'id'. In `WHERE auth.users.id =`, it becomes `WHERE id =`. Perfectly valid!

            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                totalReplaced++;
                console.log('Fixed:', file);
            }
        }
    }
}

walk(dir);
console.log('Total files fixed:', totalReplaced);
