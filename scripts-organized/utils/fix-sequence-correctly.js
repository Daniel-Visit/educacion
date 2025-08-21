const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSequenceCorrectly() {
  try {
    console.log('🔧 Corrigiendo secuencia de modulo_horario correctamente...\n');
    
    // 1. Obtener el ID máximo real de la tabla
    const maxIdResult = await prisma.$queryRaw`
      SELECT MAX(id) as maxId FROM modulo_horario
    `;
    const maxId = parseInt(maxIdResult[0].maxId) || 0;
    
    console.log(`📊 ID máximo en la tabla: ${maxId}`);
    
    // 2. Resetear la secuencia al valor correcto
    const nextId = maxId + 1;
    console.log(`🎯 Reseteando secuencia a: ${nextId}`);
    
    const resetResult = await prisma.$executeRaw`
      SELECT setval('modulo_horario_id_seq', ${nextId}, false)
    `;
    
    console.log('✅ Secuencia reseteada correctamente');
    
    // 3. Verificar que se corrigió
    const verifyResult = await prisma.$queryRaw`
      SELECT nextval('modulo_horario_id_seq') as next_id
    `;
    
    console.log(`🔍 Próximo ID que se generará: ${verifyResult[0].next_id}`);
    
    // 4. Verificar que no hay conflictos
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
    console.error('❌ Error al corregir la secuencia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la corrección
fixSequenceCorrectly();
