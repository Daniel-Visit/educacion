const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== Verificando base de datos ===');
    
    // Verificar tablas
    console.log('\n1. Verificando tablas existentes...');
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log('Tablas encontradas:', tables);
    
    // Verificar imágenes
    console.log('\n2. Verificando imágenes...');
    const imagenes = await prisma.imagen.findMany();
    console.log('Imágenes en la base de datos:', imagenes.length);
    imagenes.forEach(img => console.log(`- ID: ${img.id}, Nombre: ${img.nombre}`));
    
    // Verificar archivos
    console.log('\n3. Verificando archivos...');
    const archivos = await prisma.archivo.findMany();
    console.log('Archivos en la base de datos:', archivos.length);
    archivos.forEach(arch => console.log(`- ID: ${arch.id}, Título: ${arch.titulo}, Tipo: ${arch.tipo}`));
    
    // Verificar relaciones
    console.log('\n4. Verificando relaciones...');
    const relaciones = await prisma.archivoImagen.findMany();
    console.log('Relaciones en la base de datos:', relaciones.length);
    relaciones.forEach(rel => console.log(`- Archivo ID: ${rel.archivoId}, Imagen ID: ${rel.imagenId}`));
    
  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 