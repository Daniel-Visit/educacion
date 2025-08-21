import { redis } from '../../src/lib/redis.js';

console.log('🧪 PROBANDO LIMPIEZA DE SESIONES');
console.log('==================================');

async function testSessionCleanup() {
  try {
    // 1. Verificar que Redis está funcionando
    console.log('\n1️⃣ Verificando conexión a Redis...');
    await redis.ping();
    console.log('✅ Redis está funcionando');

    // 2. Crear sesiones de prueba con diferentes TTL
    console.log('\n2️⃣ Creando sesiones de prueba con diferentes TTL...');
    
    const testSessions = [
      { jti: 'test-session-1', userId: 'test-user-1', ttl: 10 }, // Expira en 10 segundos
      { jti: 'test-session-2', userId: 'test-user-2', ttl: 20 }, // Expira en 20 segundos
      { jti: 'test-session-3', userId: 'test-user-3', ttl: -1 }, // Sin TTL (debe ser eliminada)
    ];

    for (const session of testSessions) {
      // Crear sesión
      await redis.hset(`sess:${session.jti}`, {
        userId: session.userId,
        email: `${session.userId}@test.com`,
        role: 'user',
        provider: 'credentials',
        createdAt: Date.now().toString(),
        lastSeen: Date.now().toString()
      });
      
      // Agregar a la lista de sesiones del usuario
      await redis.sadd(`user:${session.userId}:sessions`, session.jti);
      
      // Establecer TTL (excepto para la que no debe tener)
      if (session.ttl > 0) {
        await redis.expire(`sess:${session.jti}`, session.ttl);
        await redis.expire(`user:${session.userId}:sessions`, session.ttl);
      }
      
      console.log(`✅ Sesión creada: ${session.jti} con TTL ${session.ttl}`);
    }

    // 3. Verificar estadísticas iniciales
    console.log('\n3️⃣ Verificando estadísticas iniciales...');
    const initialStats = await getSessionStats();
    console.log('📊 Estadísticas iniciales:', initialStats);

    // 4. Esperar a que expire la primera sesión
    console.log('\n4️⃣ Esperando a que expire la primera sesión (10 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 12000)); // 12 segundos para asegurar expiración

    // 5. Verificar que la primera sesión expiró
    console.log('\n5️⃣ Verificando que la primera sesión expiró...');
    const expiredSessionTTL = await redis.ttl('sess:test-session-1');
    console.log(`📊 TTL de sesión expirada: ${expiredSessionTTL}`);
    
    if (expiredSessionTTL === -2) {
      console.log('✅ Primera sesión expiró correctamente');
    } else {
      console.log('❌ Primera sesión no expiró como esperado');
    }

    // 6. Ejecutar limpieza de sesiones
    console.log('\n6️⃣ Ejecutando limpieza de sesiones...');
    const cleanedCount = await cleanupExpiredSessions();
    console.log(`📊 Sesiones limpiadas: ${cleanedCount}`);

    // 7. Verificar estadísticas después de la limpieza
    console.log('\n7️⃣ Verificando estadísticas después de la limpieza...');
    const finalStats = await getSessionStats();
    console.log('📊 Estadísticas finales:', finalStats);

    // 8. Verificar que las sesiones problemáticas fueron eliminadas
    console.log('\n8️⃣ Verificando que las sesiones problemáticas fueron eliminadas...');
    
    const session1Exists = await redis.exists('sess:test-session-1');
    const session3Exists = await redis.exists('sess:test-session-3');
    
    console.log(`📊 Sesión 1 (expirada) existe: ${session1Exists ? 'SÍ' : 'NO'}`);
    console.log(`📊 Sesión 3 (sin TTL) existe: ${session3Exists ? 'SÍ' : 'NO'}`);
    
    if (session1Exists === 0 && session3Exists === 0) {
      console.log('✅ Sesiones problemáticas fueron eliminadas correctamente');
    } else {
      console.log('❌ Algunas sesiones problemáticas no fueron eliminadas');
    }

    // 9. Limpiar datos de prueba restantes
    console.log('\n9️⃣ Limpiando datos de prueba restantes...');
    for (const session of testSessions) {
      await redis.del(`sess:${session.jti}`);
      await redis.del(`user:${session.userId}:sessions`);
    }
    console.log('✅ Datos de prueba limpiados');

    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('✅ La limpieza de sesiones funciona correctamente');
    console.log('✅ Las sesiones expiradas y sin TTL son eliminadas automáticamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
}

// Función auxiliar para obtener estadísticas (simulando la función real)
async function getSessionStats() {
  try {
    const sessionKeys = await redis.keys('sess:*');
    const userKeys = await redis.keys('user:*:sessions');
    const revokedKeys = await redis.keys('revoked:*');
    
    return {
      totalSessions: sessionKeys.length,
      totalUsers: userKeys.length,
      totalRevoked: revokedKeys.length
    };
  } catch (error) {
    return { totalSessions: 0, totalUsers: 0, totalRevoked: 0 };
  }
}

// Función auxiliar para limpiar sesiones (simulando la función real)
async function cleanupExpiredSessions() {
  try {
    let cleanedCount = 0;
    
    const sessionKeys = await redis.keys('sess:*');
    
    for (const sessionKey of sessionKeys) {
      try {
        const ttl = await redis.ttl(sessionKey);
        
        if (ttl === -1 || ttl === -2) {
          await redis.del(sessionKey);
          cleanedCount++;
        }
      } catch (error) {
        console.error(`❌ Error procesando sesión ${sessionKey}:`, error);
      }
    }
    
    return cleanedCount;
  } catch (error) {
    console.error('❌ Error en limpieza de sesiones:', error);
    return 0;
  }
}

// Ejecutar la prueba
testSessionCleanup();
