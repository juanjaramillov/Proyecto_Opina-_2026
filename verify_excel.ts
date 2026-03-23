import xlsx from 'xlsx';

const wb = xlsx.readFile('Listado_Marcas_Consolidado.xlsx');
const sheetName = wb.SheetNames[0];
const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

const chevrolet = data.find((d: any) => d['Marca'] === 'Chevrolet');
const apple = data.find((d: any) => d['Marca'] === 'Apple');
const randomSample = data.slice(50, 52);

console.log('Chevrolet row:', chevrolet);
console.log('Apple row:', apple);
console.log('Random sample:', randomSample);
