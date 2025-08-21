const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarMetodologia() {
  try {
    console.log('🔍 VERIFICANDO TODOS LOS CAMPOS DE METODOLOGIA EN SQLITE');
    console.log('='.repeat(50));

    const metodologias = await prisma.metodologia.findMany({
      orderBy: { id: 'asc' },
    });

    console.log(`Total registros: ${metodologias.length}`);
    console.log('\n📋 DATOS COMPLETOS:');

    metodologias.forEach(metodologia => {
      console.log(`\nID: ${metodologia.id}`);
      console.log(`  Nombre: "${metodologia.nombre_metodologia}"`);
      console.log(`  Descripción: "${metodologia.descripcion}"`);
      console.log(`  Nivel Recomendado: "${metodologia.nivel_recomendado}"`);
      console.log(`  Fuentes Literatura: "${metodologia.fuentes_literatura}"`);
      console.log('  ---');
    });

    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarMetodologia();
