import { execSync } from 'child_process';
const result = execSync('PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "\\copy (SELECT name AS \\"Marca\\", slug AS \\"Slug\\", category AS \\"Subcategoría\\", metadata->>\\'domain\\' AS \\"Dominio\\" FROM entities WHERE type = \\'brand\\' ORDER BY name) TO STDOUT WITH CSV HEADER;"', { encoding: 'utf-8' });
console.log(result);
