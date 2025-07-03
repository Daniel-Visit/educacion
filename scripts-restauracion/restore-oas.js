const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

async function restoreOAs() {
  try {
    console.log('=== Restaurando SOLO OAs ===');
    
    const oasPath = path.join(__dirname, 'OAS.csv');
    const oasCSV = fs.readFileSync(oasPath, 'utf-8');
    const oas = parse(oasCSV, { columns: true, delimiter: ';', skip_empty_lines: true });

    console.log('Columnas detectadas en OAS.csv:', Object.keys(oas[0] || {}));
    console.log('Total de filas en OAS.csv:', oas.length);

    let processedCount = 0;
    let skippedCount = 0;

    for (const row of oas) {
      const nivel_id = Number(row['nivel_id']);
      const asignatura_id = Number(row['asignatura_id']);
      const eje_id = Number(row['eje_id']);
      const minimo_clases = Number(row['minimo_clases']);
      
      if (
        isNaN(nivel_id) ||
        isNaN(asignatura_id) ||
        isNaN(eje_id) ||
        isNaN(minimo_clases) ||
        !row['eje_descripcion'] ||
        !row['oas_id'] ||
        !row['descripcion_oas']
      ) {
        console.log('Saltando fila con datos incompletos o inválidos:', row);
        skippedCount++;
        continue;
      }
      
      const basal = (row['basal'] || '').toString().toLowerCase() === 'true';
      
      try {
        await prisma.oa.create({
          data: {
            nivel_id,
            asignatura_id,
            eje_id,
            eje_descripcion: row['eje_descripcion'],
            oas_id: row['oas_id'],
            descripcion_oas: row['descripcion_oas'],
            basal,
            minimo_clases,
          },
        });
        processedCount++;
      } catch (error) {
        console.log('Error al crear OA:', error);
        console.log('Datos que causaron el error:', {
          nivel_id,
          asignatura_id,
          eje_id,
          eje_descripcion: row['eje_descripcion'],
          oas_id: row['oas_id'],
          descripcion_oas: row['descripcion_oas'],
          basal,
          minimo_clases,
        });
        skippedCount++;
      }
    }
    
    console.log(`✅ OAs procesados: ${processedCount}, saltados: ${skippedCount}`);
  } catch (error) {
    console.error('Error al restaurar OAs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreOAs(); 