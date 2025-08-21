const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Colores suaves y elegantes para avatares (paleta personalizada)
const avatarColors = [
  // Colores cálidos y suaves
  { name: "Crema Suave", hexCode: "#FBEEB9", category: "cálido" },
  { name: "Amarillo Suave", hexCode: "#FDE997", category: "cálido" },
  { name: "Amarillo Limón", hexCode: "#FFEF6B", category: "cálido" },
  { name: "Melocotón", hexCode: "#FEE9C8", category: "cálido" },
  { name: "Coral Suave", hexCode: "#FFC9BA", category: "cálido" },
  { name: "Beige Rosado", hexCode: "#F5BEA5", category: "cálido" },
  
  // Colores verdes y naturales
  { name: "Verde Menta", hexCode: "#B4E3B0", category: "natural" },
  { name: "Verde Salvia", hexCode: "#D2E2CF", category: "natural" },
  { name: "Verde Grisáceo", hexCode: "#D7E0D9", category: "natural" },
  
  // Colores neutros y terrosos
  { name: "Beige Terroso", hexCode: "#BAB4A5", category: "neutro" },
  { name: "Gris Suave", hexCode: "#B8B3B2", category: "neutro" },
  { name: "Gris Azulado", hexCode: "#6F727A", category: "neutro" },
  
  // Colores púrpuras y azules
  { name: "Lavanda", hexCode: "#A999D9", category: "frío" },
  { name: "Púrpura Suave", hexCode: "#B4AFF9", category: "frío" },
  { name: "Gris Azulado Claro", hexCode: "#D1D1E2", category: "frío" },
  { name: "Azul Profesional", hexCode: "#2167BD", category: "frío" },
  { name: "Azul Cielo", hexCode: "#54B8FB", category: "frío" },
  { name: "Azul Polvo", hexCode: "#BBD2E3", category: "frío" }
];

async function seedAvatarColors() {
  try {
    console.log('🌈 Iniciando seed de colores de avatar...');
    
    // Limpiar tabla existente
    await prisma.avatarBackgroundColor.deleteMany({});
    console.log('🧹 Tabla de colores limpiada');
    
    // Insertar colores
    const createdColors = await prisma.avatarBackgroundColor.createMany({
      data: avatarColors
    });
    
    console.log(`✅ ${createdColors.count} colores de avatar creados exitosamente`);
    
    // Mostrar colores creados
    const allColors = await prisma.avatarBackgroundColor.findMany({
      orderBy: { category: 'asc' }
    });
    
    console.log('\n🎨 Colores creados:');
    allColors.forEach(color => {
      console.log(`  ${color.name}: ${color.hexCode} (${color.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error al crear colores de avatar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedAvatarColors();
}

module.exports = { seedAvatarColors };
