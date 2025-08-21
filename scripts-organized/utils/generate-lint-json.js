const { execSync } = require('child_process');
const fs = require('fs');

console.log('Ejecutando linter...');

try {
  // Ejecutar el linter y capturar la salida
  const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8' });
  
  // Parsear la salida del linter
  const files = new Map();
  
  // Procesar cada línea de la salida
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
      
      if (!files.has(fullPath)) {
        files.set(fullPath, {
          filePath: fullPath,
          messages: [],
          suppressedMessages: [],
          errorCount: 0,
          fatalErrorCount: 0,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
          usedDeprecatedRules: []
        });
      }
      
      const file = files.get(fullPath);
      const severityNum = severity === 'Error' ? 2 : 1;
      
      file.messages.push({
        ruleId,
        severity: severityNum,
        message: cleanMessage,
        line: parseInt(line),
        column: parseInt(column),
        nodeType: null,
        messageId: severity === 'Error' ? 'error' : 'warning',
        endLine: parseInt(line),
        endColumn: parseInt(column) + 1
      });
      
      if (severity === 'Error') {
        file.errorCount++;
      } else {
        file.warningCount++;
      }
    }
  });
  
  // Convertir el Map a array
  const lintData = Array.from(files.values());
  
  // Guardar el JSON
  fs.writeFileSync('lint-errors.json', JSON.stringify(lintData, null, 2));
  
  console.log(`JSON generado: lint-errors.json`);
  console.log(`Total de archivos con errores: ${lintData.length}`);
  console.log(`Total de errores: ${lintData.reduce((sum, file) => sum + file.errorCount, 0)}`);
  console.log(`Total de warnings: ${lintData.reduce((sum, file) => sum + file.warningCount, 0)}`);
  
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
    
} catch (error) {
  console.error('Error ejecutando el linter:', error.message);
  process.exit(1);
}
