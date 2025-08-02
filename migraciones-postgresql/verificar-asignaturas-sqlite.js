const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarAsignaturas() {
  try {
    console.log('🔍 Verificando asignaturas en SQLite...');

    const asignaturas = await prisma.asignatura.findMany({
      orderBy: { id: 'asc' },
    });

    console.log(`\n📊 Total de asignaturas: ${asignaturas.length}`);
    console.log('\n📋 Lista de asignaturas:');

    asignaturas.forEach(asignatura => {
      console.log(`  ID: ${asignatura.id} | Nombre: "${asignatura.nombre}"`);
    });

    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarAsignaturas();
