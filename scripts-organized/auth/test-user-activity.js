const { getAllUsersActivity, saveSession } = require('../../src/lib/auth-redis.ts');

async function testUserActivity() {
  console.log('🧪 TESTING - Probando actividad de usuarios en Redis\n');
  
  try {
    // 1. Crear algunas sesiones de prueba
    console.log('📝 TESTING - Creando sesiones de prueba...');
    
    const testSessions = [
      {
        jti: 'test-session-1',
        sessionData: {
          userId: 'user-1',
          email: 'test1@example.com',
          role: 'admin',
          provider: 'credentials',
          createdAt: Date.now() - 3600000, // 1 hora atrás
          lastSeen: Date.now() - 1800000    // 30 minutos atrás
        }
      },
      {
        jti: 'test-session-2',
        sessionData: {
          userId: 'user-2',
          email: 'test2@example.com',
          role: 'profesor',
          provider: 'google',
          createdAt: Date.now() - 7200000, // 2 horas atrás
          lastSeen: Date.now() - 900000     // 15 minutos atrás
        }
      }
    ];
    
    for (const session of testSessions) {
      await saveSession(session.jti, session.sessionData);
      console.log(`✅ TESTING - Sesión creada: ${session.jti}`);
    }
    
    // 2. Obtener actividad de todos los usuarios
    console.log('\n🔍 TESTING - Obteniendo actividad de usuarios...');
    const userActivity = await getAllUsersActivity();
    
    console.log('✅ TESTING - Actividad obtenida:', userActivity);
    
    // 3. Mostrar detalles de cada usuario
    console.log('\n📊 TESTING - Detalles de actividad:');
    userActivity.forEach((activity, index) => {
      const lastSeenDate = new Date(activity.lastSeen);
      console.log(`   Usuario ${index + 1}:`);
      console.log(`     - ID: ${activity.userId}`);
      console.log(`     - Último acceso: ${lastSeenDate.toLocaleString('es-ES')}`);
      console.log(`     - Timestamp: ${activity.lastSeen}`);
    });
    
    console.log('\n🎉 TESTING - Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ TESTING - Error en la prueba:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testUserActivity()
    .then(() => {
      console.log('\n✅ TESTING - Script ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 TESTING - Script falló:', error);
      process.exit(1);
    });
}

module.exports = { testUserActivity };
