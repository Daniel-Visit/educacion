import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('Poblando solo OA desde OAS.csv...');
  const oasPath = path.join(__dirname, '../OAS.csv');
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
  console.log(`OA procesados: ${processedCount}, saltados: ${skippedCount}`);

  // Poblar metodologías
  console.log('Poblando metodologías desde metodologias.csv...');
  const metodologiasPath = path.join(__dirname, '../metodologias.csv');
  const metodologiasCSV = fs.readFileSync(metodologiasPath, 'utf-8');
  const metodologias = parse(metodologiasCSV, { columns: true, delimiter: ';', skip_empty_lines: true });

  console.log('Columnas detectadas en metodologias.csv:', Object.keys(metodologias[0] || {}));
  console.log('Total de filas en metodologias.csv:', metodologias.length);

  let metodologiasProcessed = 0;
  let metodologiasSkipped = 0;

  for (const row of metodologias) {
    if (
      !row['nombre_metodologia'] ||
      !row['descripcion'] ||
      !row['nivel_recomendado'] ||
      !row['fuentes_literatura']
    ) {
      console.log('Saltando metodología con datos incompletos:', row);
      metodologiasSkipped++;
      continue;
    }
    
    try {
      await prisma.metodologia.upsert({
        where: { nombre_metodologia: row['nombre_metodologia'] },
        update: {
          descripcion: row['descripcion'],
          nivel_recomendado: row['nivel_recomendado'],
          fuentes_literatura: row['fuentes_literatura'],
        },
        create: {
          nombre_metodologia: row['nombre_metodologia'],
          descripcion: row['descripcion'],
          nivel_recomendado: row['nivel_recomendado'],
          fuentes_literatura: row['fuentes_literatura'],
        },
      });
      metodologiasProcessed++;
    } catch (error) {
      console.log('Error al crear metodología:', error);
      console.log('Datos que causaron el error:', row);
      metodologiasSkipped++;
    }
  }
  
  console.log(`Metodologías procesadas: ${metodologiasProcessed}, saltadas: ${metodologiasSkipped}`);
  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 