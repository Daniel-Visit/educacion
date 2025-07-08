const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function restoreAllData() {
  try {
    console.log('=== Restaurando TODOS los datos ===');
    
    // Definir la ruta a la carpeta de scripts
    const scriptsPath = path.join(__dirname);
    
    // 1. Restaurar Asignaturas
    console.log('\n1. Restaurando Asignaturas...');
    const asignaturas = await loadCSV(path.join(scriptsPath, 'Asignaturas.csv'), ',');
    for (const row of asignaturas) {
      await prisma.asignatura.upsert({
        where: { nombre: row.nombre },
        update: {},
        create: { nombre: row.nombre }
      });
    }
    console.log(`✅ ${asignaturas.length} asignaturas restauradas`);
    
    // 2. Restaurar Niveles
    console.log('\n2. Restaurando Niveles...');
    const niveles = await loadCSV(path.join(scriptsPath, 'Niveles.csv'), ';');
    for (const row of niveles) {
      await prisma.nivel.upsert({
        where: { nombre: row.Nivel },
        update: {},
        create: { nombre: row.Nivel }
      });
    }
    console.log(`✅ ${niveles.length} niveles restaurados`);
    
    // 3. Restaurar Metodologías
    console.log('\n3. Restaurando Metodologías...');
    const metodologias = await loadCSV(path.join(scriptsPath, 'metodologias.csv'), ';');
    for (const row of metodologias) {
      await prisma.metodologia.upsert({
        where: { nombre_metodologia: row.nombre_metodologia },
        update: {},
        create: {
          nombre_metodologia: row.nombre_metodologia,
          descripcion: row.descripcion,
          nivel_recomendado: row.nivel_recomendado,
          fuentes_literatura: row.fuentes_literatura
        }
      });
    }
    console.log(`✅ ${metodologias.length} metodologías restauradas`);
    
    // 4. Restaurar OAs
    console.log('\n4. Restaurando OAs...');
    const oas = await loadCSV(path.join(scriptsPath, 'OAS.csv'), ',');
    let oasCreados = 0;
    for (const row of oas) {
      // Buscar nivel y asignatura
      const nivel = await prisma.nivel.findFirst({ where: { nombre: row.nivel } });
      const asignatura = await prisma.asignatura.findFirst({ where: { nombre: row.asignatura } });
      
      if (nivel && asignatura) {
        try {
          await prisma.oa.create({
            data: {
              nivel_id: nivel.id,
              asignatura_id: asignatura.id,
              eje_id: parseInt(row.eje_id),
              eje_descripcion: row.eje_descripcion,
              oas_id: row.oas_id,
              descripcion_oas: row.descripcion_oas,
              basal: row.basal === 'true',
              minimo_clases: parseInt(row.minimo_clases)
            }
          });
          oasCreados++;
        } catch (e) {
          // Si es error de duplicado, ignorar
          if (e.code !== 'P2002') {
            console.error('Error al crear OA:', e);
          }
        }
      }
    }
    console.log(`✅ ${oasCreados} OAs restaurados`);
    
    console.log('\n🎉 ¡TODOS los datos han sido restaurados exitosamente!');
    
  } catch (error) {
    console.error('Error al restaurar datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function loadCSV(filename, separator = ',') {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filename)
      .pipe(csv({ separator }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

restoreAllData(); 