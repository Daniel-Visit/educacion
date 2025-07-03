const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('=== Limpiando duplicados ===');
    
    // Eliminar archivos duplicados (mantener solo los primeros)
    console.log('\n1. Eliminando archivos duplicados...');
    await prisma.archivo.deleteMany({
      where: {
        id: {
          in: [3, 4] // Eliminar los duplicados
        }
      }
    });
    
    // Eliminar imágenes duplicadas
    console.log('\n2. Eliminando imágenes duplicadas...');
    await prisma.imagen.deleteMany({
      where: {
        id: 3 // Eliminar la imagen duplicada
      }
    });
    
    // Eliminar relaciones de archivos eliminados
    console.log('\n3. Limpiando relaciones...');
    await prisma.archivoImagen.deleteMany({
      where: {
        archivoId: {
          in: [3, 4]
        }
      }
    });
    
    console.log('✅ Base de datos limpiada');
    
    // Verificar resultado
    const archivos = await prisma.archivo.findMany();
    const imagenes = await prisma.imagen.findMany();
    const relaciones = await prisma.archivoImagen.findMany();
    
    console.log(`\nArchivos restantes: ${archivos.length}`);
    console.log(`Imágenes restantes: ${imagenes.length}`);
    console.log(`Relaciones restantes: ${relaciones.length}`);
    
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase(); 