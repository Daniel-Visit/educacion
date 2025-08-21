const { seedAvatarColors } = require('./seed-avatar-colors');
const { seedAvatars } = require('./seed-avatars');

async function seedAvatarSystem() {
  try {
    console.log('🚀 Iniciando seed completo del sistema de avatares...\n');
    
    // 1. Seed de colores de fondo
    console.log('='.repeat(50));
    await seedAvatarColors();
    console.log('='.repeat(50));
    
    // 2. Seed de avatares disponibles
    console.log('\n');
    console.log('='.repeat(50));
    await seedAvatars();
    console.log('='.repeat(50));
    
    console.log('\n🎉 Sistema de avatares configurado exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Sube las imágenes PNG a Supabase Storage');
    console.log('2. Actualiza las URLs en la tabla available_avatars');
    console.log('3. Ejecuta la migración de Prisma para crear las tablas');
    console.log('4. Implementa el avatar en el sidebar');
    
  } catch (error) {
    console.error('❌ Error durante el seed del sistema:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedAvatarSystem();
}

module.exports = { seedAvatarSystem };
