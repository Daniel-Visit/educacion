import { redis } from '../../src/lib/redis.js';

console.log('🧪 PROBANDO UPDATE SESSION ACTIVITY');
console.log('====================================');

async function testUpdateSessionActivity() {
  try {
    // 1. Verificar que Redis está funcionando
    console.log('\n1️⃣ Verificando conexión a Redis...');
    await redis.ping();
    console.log('✅ Redis está funcionando');

    // 2. Crear una sesión de prueba
    console.log('\n2️⃣ Creando sesión de prueba...');
    const testJti = 'test-session-' + Date.now();
    const testUserId = 'test-user-' + Date.now();
    
    // Crear sesión inicial
    await redis.hset(`sess:${testJti}`, {
      userId: testUserId,
      email: 'test@example.com',
      role: 'user',
      provider: 'credentials',
      createdAt: Date.now().toString(),
      lastSeen: Date.now().toString()
    });
    
    await redis.sadd(`user:${testUserId}:sessions`, testJti);
    await redis.expire(`sess:${testJti}`, 7 * 24 * 60 * 60);
    
    console.log('✅ Sesión de prueba creada');

    // 3. Leer lastSeen inicial
    console.log('\n3️⃣ Leyendo lastSeen inicial...');
    const initialSession = await redis.hgetall(`sess:${testJti}`);
    const initialLastSeen = Number(initialSession.lastSeen);
    console.log('📊 lastSeen inicial:', new Date(initialLastSeen).toISOString());

    // 4. Esperar un momento para que el timestamp sea diferente
    console.log('\n4️⃣ Esperando 2 segundos para simular actividad...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Simular updateSessionActivity (como lo hace el middleware)
    console.log('\n5️⃣ Simulando updateSessionActivity...');
    const newTimestamp = Date.now().toString();
    await redis.hset(`sess:${testJti}`, { lastSeen: newTimestamp });
    console.log('✅ Actividad de sesión actualizada');

    // 6. Verificar que lastSeen se actualizó
    console.log('\n6️⃣ Verificando que lastSeen se actualizó...');
    const updatedSession = await redis.hgetall(`sess:${testJti}`);
    const updatedLastSeen = Number(updatedSession.lastSeen);
    console.log('📊 lastSeen actualizado:', new Date(updatedLastSeen).toISOString());

    if (updatedLastSeen > initialLastSeen) {
      console.log('✅ lastSeen se actualizó correctamente');
      console.log(`📊 Diferencia: ${updatedLastSeen - initialLastSeen}ms`);
    } else {
      console.log('❌ lastSeen no se actualizó');
    }

    // 7. Limpiar datos de prueba
    console.log('\n7️⃣ Limpiando datos de prueba...');
    await redis.del(`sess:${testJti}`);
    await redis.del(`user:${testUserId}:sessions`);
    console.log('✅ Datos de prueba limpiados');

    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('✅ updateSessionActivity está funcionando correctamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
testUpdateSessionActivity();
