const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreArchivosEjemplo() {
  try {
    console.log('=== Restaurando archivos de ejemplo ===');

    const contentPath = path.join(
      __dirname,
      'src/components/tiptap-templates/simple/data/content.json'
    );
    const contentJson = fs.readFileSync(contentPath, 'utf-8');

    // Eliminar archivos previos de ejemplo para evitar duplicados
    await prisma.archivo.deleteMany({
      where: {
        OR: [
          { titulo: 'planificacion ejemplo' },
          { titulo: 'material ejemplo' },
        ],
      },
    });

    // Crear archivo de planificación ejemplo
    await prisma.archivo.create({
      data: {
        titulo: 'planificacion ejemplo',
        tipo: 'planificacion',
        contenido: contentJson,
      },
    });

    // Crear archivo de material ejemplo
    await prisma.archivo.create({
      data: {
        titulo: 'material ejemplo',
        tipo: 'material',
        contenido: contentJson,
      },
    });

    console.log('✅ Archivos de ejemplo restaurados correctamente');
  } catch (error) {
    console.error('Error al restaurar archivos de ejemplo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreArchivosEjemplo();
