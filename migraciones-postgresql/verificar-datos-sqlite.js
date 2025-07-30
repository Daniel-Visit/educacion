const { PrismaClient } = require('@prisma/client');

// Configurar específicamente para SQLite
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

async function verificarDatos() {
  try {
    console.log('🔍 VERIFICACIÓN COMPLETA DE DATOS EN SQLITE');
    console.log('=' .repeat(50));

    // Query directa para asignatura
    console.log('\n📋 TABLA: asignatura');
    const asignaturas = await prisma.$queryRaw`SELECT * FROM asignatura ORDER BY id`;
    console.log(`Total registros: ${asignaturas.length}`);
    asignaturas.forEach(row => {
      console.log(`  ID: ${row.id} | Nombre: "${row.nombre}"`);
    });

    // Query directa para nivel
    console.log('\n📋 TABLA: nivel');
    const niveles = await prisma.$queryRaw`SELECT * FROM nivel ORDER BY id`;
    console.log(`Total registros: ${niveles.length}`);
    niveles.forEach(row => {
      console.log(`  ID: ${row.id} | Nombre: "${row.nombre}"`);
    });

    // Query directa para metodologia
    console.log('\n📋 TABLA: metodologia');
    const metodologias = await prisma.$queryRaw`SELECT * FROM metodologia ORDER BY id`;
    console.log(`Total registros: ${metodologias.length}`);
    metodologias.forEach(row => {
      console.log(`  ID: ${row.id} | Nombre: "${row.nombre_metodologia}"`);
    });

    // Query directa para oa
    console.log('\n📋 TABLA: oa');
    const oas = await prisma.$queryRaw`SELECT id, oas_id, descripcion_oas, nivel_id, asignatura_id FROM oa ORDER BY id LIMIT 5`;
    console.log(`Total registros: ${oas.length} (mostrando primeros 5)`);
    oas.forEach(row => {
      console.log(`  ID: ${row.id} | OA: "${row.oas_id}" | Nivel: ${row.nivel_id} | Asignatura: ${row.asignatura_id}`);
    });

    // Listar todas las tablas
    console.log('\n📋 TODAS LAS TABLAS EN LA BASE DE DATOS:');
    const tablas = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
    tablas.forEach(tabla => {
      console.log(`  - ${tabla.name}`);
    });

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarDatos(); 