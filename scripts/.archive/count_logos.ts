import xlsx from 'xlsx';

const wb = xlsx.readFile('Listado_Marcas_Consolidado.xlsx');
const sheetName = wb.SheetNames[0];
const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

let withLogo = 0;
let quality1 = 0;
let quality2 = 0;
let quality3 = 0;
let noLogo = 0;

data.forEach((row: any) => {
    if (row['Logo (SI o NO)'] === 'SI') withLogo++;
    if (row['Calidad de Logo'] === 1) quality1++;
    else if (row['Calidad de Logo'] === 2) quality2++;
    else if (row['Calidad de Logo'] === 3) quality3++;
    else if (row['Calidad de Logo'] === 4) noLogo++;
});

console.log(`Total con Logo: ${withLogo}`);
console.log(`Calidad 1 (Perfecta): ${quality1}`);
console.log(`Calidad 2 (Regular): ${quality2}`);
console.log(`Calidad 3 (Baja): ${quality3}`);
console.log(`Sin Logo (4): ${noLogo}`);
console.log(`Total Registros: ${data.length}`);
