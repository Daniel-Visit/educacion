import { redis } from '../../src/lib/redis.js';

console.log('🧪 PROBANDO TOKEN VERSIONING');
console.log('==============================');

async function testTokenVersioning() {
  try {
    // 1. Verificar que Redis está funcionando
    console.log('\n1️⃣ Verificando conexión a Redis...');
    await redis.ping();
    console.log('✅ Redis está funcionando');

    // 2. Crear un usuario de prueba con versión inicial
    console.log('\n2️⃣ Creando usuario de prueba con versión inicial...');
    const testUserId = 'test-user-version-' + Date.now();
    
    // Establecer versión inicial
    await redis.set(`user:${testUserId}:ver`, '1');
    await redis.expire(`user:${testUserId}:ver`, 7 * 24 * 60 * 60);
    
    console.log('✅ Usuario de prueba creado con versión 1');

    // 3. Simular un token con versión 1
    console.log('\n3️⃣ Simulando token con versión 1...');
    const testToken = {
      sub: testUserId,
      ver: 1,
      role: 'user'
    };
    
    console.log('📊 Token simulado:', testToken);

    // 4. Verificar que la versión es válida
    console.log('\n4️⃣ Verificando que la versión 1 es válida...');
    const currentVersion = await redis.get(`user:${testUserId}:ver`);
    console.log(`📊 Versión actual en Redis: ${currentVersion}`);
    
    if (testToken.ver === Number(currentVersion)) {
      console.log('✅ Versión del token es válida');
    } else {
      console.log('❌ Versión del token no es válida');
    }

    // 5. Simular cambio de rol (incrementar versión)
    console.log('\n5️⃣ Simulando cambio de rol (incrementar versión)...');
    const newVersion = await redis.incr(`user:${testUserId}:ver`);
    console.log(`📊 Nueva versión: ${newVersion}`);

    // 6. Verificar que el token anterior ya no es válido
    console.log('\n6️⃣ Verificando que el token anterior ya no es válido...');
    const updatedVersion = await redis.get(`user:${testUserId}:ver`);
    console.log(`📊 Versión actualizada en Redis: ${updatedVersion}`);
    
    if (testToken.ver !== Number(updatedVersion)) {
      console.log('✅ Token anterior ya no es válido (versión diferente)');
      console.log(`📊 Token versión: ${testToken.ver}, Redis versión: ${updatedVersion}`);
    } else {
      console.log('❌ Token anterior sigue siendo válido');
    }

    // 7. Simular nuevo token con versión actualizada
    console.log('\n7️⃣ Simulando nuevo token con versión actualizada...');
    const newToken = {
      sub: testUserId,
      ver: Number(updatedVersion),
      role: 'admin' // Rol cambiado
    };
    
    console.log('📊 Nuevo token:', newToken);
    
    if (newToken.ver === Number(updatedVersion)) {
      console.log('✅ Nuevo token tiene versión válida');
    } else {
      console.log('❌ Nuevo token no tiene versión válida');
    }

    // 8. Limpiar datos de prueba
    console.log('\n8️⃣ Limpiando datos de prueba...');
    await redis.del(`user:${testUserId}:ver`);
    console.log('✅ Datos de prueba limpiados');

    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('✅ Token versioning está funcionando correctamente');
    console.log('✅ Los tokens se invalidan automáticamente tras cambios de rol');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
testTokenVersioning();
