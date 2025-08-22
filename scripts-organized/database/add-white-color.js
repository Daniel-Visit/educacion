const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addWhiteColor() {
  try {
    console.log('🎨 Agregando color blanco...');
    
    // Verificar si ya existe
    const existing = await prisma.avatarBackgroundColor.findFirst({
      where: { hexCode: '#FFFFFF' }
    });
    
    if (existing) {
      console.log('✅ Color blanco ya existe con ID:', existing.id);
      return existing.id;
    }
    
    // Agregar solo el color blanco (Prisma generará el CUID automáticamente)
    const whiteColor = await prisma.avatarBackgroundColor.create({
      data: {
        name: "Blanco Puro",
        hexCode: "#FFFFFF",
        category: "neutro",
        isActive: true
      }
    });
    
    console.log('✅ Color blanco agregado exitosamente!');
    console.log('🆔 ID generado:', whiteColor.id);
    console.log('🎨 Nombre:', whiteColor.name);
    console.log('🌈 Hex Code:', whiteColor.hexCode);
    console.log('📂 Categoría:', whiteColor.category);
    
    return whiteColor.id;
    
  } catch (error) {
    console.error('❌ Error agregando color blanco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addWhiteColor();
}

module.exports = { addWhiteColor };
