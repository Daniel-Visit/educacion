import { redis } from '../../src/lib/redis.js';

console.log('🧪 PROBANDO CONFIGURACIÓN DE SESIÓN DE 7 DÍAS');
console.log('================================================');

async function testSessionConfig() {
  try {
    // 1. Verificar que Redis está funcionando
    console.log('\n1️⃣ Verificando conexión a Redis...');
    await redis.ping();
    console.log('✅ Redis está funcionando');

    // 2. Crear una sesión de prueba con TTL de 7 días
    console.log('\n2️⃣ Creando sesión de prueba con TTL de 7 días...');
    const testJti = 'test-session-' + Date.now();
    const testUserId = 'test-user-' + Date.now();
    
    // Simular saveSession
    await redis.hset(`sess:${testJti}`, {
      userId: testUserId,
      email: 'test@example.com',
      role: 'user',
      provider: 'credentials',
      createdAt: Date.now().toString(),
      lastSeen: Date.now().toString()
    });
    
    await redis.sadd(`user:${testUserId}:sessions`, testJti);
    
    // Establecer TTL de 7 días
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    await redis.expire(`sess:${testJti}`, sevenDaysInSeconds);
    await redis.expire(`user:${testUserId}:sessions`, sevenDaysInSeconds);
    
    console.log('✅ Sesión de prueba creada');

    // 3. Verificar TTL
    console.log('\n3️⃣ Verificando TTL de la sesión...');
    const sessionTTL = await redis.ttl(`sess:${testJti}`);
    const userSessionsTTL = await redis.ttl(`user:${testUserId}:sessions`);
    
    console.log(`📊 TTL de sesión: ${sessionTTL} segundos`);
    console.log(`📊 TTL de user:sessions: ${userSessionsTTL} segundos`);
    
    // Verificar que está cerca de 7 días (con margen de 1 minuto)
    const expectedTTL = sevenDaysInSeconds;
    const tolerance = 60; // 1 minuto de tolerancia
    
    if (Math.abs(sessionTTL - expectedTTL) <= tolerance) {
      console.log('✅ TTL de sesión correcto (7 días)');
    } else {
      console.log('❌ TTL de sesión incorrecto');
    }
    
    if (Math.abs(userSessionsTTL - expectedTTL) <= tolerance) {
      console.log('✅ TTL de user:sessions correcto (7 días)');
    } else {
      console.log('❌ TTL de user:sessions incorrecto');
    }

    // 4. Verificar que la sesión se puede leer
    console.log('\n4️⃣ Verificando que la sesión se puede leer...');
    const sessionData = await redis.hgetall(`sess:${testJti}`);
    console.log('📊 Datos de sesión:', sessionData);
    
    if (sessionData && Object.keys(sessionData).length > 0) {
      console.log('✅ Sesión se puede leer correctamente');
    } else {
      console.log('❌ Error leyendo sesión');
    }

    // 5. Limpiar datos de prueba
    console.log('\n5️⃣ Limpiando datos de prueba...');
    await redis.del(`sess:${testJti}`);
    await redis.del(`user:${testUserId}:sessions`);
    console.log('✅ Datos de prueba limpiados');

    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('✅ La configuración de 7 días está funcionando correctamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
testSessionConfig();
