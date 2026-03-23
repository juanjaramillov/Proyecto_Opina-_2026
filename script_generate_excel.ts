import xlsx from 'xlsx';


const workbook = xlsx.readFile('Empresas_Finales.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data: any[] = xlsx.utils.sheet_to_json(sheet);

function extractDomain(url: string | undefined): string {
  if (!url) return '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    let hostname = urlObj.hostname;
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    return hostname;
  } catch (e) {
    return url.replace('www.', '').split('/')[0];
  }
}

async function checkBrandfetchFallback(domain: string): Promise<boolean> {
  if (!domain) return false;
  try {
    const res = await fetch(`https://asset.brandfetch.io/${domain}/logo`, { method: 'HEAD' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function main() {
  const resultData = [];
  
  // Need to find similar brands first (e.g. "La Roche-Posay Anthelios" and "La Roche-Posay")
  // Let's group by domain to share domains if they are similar.
  // Actually, some rows might have empty domains? Or similar names?
  
  // Let's add Dominio column to all rows
  for (const row of data) {
    row.DominioExtracted = extractDomain(row['Dominio Web']);
  }
  
  // For resolving similar brands: if a brand name is a substring of another brand name in the same category,
  // they should probably share the same domain and logo logic.
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      if (i !== j) {
        if (data[i].Marca.includes(data[j].Marca)) {
           // data[i] is like "La Roche-Posay Anthelios", data[j] is "La Roche-Posay"
           // The prompt: "ambas opciones deben tener el mismo logo de La Roche-Posay Anthelios"
           // We'll copy the domain of the more specific one if needed.
           if (data[i].DominioExtracted && !data[j].DominioExtracted) {
             data[j].DominioExtracted = data[i].DominioExtracted;
           } else if (!data[i].DominioExtracted && data[j].DominioExtracted) {
             data[i].DominioExtracted = data[j].DominioExtracted;
           }
        }
      }
    }
  }

  console.log(`Processing ${data.length} rows...`);

  // We can do concurrency for the fetch requests
  const CHUNK_SIZE = 50;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    
    await Promise.all(chunk.map(async (row) => {
      const isBrandfetchOk = await checkBrandfetchFallback(row.DominioExtracted);
      let logoStatus = 'NO';
      let source = '';
      
      if (isBrandfetchOk) {
        logoStatus = 'SI';
        source = 'URL con Brandefetch';
      } else {
        // If not found in brandfetch
        logoStatus = 'NO';
        source = 'archivo adjunto en Entities';
      }
      
      resultData.push({
        'Categoria': row['Categoria'],
        'Subcategoria': row['Subcategoria'],
        'Marca': row['Marca'],
        'Dominio': row.DominioExtracted || row['Dominio Web'],
        'Logo (SI o NO)': logoStatus,
        'Medio Captura Imagen': source,
      });
    }));
    console.log(`Processed ${Math.min(i + CHUNK_SIZE, data.length)} / ${data.length}...`);
  }

  // Write new excel
  const newSheet = xlsx.utils.json_to_sheet(resultData);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Marcas_Logos');
  xlsx.writeFile(newWorkbook, 'Marcas_Logos_Analisis.xlsx');
  console.log('Done! Generated Marcas_Logos_Analisis.xlsx');
}

main();
