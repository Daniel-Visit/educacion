const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentSession() {
  try {
    console.log('🔍 Verificando estado actual de sesiones...\n');

    // Verificar sesiones activas
    const sessions = await prisma.session.findMany({
      select: {
        id: true,
        sessionToken: true,
        userId: true,
        expires: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            forcePasswordChange: true
          }
        }
      }
    });

    console.log(`📊 Sesiones encontradas: ${sessions.length}`);
    
    if (sessions.length > 0) {
      console.log('\n📋 Detalles de sesiones:');
      sessions.forEach((session, index) => {
        console.log(`\n${index + 1}. Sesión ID: ${session.id}`);
        console.log(`   Token: ${session.sessionToken.substring(0, 20)}...`);
        console.log(`   User ID: ${session.userId}`);
        console.log(`   Expira: ${session.expires}`);
        console.log(`   Usuario: ${session.user.email} (${session.user.name})`);
        console.log(`   forcePasswordChange: ${session.user.forcePasswordChange}`);
      });
    } else {
      console.log('❌ No hay sesiones activas en la base de datos');
    }

    // Verificar usuarios con forcePasswordChange = true
    const usersWithForcePassword = await prisma.user.findMany({
      where: {
        forcePasswordChange: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        forcePasswordChange: true
      }
    });

    console.log(`\n🔒 Usuarios con forcePasswordChange = true: ${usersWithForcePassword.length}`);
    
    if (usersWithForcePassword.length > 0) {
      console.log('\n📋 Detalles:');
      usersWithForcePassword.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.name})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentSession(); 