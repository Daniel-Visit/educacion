const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAlumnosStructure() {
  try {
    console.log('=== ESTRUCTURA DE ALUMNOS ===');
    
    const alumnos = await prisma.alumno.findMany({
      select: {
        id: true,
        rut: true,
        nombre: true,
        apellido: true
      },
      orderBy: { id: 'asc' },
      take: 10
    });
    
    console.log('Primeros 10 alumnos:');
    console.log('ID | RUT | Nombre | Apellido');
    console.log('---|-----|--------|----------');
    
    alumnos.forEach(alumno => {
      console.log(`${alumno.id} | ${alumno.rut} | "${alumno.nombre}" | "${alumno.apellido}"`);
    });
    
    // Verificar si hay nombres largos que podrían contener apellidos
    const alumnosConNombresLargos = alumnos.filter(a => a.nombre.includes(' '));
    console.log(`\nAlumnos con espacios en nombre: ${alumnosConNombresLargos.length}`);
    
    if (alumnosConNombresLargos.length > 0) {
      console.log('Ejemplos:');
      alumnosConNombresLargos.forEach(alumno => {
        console.log(`- "${alumno.nombre}" | "${alumno.apellido}"`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlumnosStructure(); 