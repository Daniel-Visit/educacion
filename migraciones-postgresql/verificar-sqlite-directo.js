const { PrismaClient } = require('@prisma/client');

// Usar el esquema de SQLite (el default)
const prisma = new PrismaClient();

async function verificarSQLite() {
  try {
    console.log('🔍 VERIFICANDO SQLITE CON ESQUEMA CORRECTO');
    console.log('='.repeat(50));

    // Verificar asignatura
    console.log('\n📋 TABLA: asignatura');
    const asignaturas = await prisma.asignatura.findMany({
      orderBy: { id: 'asc' },
    });
    console.log(`Total registros: ${asignaturas.length}`);
    asignaturas.forEach(asignatura => {
      console.log(`  ID: ${asignatura.id} | Nombre: "${asignatura.nombre}"`);
    });

    // Verificar nivel
    console.log('\n📋 TABLA: nivel');
    const niveles = await prisma.nivel.findMany({
      orderBy: { id: 'asc' },
    });
    console.log(`Total registros: ${niveles.length}`);
    niveles.forEach(nivel => {
      console.log(`  ID: ${nivel.id} | Nombre: "${nivel.nombre}"`);
    });

    // Verificar metodologia
    console.log('\n📋 TABLA: metodologia');
    const metodologias = await prisma.metodologia.findMany({
      orderBy: { id: 'asc' },
    });
    console.log(`Total registros: ${metodologias.length}`);
    metodologias.forEach(metodologia => {
      console.log(
        `  ID: ${metodologia.id} | Nombre: "${metodologia.nombre_metodologia}"`
      );
    });

    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSQLite();
