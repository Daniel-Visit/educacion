const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Avatares disponibles con URLs reales de Supabase
const availableAvatars = [
  { name: "Avatar 01", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-01.png", category: "general" },
  { name: "Avatar 02", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-02.png", category: "general" },
  { name: "Avatar 03", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-03.png", category: "general" },
  { name: "Avatar 04", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-04.png", category: "general" },
  { name: "Avatar 05", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-05.png", category: "general" },
  { name: "Avatar 06", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-06.png", category: "general" },
  { name: "Avatar 07", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-07.png", category: "general" },
  { name: "Avatar 08", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-08.png", category: "general" },
  { name: "Avatar 09", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-09.png", category: "general" },
  { name: "Avatar 10", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-10.png", category: "general" },
  { name: "Avatar 11", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-11.png", category: "general" },
  { name: "Avatar 12", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-12.png", category: "general" },
  { name: "Avatar 13", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-13.png", category: "general" },
  { name: "Avatar 14", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-14.png", category: "general" },
  { name: "Avatar 15", imageUrl: "https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/avatares/avatar-15.png", category: "general" }
];

async function seedAvatars() {
  try {
    console.log('👤 Iniciando seed de avatares disponibles...');
    
    // Limpiar tabla existente
    await prisma.availableAvatar.deleteMany({});
    console.log('🧹 Tabla de avatares limpiada');
    
    // Insertar avatares
    const createdAvatars = await prisma.availableAvatar.createMany({
      data: availableAvatars
    });
    
    console.log(`✅ ${createdAvatars.count} avatares creados exitosamente`);
    
    // Mostrar avatares creados
    const allAvatars = await prisma.availableAvatar.findMany({
      orderBy: { category: 'asc' }
    });
    
    console.log('\n👤 Avatares creados:');
    allAvatars.forEach(avatar => {
      console.log(`  ${avatar.name}: ${avatar.category} - ${avatar.imageUrl}`);
    });
    
    console.log('\n💡 NOTA: Actualiza las URLs de imagen con las reales de Supabase');
    
  } catch (error) {
    console.error('❌ Error al crear avatares:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para actualizar URLs de avatares
async function updateAvatarUrls(avatarUpdates) {
  try {
    console.log('🔄 Actualizando URLs de avatares...');
    
    for (const update of avatarUpdates) {
      await prisma.availableAvatar.update({
        where: { id: update.id },
        data: { imageUrl: update.imageUrl }
      });
      console.log(`✅ Avatar ${update.id} actualizado: ${update.imageUrl}`);
    }
    
  } catch (error) {
    console.error('❌ Error al actualizar URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedAvatars();
}

module.exports = { seedAvatars, updateAvatarUrls };
