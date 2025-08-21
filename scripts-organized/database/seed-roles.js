const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de roles...');

  // Crear roles iniciales
  const roles = [
    {
      slug: 'admin',
      name: 'Administrador',
      description: 'Acceso completo a la plataforma',
      priority: 100,
      isActive: true
    },
    {
      slug: 'profesor',
      name: 'Profesor',
      description: 'Acceso a funcionalidades de enseñanza',
      priority: 50,
      isActive: true
    },
    {
      slug: 'user',
      name: 'Usuario',
      description: 'Acceso básico a la plataforma',
      priority: 0,
      isActive: true
    }
  ];

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { slug: role.slug }
    });

    if (!existingRole) {
      const createdRole = await prisma.role.create({
        data: role
      });
      console.log(`✅ Rol creado: ${createdRole.name} (${createdRole.slug})`);
    } else {
      console.log(`ℹ️  Rol ya existe: ${existingRole.name} (${existingRole.slug})`);
    }
  }

  console.log('🎯 Seed de roles completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
