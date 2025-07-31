const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkResultados() {
  try {
    console.log('=== VERIFICANDO RESULTADOS ===');
    
    // 1. Verificar evaluaciones
    const evaluaciones = await prisma.evaluacion.findMany({
      include: {
        matriz: {
          select: { nombre: true }
        },
        resultados: {
          include: {
            resultados: {
              include: {
                alumno: true,
                respuestas: true
              }
            }
          }
        }
      }
    });
    
    console.log(`\nEvaluaciones encontradas: ${evaluaciones.length}`);
    evaluaciones.forEach(eval => {
      console.log(`- Evaluación ${eval.id}: ${eval.matriz.nombre}`);
      console.log(`  Resultados: ${eval.resultados.length}`);
      
      eval.resultados.forEach(resultado => {
        console.log(`    * Resultado ${resultado.id}: ${resultado.nombre}`);
        console.log(`      Alumnos: ${resultado.resultados.length}`);
        
        resultado.resultados.forEach(alumno => {
          console.log(`        - ${alumno.alumno.nombre} ${alumno.alumno.apellido}: ${alumno.nota.toFixed(1)} (${alumno.porcentaje.toFixed(1)}%)`);
        });
      });
    });
    
    // 2. Verificar todos los resultados de evaluación
    const todosResultados = await prisma.resultadoEvaluacion.findMany({
      include: {
        evaluacion: {
          include: {
            matriz: {
              select: { nombre: true }
            }
          }
        },
        resultados: {
          include: {
            alumno: true
          }
        }
      }
    });
    
    console.log(`\nTotal de resultados de evaluación: ${todosResultados.length}`);
    todosResultados.forEach(resultado => {
      console.log(`- ${resultado.nombre} (Evaluación ${resultado.evaluacionId}: ${resultado.evaluacion.matriz.nombre})`);
      console.log(`  Alumnos: ${resultado.resultados.length}`);
    });
    
    // 3. Verificar alumnos con resultados
    const alumnosConResultados = await prisma.alumno.findMany({
      include: {
        resultados: {
          include: {
            resultadoEvaluacion: {
              include: {
                evaluacion: {
                  include: {
                    matriz: {
                      select: { nombre: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    console.log(`\nAlumnos con resultados: ${alumnosConResultados.filter(a => a.resultados.length > 0).length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkResultados(); 