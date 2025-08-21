require('dotenv').config({ path: './.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Verificando usuario en PostgreSQL...');
    console.log('Email a buscar: daniel.hernandez@hyh.cl');

    const user = await prisma.users.findUnique({
      where: { email: 'daniel.hernandez@hyh.cl' },
    });

    if (user) {
      console.log('✅ Usuario encontrado:', user);
    } else {
      console.log('❌ Usuario NO encontrado');

      // Listar todos los usuarios para ver qué hay
      const allUsers = await prisma.users.findMany();
      console.log('📋 Todos los usuarios en la BD:', allUsers);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
