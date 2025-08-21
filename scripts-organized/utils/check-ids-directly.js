const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkIdsDirectly() {
  try {
    console.log('🔍 Verificando IDs directamente...\n');
    
    // Verificar todos los registros
    const allRecords = await prisma.$queryRaw`
      SELECT id, "horarioId", dia, "horaInicio"
      FROM modulo_horario
      ORDER BY id
    `;
    
    console.log(`📊 Total de registros: ${allRecords.length}`);
    
    if (allRecords.length > 0) {
      console.log('📋 IDs encontrados:');
      allRecords.forEach(record => {
        console.log(`   ID: ${record.id}, Horario: ${record.horarioId}, Día: ${record.dia}`);
      });
      
      const ids = allRecords.map(r => r.id);
      console.log(`\n🔢 Rango de IDs: ${Math.min(...ids)} - ${Math.max(...ids)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIdsDirectly();
