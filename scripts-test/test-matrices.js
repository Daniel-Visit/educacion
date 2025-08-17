const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMatrices() {
  try {
    console.log('Probando obtener matrices...');
    const matrices = await prisma.matrizEspecificacion.findMany();
    console.log('Matrices encontradas:', matrices);

    console.log('Probando crear una matriz...');
    const nuevaMatriz = await prisma.matrizEspecificacion.create({
      data: {
        nombre: 'Matriz de Prueba',
        total_preguntas: 10,
      },
    });
    console.log('Matriz creada:', nuevaMatriz);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMatrices();
