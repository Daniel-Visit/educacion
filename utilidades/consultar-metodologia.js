const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function consultarMetodologia() {
  try {
    console.log('🔍 CONSULTANDO METODOLOGIA DIRECTAMENTE');
    console.log('=' .repeat(50));

    // Consulta directa usando queryRaw
    const metodologias = await prisma.$queryRaw`SELECT * FROM metodologia ORDER BY id LIMIT 5`;

    console.log('📋 RESULTADOS:');
    console.log(JSON.stringify(metodologias, null, 2));

    console.log('\n✅ Consulta completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

consultarMetodologia(); 