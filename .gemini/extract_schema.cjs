const fs = require('fs');

const typesFile = fs.readFileSync('/tmp/opina-db-audit-package/02_schema_source/database.types.ts', 'utf8');

const tablesMatch = typesFile.match(/public:\s*{\s*Tables:\s*{([\s\S]*?)}\s*Views:/);

const tables = [];
const columns = [];

if (tablesMatch) {
  const tablesContent = tablesMatch[1];
  const tableBlocks = tablesContent.split(/\n\s*([a-zA-Z0-9_]+):\s*{\s*Row:\s*{([\s\S]*?)}/g);
  
  for (let i = 1; i < tableBlocks.length; i += 3) {
    const tableName = tableBlocks[i];
    const rowContent = tableBlocks[i+1];
    
    tables.push(`public,${tableName},Transaction/Data storage,Core`);
    
    if (rowContent) {
      const colLines = rowContent.split('\n').filter(line => line.trim() && line.includes(':'));
      colLines.forEach(line => {
        const parts = line.split(':');
        let colName = parts[0].trim().replace(/\?/g, '').replace(/"/g, '').replace(/'/g, '');
        let colType = parts.slice(1).join(':').trim().replace(/;/g, '').replace(/"/g, '""');
        let isNullable = (line.includes('?:') || colType.includes('null')) ? 'TRUE' : 'FALSE';
        
        columns.push(`public,${tableName},${colName},"${colType}",${isNullable},,,`);
      });
    }
  }
}

fs.writeFileSync('/tmp/opina-db-audit-package/01_database_inventory/TABLES_INVENTORY.csv', 'schema,table_name,purpose,estimated_role_in_product\n' + tables.join('\n'));
fs.writeFileSync('/tmp/opina-db-audit-package/01_database_inventory/COLUMNS_INVENTORY.csv', 'schema,table_name,column_name,data_type,is_nullable,default_value,is_primary_key,is_foreign_key,notes\n' + columns.join('\n'));

console.log("Schema extraction complete.");
