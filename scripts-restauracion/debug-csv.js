const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

async function debugCSV() {
  try {
    console.log('=== Debuggeando CSV ===');

    const oasPath = path.join(__dirname, '../OAS.csv');
    const oasCSV = fs.readFileSync(oasPath, 'utf-8');

    // Probar con diferentes opciones de parsing
    console.log('=== Probando diferentes opciones de parsing ===');

    // Opción 1: Con relax_quotes
    const oas1 = parse(oasCSV, {
      columns: true,
      delimiter: ';',
      trim: true,
      relax_quotes: true,
    });
    console.log('Opción 1 (relax_quotes):', oas1.length, 'filas');
    console.log('Fila 50:', oas1[49]);
    console.log('Fila 51:', oas1[50]);

    // Opción 2: Con relax
    const oas2 = parse(oasCSV, {
      columns: true,
      delimiter: ';',
      trim: true,
      relax: true,
    });
    console.log('Opción 2 (relax):', oas2.length, 'filas');
    console.log('Fila 50:', oas2[49]);
    console.log('Fila 51:', oas2[50]);

    // Opción 3: Con skip_empty_lines
    const oas3 = parse(oasCSV, {
      columns: true,
      delimiter: ';',
      trim: true,
      skip_empty_lines: true,
    });
    console.log('Opción 3 (skip_empty_lines):', oas3.length, 'filas');
    console.log('Fila 50:', oas3[49]);
    console.log('Fila 51:', oas3[50]);

    // Opción 4: Sin trim
    const oas4 = parse(oasCSV, { columns: true, delimiter: ';' });
    console.log('Opción 4 (sin trim):', oas4.length, 'filas');
    console.log('Fila 50:', oas4[49]);
    console.log('Fila 51:', oas4[50]);
  } catch (error) {
    console.error('Error:', error);
  }
}

debugCSV();
