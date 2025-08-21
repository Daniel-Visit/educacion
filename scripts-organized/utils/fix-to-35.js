const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTo35() {
  try {
    console.log('🔧 Reseteando secuencia a ID 35...\n');
    
    // Resetear la secuencia a 35
    await prisma.$executeRaw`
      SELECT setval('modulo_horario_id_seq', 35, false)
    `;
    
    console.log('✅ Secuencia reseteada a 35');
    
    // Verificar que se corrigió
    const verifyResult = await prisma.$queryRaw`
      SELECT nextval('modulo_horario_id_seq') as next_id
    `;
    
    console.log(`🔍 Próximo ID que se generará: ${verifyResult[0].next_id}`);
    
    // Verificar que no hay conflictos
    const conflictResult = await prisma.$queryRaw`
      SELECT id FROM modulo_horario WHERE id = ${verifyResult[0].next_id}
    `;
    
    if (conflictResult.length === 0) {
      console.log('✅ No hay conflictos - La secuencia está correcta');
    } else {
      console.log('❌ Aún hay conflictos');
    }
    
    console.log('\n🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTo35();
