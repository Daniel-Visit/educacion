const fs = require('fs');

// Leer el archivo JSON
const lintData = JSON.parse(fs.readFileSync('lint-errors-updated.json', 'utf8'));

// Crear CSV
let csv = 'Archivo,Línea,Columna,Regla,Severidad,Mensaje\n';

lintData.forEach(file => {
  if (file.messages && file.messages.length > 0) {
    file.messages.forEach(message => {
      const severity = message.severity === 2 ? 'Error' : 'Warning';
      const escapedMessage = `"${message.message.replace(/"/g, '""')}"`;
      const relativePath = file.filePath.replace('/Users/daniel/Downloads/Educacion/educacion-app/', '');
      
      csv += `${relativePath},${message.line},${message.column},${message.ruleId},${severity},${escapedMessage}\n`;
    });
  }
});

// Guardar CSV
fs.writeFileSync('lint-errors.csv', csv);

console.log('CSV generado: lint-errors.csv');
console.log(`Total de errores: ${lintData.reduce((sum, file) => sum + (file.messages?.length || 0), 0)}`);

// Mostrar estadísticas por tipo de error
const errorTypes = {};
lintData.forEach(file => {
  if (file.messages) {
    file.messages.forEach(message => {
      errorTypes[message.ruleId] = (errorTypes[message.ruleId] || 0) + 1;
    });
  }
});

console.log('\nEstadísticas por tipo de error:');
Object.entries(errorTypes)
  .sort(([,a], [,b]) => b - a)
  .forEach(([rule, count]) => {
    console.log(`${rule}: ${count}`);
  }); 