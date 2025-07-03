const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCreate() {
  try {
    console.log('Creando matriz de prueba...');
    
    const matriz = await prisma.matrizEspecificacion.create({
      data: {
        nombre: 'Matriz de Prueba desde Script',
        total_preguntas: 15,
        oas: {
          create: [
            {
              oaId: 1,
              indicadores: {
                create: [
                  { descripcion: 'Indicador 1', preguntas: 8 },
                  { descripcion: 'Indicador 2', preguntas: 7 }
                ]
              }
            }
          ]
        }
      },
      include: {
        oas: {
          include: {
            indicadores: true
          }
        }
      }
    });
    
    console.log('Matriz creada exitosamente:', JSON.stringify(matriz, null, 2));
    
    // Listar todas las matrices
    const todas = await prisma.matrizEspecificacion.findMany({
      include: {
        oas: {
          include: {
            indicadores: true
          }
        }
      }
    });
    
    console.log('Todas las matrices:', JSON.stringify(todas, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate(); 