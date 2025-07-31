const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllSequences() {
  try {
    console.log('=== ARREGLANDO SECUENCIAS ===');
    
    // Obtener todas las tablas con secuencias
    const tables = [
      'alumno',
      'asignatura', 
      'nivel',
      'asignatura_nivel',
      'metodologia',
      'oa',
      'matriz_especificacion',
      'matriz_oa',
      'indicador',
      'archivo',
      'imagen',
      'archivo_imagen',
      'profesor',
      'profesor_asignatura',
      'profesor_nivel',
      'horario',
      'modulo_horario',
      'modulo_horario_profesor',
      'planificacion_anual',
      'asignacion_oa',
      'alternativa',
      'evaluacion',
      'pregunta',
      'pregunta_indicador',
      'resultado_evaluacion',
      'resultado_alumno',
      'respuesta_alumno'
    ];
    
    for (const table of tables) {
      try {
        // Verificar si la tabla existe y tiene una secuencia
        const sequenceName = `${table}_id_seq`;
        
        // Obtener el máximo ID de la tabla
        const maxIdResult = await prisma.$queryRaw`
          SELECT COALESCE(MAX(id), 0) as max_id FROM ${table}
        `;
        
        const maxId = maxIdResult[0]?.max_id || 0;
        
        if (maxId > 0) {
          // Resetear la secuencia
          await prisma.$executeRaw`
            SELECT setval('${sequenceName}', ${maxId}, true)
          `;
          console.log(`✓ ${table}: secuencia reseteada a ${maxId}`);
        } else {
          console.log(`- ${table}: sin datos`);
        }
        
      } catch (error) {
        console.log(`✗ ${table}: ${error.message}`);
      }
    }
    
    console.log('=== SECUENCIAS ARREGLADAS ===');
    
  } catch (error) {
    console.error('Error arreglando secuencias:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllSequences(); 