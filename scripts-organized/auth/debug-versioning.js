import { redis } from '../../src/lib/redis.js';
import { getUserVersion, incrementUserVersion } from '../../src/lib/auth-redis';

const TEST_USER_ID = 'debug-version-user';

console.log('🔍 DEBUG - Sistema de Versionado');
console.log('================================\n');

async function debugVersioning() {
  try {
    console.log('1️⃣ Verificando estado inicial...');
    
    // Verificar si la clave de versión existe
    const versionExists = await redis.exists(`user:${TEST_USER_ID}:ver`);
    console.log(`📊 Clave de versión existe: ${versionExists ? 'SÍ' : 'NO'}`);
    
    // Obtener versión inicial
    const initialVersion = await getUserVersion(TEST_USER_ID);
    console.log(`📊 Versión inicial: ${initialVersion}`);
    
    // Verificar el valor raw en Redis
    const rawVersion = await redis.get(`user:${TEST_USER_ID}:ver`);
    console.log(`📊 Valor raw en Redis: ${rawVersion}`);
    
    console.log('\n2️⃣ Probando incrementUserVersion...');
    
    // Intentar incrementar
    const newVersion = await incrementUserVersion(TEST_USER_ID);
    console.log(`📊 Nueva versión retornada: ${newVersion}`);
    
    // Verificar el valor después del incremento
    const afterIncrement = await redis.get(`user:${TEST_USER_ID}:ver`);
    console.log(`📊 Valor después del incremento: ${afterIncrement}`);
    
    // Verificar con getUserVersion
    const finalVersion = await getUserVersion(TEST_USER_ID);
    console.log(`📊 Versión final con getUserVersion: ${finalVersion}`);
    
    console.log('\n3️⃣ Probando incremento manual...');
    
    // Probar incremento manual
    const manualIncrement = await redis.incr(`user:${TEST_USER_ID}:ver`);
    console.log(`📊 Incremento manual: ${manualIncrement}`);
    
    // Verificar estado final
    const finalRaw = await redis.get(`user:${TEST_USER_ID}:ver`);
    console.log(`📊 Estado final raw: ${finalRaw}`);
    
    console.log('\n4️⃣ Limpieza...');
    
    // Limpiar
    await redis.del(`user:${TEST_USER_ID}:ver`);
    console.log('✅ Clave de versión eliminada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await redis.quit();
    process.exit(0);
  }
}

debugVersioning();
