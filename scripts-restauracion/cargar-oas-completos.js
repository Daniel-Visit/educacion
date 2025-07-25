const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

async function cargarOAsCompletos() {
  try {
    console.log('=== Cargando OAs completos desde OAS.csv ===');
    
    const oasPath = path.join(__dirname, '../OAS.csv');
    const oasCSV = fs.readFileSync(oasPath, 'utf-8');
    const oas = parse(oasCSV, { columns: true, delimiter: ';', trim: true, relax_quotes: true });

    console.log('Columnas detectadas en OAS.csv:', Object.keys(oas[0] || {}));
    console.log('Total de filas en OAS.csv:', oas.length);

    // Primero, limpiar todos los OAs existentes
    console.log('\n1. Limpiando OAs existentes...');
    await prisma.oa.deleteMany({});
    console.log('✅ OAs existentes eliminados');

    let processedCount = 0;
    let skippedCount = 0;

    console.log('\n2. Cargando nuevos OAs...');
    for (const row of oas) {
      try {
        const id = Number(row['id']);
        const nivel_id = Number(row['nivel_id']);
        const asignatura_id = Number(row['asignatura_id']);
        const eje_id = Number(row['eje_id']);
        const minimo_clases = Number(row['minimo_clases']);
        const basal = (row['basal'] || '').toString().toLowerCase() === 'true';
        
        // Usar $executeRaw para evitar las relaciones
        await prisma.$executeRaw`
          INSERT INTO oa (id, nivel_id, asignatura_id, eje_id, eje_descripcion, tipo_eje, oas_id, descripcion_oas, basal, minimo_clases)
          VALUES (${id}, ${nivel_id}, ${asignatura_id}, ${eje_id}, ${row['eje_descripcion']}, ${row['tipo_eje']}, ${row['oas_id']}, ${row['descripcion_oas']}, ${basal}, ${minimo_clases})
        `;
        
        processedCount++;
      } catch (error) {
        console.log('Error al crear OA:', error.message);
        console.log('Datos que causaron el error:', row);
        skippedCount++;
      }
    }
    
    console.log(`\n✅ OAs procesados: ${processedCount}, saltados: ${skippedCount}`);
    
    // Verificar la carga por asignatura
    console.log('\n3. Verificando carga por asignatura...');
    const oasLenguaje = await prisma.oa.count({
      where: { asignatura_id: 7 }
    });
    const oasMatematica = await prisma.oa.count({
      where: { asignatura_id: 9 }
    });
    
    console.log(`📊 OAs de Lenguaje: ${oasLenguaje}`);
    console.log(`📊 OAs de Matemática: ${oasMatematica}`);
    
    // Verificar por tipo_eje
    console.log('\n4. Verificando carga por tipo_eje...');
    const tipos = await prisma.oa.groupBy({
      by: ['tipo_eje'],
      _count: {
        tipo_eje: true
      }
    });
    
    tipos.forEach(tipo => {
      console.log(`📊 ${tipo.tipo_eje}: ${tipo._count.tipo_eje} OAs`);
    });
    
    console.log('\n🎉 ¡Carga de OAs completada exitosamente!');
    
  } catch (error) {
    console.error('Error al cargar OAs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cargarOAsCompletos(); 