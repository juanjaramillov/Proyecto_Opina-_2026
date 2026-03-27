import xlsx from 'xlsx';
import puppeteer from 'puppeteer';

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

async function main() {
  const resultData = [];
  
  for (const row of data) {
    row.DominioExtracted = extractDomain(row['Dominio Web']);
  }
  
  // Rule for duplicate brands
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      if (i !== j) {
        if (data[i].Marca.includes(data[j].Marca)) {
           if (data[i].DominioExtracted && !data[j].DominioExtracted) {
             data[j].DominioExtracted = data[i].DominioExtracted;
           } else if (!data[i].DominioExtracted && data[j].DominioExtracted) {
             data[i].DominioExtracted = data[j].DominioExtracted;
           }
        }
      }
    }
  }

  console.log(`Starting Puppeteer to verify ${data.length} brands...`);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Test images in browser context to bypass CDNs
  const domains = Array.from(new Set(data.map(d => d.DominioExtracted).filter(Boolean)));
  console.log(`Checking ${domains.length} unique domains...`);

  try {
    await page.goto('about:blank');
  } catch (e) {
    console.error('Failed to load about:blank', e);
  }
  
  const domainLogoCache: Record<string, boolean> = {};

  // We are going to strictly isolate the evaluate context
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    let isOk = false;
    try {
        const evalResult = await page.evaluate(new Function('dom', `
            return new Promise((resolve) => {
                const img = new Image();
                img.style.display = 'none';
                document.body.appendChild(img);
                
                let isDone = false;
                const finish = (res) => {
                    if (!isDone) {
                        isDone = true;
                        if (img.parentNode) img.parentNode.removeChild(img);
                        resolve(res);
                    }
                };
                
                img.onload = () => finish(true);
                img.onerror = () => finish(false);
                img.src = 'https://asset.brandfetch.io/' + dom + '/logo';
                setTimeout(() => finish(false), 2000);
            });
        `) as any, domain);
        isOk = evalResult as boolean;
    } catch (e) {
        console.error(`Error on ${domain}: ${e}`);
        isOk = false;
    }
    
    domainLogoCache[domain] = isOk;
    
    if (domain === 'apple.com' || domain.includes('apple') || isOk) {
      console.log(`[DEBUG] domain: ${domain} -> result: ${isOk}`);
    }
    if (i % 25 === 0) {
      console.log(`Checked ${i} / ${domains.length} unique domains...`);
    }
  }

  await browser.close();

  for (const row of data) {
    const isBrandfetchOk = row.DominioExtracted ? domainLogoCache[row.DominioExtracted] : false;
    let logoStatus = 'NO';
    let source = '';
    
    if (isBrandfetchOk) {
      logoStatus = 'SI';
      source = 'URL con Brandefetch';
    } else {
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
  }

  const newSheet = xlsx.utils.json_to_sheet(resultData);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Marcas_Logos');
  xlsx.writeFile(newWorkbook, 'Marcas_Logos_Analisis.xlsx');
  console.log('Done! Regenerated Marcas_Logos_Analisis.xlsx');
}

main().catch(console.error);
