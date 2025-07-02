const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== Verificando datos en las tablas ===');
    
    const asignaturas = await prisma.asignatura.findMany();
    console.log(`Asignaturas: ${asignaturas.length} registros`);
    
    const niveles = await prisma.nivel.findMany();
    console.log(`Niveles: ${niveles.length} registros`);
    
    const oas = await prisma.oa.findMany();
    console.log(`OAs: ${oas.length} registros`);
    
    if (oas.length > 0) {
      console.log('Primer OA:', oas[0]);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData(); 