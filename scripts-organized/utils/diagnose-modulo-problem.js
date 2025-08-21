const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseModuloProblem() {
  try {
    console.log('🔍 Diagnosticando problema de IDs en modulo_horario...\n');
    
    // 1. Verificar la secuencia actual
    console.log('📊 1. Estado de la secuencia:');
    try {
      const sequenceResult = await prisma.$queryRaw`
        SELECT 
          sequence_name,
          last_value,
          start_value,
          increment_by,
          is_called
        FROM modulo_horario_id_seq
      `;
      console.log('✅ Secuencia encontrada:', sequenceResult[0]);
    } catch (error) {
      console.log('❌ Error al leer secuencia:', error.message);
    }
    
    // 2. Verificar registros existentes
    console.log('\n📋 2. Registros existentes:');
    try {
      const recordsResult = await prisma.$queryRaw`
        SELECT id, "horarioId", dia, "horaInicio", duracion, orden
        FROM modulo_horario
        ORDER BY id DESC
        LIMIT 10
      `;
      console.log(`✅ Encontrados ${recordsResult.length} registros:`);
      recordsResult.forEach(record => {
        console.log(`   ID: ${record.id}, Horario: ${record.horarioId}, Día: ${record.dia}, Hora: ${record.horaInicio}`);
      });
    } catch (error) {
      console.log('❌ Error al leer registros:', error.message);
    }
    
    // 3. Verificar si hay IDs duplicados
    console.log('\n🔍 3. Verificando IDs duplicados:');
    try {
      const duplicatesResult = await prisma.$queryRaw`
        SELECT id, COUNT(*) as count
        FROM modulo_horario
        GROUP BY id
        HAVING COUNT(*) > 1
        ORDER BY id
      `;
      
      if (duplicatesResult.length === 0) {
        console.log('✅ No hay IDs duplicados');
      } else {
        console.log('⚠️  IDs duplicados encontrados:', duplicatesResult);
      }
    } catch (error) {
      console.log('❌ Error al verificar duplicados:', error.message);
    }
    
    // 4. Verificar el próximo ID que se generaría
    console.log('\n🔮 4. Próximo ID que se generaría:');
    try {
      const nextIdResult = await prisma.$queryRaw`
        SELECT nextval('modulo_horario_id_seq') as next_id
      `;
      console.log(`✅ Próximo ID: ${nextIdResult[0].next_id}`);
    } catch (error) {
      console.log('❌ Error al obtener próximo ID:', error.message);
    }
    
    // 5. Verificar si hay conflictos con el próximo ID
    console.log('\n⚠️  5. Verificando conflictos con próximo ID:');
    try {
      const nextIdResult = await prisma.$queryRaw`
        SELECT nextval('modulo_horario_id_seq') as next_id
      `;
      const nextId = nextIdResult[0].next_id;
      
      const conflictResult = await prisma.$queryRaw`
        SELECT id FROM modulo_horario WHERE id = ${nextId}
      `;
      
      if (conflictResult.length > 0) {
        console.log(`❌ CONFLICTO: El ID ${nextId} ya existe en la tabla!`);
      } else {
        console.log(`✅ No hay conflicto con el ID ${nextId}`);
      }
    } catch (error) {
      console.log('❌ Error al verificar conflictos:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar diagnóstico
diagnoseModuloProblem();
