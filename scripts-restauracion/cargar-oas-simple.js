const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

async function cargarOAsSimple() {
  try {
    console.log('=== Cargando OAs de forma simple ===');

    // 1. Limpiar tabla
    console.log('1. Limpiando tabla...');
    await prisma.$executeRaw`DELETE FROM oa`;
    await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='oa'`;

    // 2. Cargar datos
    const oasPath = path.join(__dirname, '../OAS.csv');
    const oasCSV = fs.readFileSync(oasPath, 'utf-8');
    const oas = parse(oasCSV, {
      columns: true,
      delimiter: ';',
      trim: true,
      relax_quotes: true,
    });

    console.log(`2. Cargando ${oas.length} OAs...`);

    for (const row of oas) {
      const nivel_id = Number(row['nivel_id']);
      const asignatura_id = Number(row['asignatura_id']);
      const eje_id = Number(row['eje_id']);
      const minimo_clases = Number(row['minimo_clases']);
      const basal = (row['basal'] || '').toString().toLowerCase() === 'true';

      await prisma.oa.create({
        data: {
          nivel_id,
          asignatura_id,
          eje_id,
          eje_descripcion: row['eje_descripcion'],
          tipo_eje: row['tipo_eje'],
          oas_id: row['oas_id'],
          descripcion_oas: row['descripcion_oas'],
          basal,
          minimo_clases,
        },
      });
    }

    console.log('✅ Carga completada');

    // Verificar
    const total = await prisma.oa.count();
    console.log(`📊 Total de OAs: ${total}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cargarOAsSimple();
