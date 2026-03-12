const xlsx = require('xlsx');

function readAndPrint(filePath) {
  console.log(`\n\n=== Reading: ${filePath} ===`);
  try {
    const workbook = xlsx.readFile(filePath);
    console.log("Sheets:", workbook.SheetNames);
    
    // Read the first non-empty sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`\nFirst 5 rows of sheet '${sheetName}':`);
    for (let i = 0; i < Math.min(5, data.length); i++) {
      console.log(data[i]);
    }
  } catch (e) {
    console.error("Error reading file:", e.message);
  }
}

readAndPrint('../Catalogo Madre/Catalogo Categorias - Final .xlsx');
readAndPrint('../Catalogo Madre/catalogo_madre_subcat_opciones.xlsx');
