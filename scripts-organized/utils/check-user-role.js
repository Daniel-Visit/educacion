require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRole(email) {
  try {
    console.log('🔍 Verificando rol del usuario:', email);
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        forcePasswordChange: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Rol:', user.role);
    console.log('  - Force Password Change:', user.forcePasswordChange);
    console.log('  - Creado:', user.createdAt);
    console.log('  - Actualizado:', user.updatedAt);

    // Verificar si el rol existe en la tabla roles
    const role = await prisma.role.findUnique({
      where: { slug: user.role },
      select: { id: true, slug: true, name: true, description: true, isActive: true }
    });

    if (role) {
      console.log('✅ Rol válido en tabla roles:');
      console.log('  - ID:', role.id);
      console.log('  - Slug:', role.slug);
      console.log('  - Nombre:', role.name);
      console.log('  - Descripción:', role.description);
      console.log('  - Activo:', role.isActive);
    } else {
      console.log('❌ Rol NO encontrado en tabla roles');
      console.log('  - Rol buscado:', user.role);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener email desde argumentos de línea de comandos
const email = process.argv[2];

if (!email) {
  console.log('❌ Uso: node scripts/check-user-role.js <email>');
  console.log('Ejemplo: node scripts/check-user-role.js daniel.hernandez@hyh.cl');
  process.exit(1);
}

checkUserRole(email);
