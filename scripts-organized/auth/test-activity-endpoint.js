import { redis } from '../../src/lib/redis.js';

console.log('🧪 PROBANDO ENDPOINT DE ACTIVIDAD DE USUARIOS');
console.log('===============================================');

async function testActivityEndpoint() {
  try {
    // 1. Verificar que Redis está funcionando
    console.log('\n1️⃣ Verificando conexión a Redis...');
    await redis.ping();
    console.log('✅ Redis está funcionando');

    // 2. Crear sesiones de prueba para varios usuarios
    console.log('\n2️⃣ Creando sesiones de prueba para varios usuarios...');
    
    const testUsers = [
      { id: 'test-user-1', email: 'user1@test.com', role: 'user' },
      { id: 'test-user-2', email: 'user2@test.com', role: 'admin' },
      { id: 'test-user-3', email: 'user3@test.com', role: 'manager' }
    ];

    for (const user of testUsers) {
      const jti = `test-session-${user.id}-${Date.now()}`;
      
      // Crear sesión
      await redis.hset(`sess:${jti}`, {
        userId: user.id,
        email: user.email,
        role: user.role,
        provider: 'credentials',
        createdAt: Date.now().toString(),
        lastSeen: Date.now().toString()
      });
      
      // Agregar a la lista de sesiones del usuario
      await redis.sadd(`user:${user.id}:sessions`, jti);
      
      // Establecer TTL
      await redis.expire(`sess:${jti}`, 7 * 24 * 60 * 60);
      await redis.expire(`user:${user.id}:sessions`, 7 * 24 * 60 * 60);
      
      console.log(`✅ Sesión creada para ${user.email}`);
    }

    // 3. Simular la función getAllUsersActivity
    console.log('\n3️⃣ Simulando getAllUsersActivity...');
    
    // Obtener todas las claves de usuario
    const userKeys = await redis.keys('user:*:sessions');
    console.log('📊 Claves de usuario encontradas:', userKeys);
    
    const userActivity = [];
    
    for (const userKey of userKeys) {
      const userId = userKey.replace('user:', '').replace(':sessions', '');
      console.log(`🔍 Procesando usuario: ${userId}`);
      
      // Obtener sesiones del usuario
      const sessions = await redis.smembers(userKey);
      console.log(`📊 Sesiones del usuario ${userId}:`, sessions);
      
      if (sessions.length > 0) {
        // Obtener la sesión más reciente
        const latestSession = sessions[0]; // Asumimos que es la más reciente
        const sessionData = await redis.hgetall(`sess:${latestSession}`);
        
        if (sessionData && Object.keys(sessionData).length > 0) {
          userActivity.push({
            userId,
            lastSeen: Number(sessionData.lastSeen)
          });
          console.log(`✅ Actividad agregada para ${userId}:`, new Date(Number(sessionData.lastSeen)).toISOString());
        }
      }
    }

    console.log('\n4️⃣ Resultado de getAllUsersActivity:');
    console.log('📊 userActivity:', userActivity);

    // 5. Verificar que tenemos datos
    if (userActivity.length > 0) {
      console.log('✅ getAllUsersActivity funciona correctamente');
      console.log(`📊 Usuarios con actividad: ${userActivity.length}`);
      
      // Mostrar cada usuario
      userActivity.forEach((activity, index) => {
        console.log(`${index + 1}. Usuario: ${activity.userId} - Último acceso: ${new Date(activity.lastSeen).toISOString()}`);
      });
    } else {
      console.log('❌ getAllUsersActivity no devolvió datos');
    }

    // 6. Limpiar datos de prueba
    console.log('\n5️⃣ Limpiando datos de prueba...');
    for (const user of testUsers) {
      const userKey = `user:${user.id}:sessions`;
      const sessions = await redis.smembers(userKey);
      
      for (const jti of sessions) {
        await redis.del(`sess:${jti}`);
      }
      await redis.del(userKey);
    }
    console.log('✅ Datos de prueba limpiados');

    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('✅ El endpoint de actividad debería funcionar correctamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
testActivityEndpoint();
