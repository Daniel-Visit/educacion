const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function limpiarTablaOA() {
  try {
    console.log('=== Limpiando tabla OA ===');

    const countBefore = await prisma.oa.count();
    console.log(`📊 OAs antes de limpiar: ${countBefore}`);

    await prisma.oa.deleteMany({});

    const countAfter = await prisma.oa.count();
    console.log(`📊 OAs después de limpiar: ${countAfter}`);

    console.log('✅ Tabla OA limpiada exitosamente');
  } catch (error) {
    console.error('Error al limpiar tabla OA:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarTablaOA();
