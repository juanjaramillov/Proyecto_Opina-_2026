const xlsx = require('xlsx');
const workbook = xlsx.readFile('Empresas_Finales.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);
function extractDomain(url) {
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
const domains = Array.from(new Set(data.map(d => extractDomain(d['Dominio Web'])).filter(Boolean)));
console.log('Sample extracted domains:', domains.slice(0, 10));
