const fs = require('fs');

console.log('Procesando salida del linter...');

// Leer la salida del linter desde el archivo
const lintOutput = fs.readFileSync('lint-output.txt', 'utf8');

// Crear CSV
let csv = 'Archivo,Ruta_Completa,Línea,Columna,Tipo_Error,Regla,Mensaje\n';

// Procesar cada línea
lintOutput.split('\n').forEach(line => {
  // Buscar líneas que contengan errores o warnings
  const errorMatch = line.match(/^([^:]+):(\d+):(\d+)\s+(Error|Warning):\s+(.+)$/);
  
  if (errorMatch) {
    const [, filePath, line, column, severity, message] = errorMatch;
    
    // Extraer la regla del mensaje
    const ruleMatch = message.match(/^(.+?)\s+(.+)$/);
    const ruleId = ruleMatch ? ruleMatch[1] : 'unknown';
    const cleanMessage = ruleMatch ? ruleMatch[2] : message;
    
    // Normalizar la ruta del archivo
    const normalizedPath = filePath.startsWith('./') ? filePath.substring(2) : filePath;
    const fullPath = `/Users/daniel/Downloads/Educacion/educacion-app/${normalizedPath}`;
    
    // Escapar comillas en el mensaje
    const escapedMessage = cleanMessage.replace(/"/g, '""');
    
    csv += `"${normalizedPath}","${fullPath}",${line},${column},${severity},"${ruleId}","${escapedMessage}"\n`;
  }
});

// Guardar CSV
fs.writeFileSync('lint-errors-complete.csv', csv);

console.log('CSV generado: lint-errors-complete.csv');

// Contar errores por tipo
const errorTypes = {};
const lines = csv.split('\n').slice(1); // Excluir header
lines.forEach(line => {
  if (line.trim()) {
    const parts = line.split(',');
    if (parts.length >= 6) {
      const rule = parts[5].replace(/"/g, '');
      errorTypes[rule] = (errorTypes[rule] || 0) + 1;
    }
  }
});

console.log('\nEstadísticas por tipo de error:');
Object.entries(errorTypes)
  .sort(([,a], [,b]) => b - a)
  .forEach(([rule, count]) => {
    console.log(`${rule}: ${count}`);
  });

console.log(`\nTotal de errores: ${lines.length - 1}`);
