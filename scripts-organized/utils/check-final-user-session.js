const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFinalUserSession() {
  try {
    console.log('🔍 Verificando sesiones para final@test.com...\n');

    // Buscar el usuario final@test.com
    const finalUser = await prisma.user.findUnique({
      where: { email: 'final@test.com' },
      select: {
        id: true,
        email: true,
        name: true,
        forcePasswordChange: true,
        sessions: {
          select: {
            id: true,
            sessionToken: true,
            expires: true
          }
        }
      }
    });

    if (!finalUser) {
      console.log('❌ Usuario final@test.com no encontrado');
      return;
    }

    console.log('👤 Usuario final@test.com:');
    console.log(`   ID: ${finalUser.id}`);
    console.log(`   Email: ${finalUser.email}`);
    console.log(`   Name: ${finalUser.name}`);
    console.log(`   forcePasswordChange: ${finalUser.forcePasswordChange}`);
    console.log(`   Sesiones activas: ${finalUser.sessions.length}`);

    if (finalUser.sessions.length > 0) {
      console.log('\n📋 Detalles de sesiones:');
      finalUser.sessions.forEach((session, index) => {
        console.log(`\n${index + 1}. Sesión ID: ${session.id}`);
        console.log(`   Token: ${session.sessionToken.substring(0, 20)}...`);
        console.log(`   Expira: ${session.expires}`);
        console.log(`   ¿Expirada?: ${new Date() > session.expires ? 'SÍ' : 'NO'}`);
      });
    } else {
      console.log('\n❌ No hay sesiones activas para final@test.com');
    }

    // Verificar todas las sesiones recientes
    const recentSessions = await prisma.session.findMany({
      where: {
        expires: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        sessionToken: true,
        expires: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        expires: 'desc'
      },
      take: 5
    });

    console.log(`\n📊 Sesiones recientes (últimas 5): ${recentSessions.length}`);
    recentSessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.user.email} (${session.user.name}) - Expira: ${session.expires}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinalUserSession(); 