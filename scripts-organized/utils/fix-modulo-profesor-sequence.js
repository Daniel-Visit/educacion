const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixModuloProfesorSequence() {
  try {
    console.log('🔧 Corrigiendo secuencia de moduloHorarioProfesor...\n');
    
    // 1. Verificar registros existentes
    const allRecords = await prisma.$queryRaw`
      SELECT id, "moduloHorarioId", "profesorId", rol
      FROM modulo_horario_profesor
      ORDER BY id
    `;
    
    console.log(`📊 Total de registros: ${allRecords.length}`);
    
    if (allRecords.length > 0) {
      const ids = allRecords.map(r => r.id);
      const maxId = Math.max(...ids);
      console.log(`🔢 Rango de IDs: ${Math.min(...ids)} - ${maxId}`);
      console.log(`🎯 Próximo ID correcto: ${maxId + 1}`);
      
      // 2. Resetear la secuencia
      await prisma.$executeRaw`
        SELECT setval('modulo_horario_profesor_id_seq', ${maxId + 1}, false)
      `;
      
      console.log('✅ Secuencia reseteada correctamente');
      
      // 3. Verificar que se corrigió
      const verifyResult = await prisma.$queryRaw`
        SELECT nextval('modulo_horario_profesor_id_seq') as next_id
      `;
      
      console.log(`🔍 Próximo ID que se generará: ${verifyResult[0].next_id}`);
      
      // 4. Verificar que no hay conflictos
      const conflictResult = await prisma.$queryRaw`
        SELECT id FROM modulo_horario_profesor WHERE id = ${verifyResult[0].next_id}
      `;
      
      if (conflictResult.length === 0) {
        console.log('✅ No hay conflictos - La secuencia está correcta');
      } else {
        console.log('❌ Aún hay conflictos');
      }
    } else {
      console.log('📊 No hay registros, reseteando secuencia a 1');
      await prisma.$executeRaw`
        SELECT setval('modulo_horario_profesor_id_seq', 1, false)
      `;
    }
    
    console.log('\n🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixModuloProfesorSequence();
