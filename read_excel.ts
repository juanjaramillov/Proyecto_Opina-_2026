import xlsx from 'xlsx'

const workbook = xlsx.readFile('Empresas_Finales.xlsx')
const sheetName = workbook.SheetNames[0]
const sheet = workbook.Sheets[sheetName]
const data = xlsx.utils.sheet_to_json(sheet)

console.log('Total rows:', data.length)
console.log('Available columns in the file:', Object.keys(data[0] || {}))
console.log('Sample data (first 3 rows):', JSON.stringify(data.slice(0, 3), null, 2))
