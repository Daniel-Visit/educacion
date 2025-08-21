const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixHorarioSequence() {
  try {
    console.log('🔧 Iniciando fix de secuencia de horario...');
    
    // Obtener el máximo ID actual en la tabla horario
    const maxIdResult = await prisma.$queryRaw`
      SELECT COALESCE(MAX(id), 0) as max_id FROM "public"."horario"
    `;
    
    const maxId = parseInt(maxIdResult[0].max_id);
    console.log(`📊 ID máximo actual en horario: ${maxId}`);
    
    // Resetear la secuencia al siguiente valor después del máximo
    const nextId = maxId + 1;
    await prisma.$executeRaw`
      SELECT setval('"public"."horario_id_seq"', ${nextId}, false)
    `;
    
    console.log(`✅ Secuencia reseteada a: ${nextId}`);
    console.log('🎉 Problema de secuencia resuelto. Ahora puedes crear horarios.');
    
  } catch (error) {
    console.error('❌ Error al fixear la secuencia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixHorarioSequence();
