const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixModuloSequence() {
  try {
    console.log('🔧 Corrigiendo secuencia de IDs de moduloHorario...');
    
    // 1. Obtener el ID máximo actual
    const maxIdResult = await prisma.$queryRaw`
      SELECT COALESCE(MAX(id), 0) as maxId FROM "modulo_horario"
    `;
    const maxId = parseInt(maxIdResult[0].maxId);
    
    console.log(`📊 ID máximo actual: ${maxId}`);
    
    // 2. Resetear la secuencia
    const resetResult = await prisma.$executeRaw`
      SELECT setval('modulo_horario_id_seq', ${maxId + 1})
    `;
    
    console.log('✅ Secuencia reseteada correctamente');
    
    // 3. Verificar que se corrigió
    const sequenceResult = await prisma.$queryRaw`
      SELECT last_value FROM modulo_horario_id_seq
    `;
    
    console.log(`🔍 Nueva secuencia: ${sequenceResult[0].last_value}`);
    
    // 4. Verificar que no hay conflictos de IDs
    const conflictsResult = await prisma.$queryRaw`
      SELECT id, COUNT(*) as count
      FROM "modulo_horario"
      GROUP BY id
      HAVING COUNT(*) > 1
    `;
    
    if (conflictsResult.length === 0) {
      console.log('✅ No hay conflictos de IDs duplicados');
    } else {
      console.log('⚠️  Se encontraron IDs duplicados:', conflictsResult);
    }
    
    console.log('🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al corregir la secuencia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixModuloSequence();
