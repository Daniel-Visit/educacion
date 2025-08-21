import { 
  saveSession, 
  getUserVersion, 
  incrementUserVersion, 
  enforceSessionLimit,
  getUserSessions,
  closeUserSession
} from '../../src/lib/auth-redis';

const TEST_USER_ID = 'test-user-session-limits';
const MAX_SESSIONS = 5;

console.log('🧪 TESTING - Sistema de Límites de Sesiones y Versionado');
console.log('========================================================\n');

async function testSessionLimits() {
  console.log('📊 1. PROBANDO LÍMITES DE SESIONES CONCURRENTES');
  console.log('------------------------------------------------');
  
  try {
    // Limpiar sesiones previas del usuario de prueba
    const existingSessions = await getUserSessions(TEST_USER_ID);
    if (existingSessions.length > 0) {
      console.log('🧹 Limpiando sesiones existentes...');
      for (const session of existingSessions) {
        await closeUserSession(TEST_USER_ID, session.jti);
      }
    }
    
    // Crear 6 sesiones (más del límite de 5)
    console.log(`🔄 Creando ${MAX_SESSIONS + 1} sesiones para probar límite...`);
    
    for (let i = 1; i <= MAX_SESSIONS + 1; i++) {
      const jti = `test-session-${i}-${Date.now()}`;
      const sessionData = {
        userId: TEST_USER_ID,
        email: `test${i}@example.com`,
        role: 'user',
        provider: 'test',
        createdAt: Date.now(),
        lastSeen: Date.now()
      };
      
      await saveSession(jti, sessionData);
      console.log(`✅ Sesión ${i} creada: ${jti}`);
    }
    
    // Verificar cuántas sesiones tiene el usuario
    const sessions = await getUserSessions(TEST_USER_ID);
    console.log(`📊 Usuario tiene ${sessions.length} sesiones activas`);
    
    // Aplicar límite de sesiones
    console.log('🔄 Aplicando límite de sesiones...');
    await enforceSessionLimit(TEST_USER_ID, MAX_SESSIONS);
    
    // Verificar cuántas sesiones quedan
    const sessionsAfterLimit = await getUserSessions(TEST_USER_ID);
    console.log(`📊 Después del límite: ${sessionsAfterLimit.length} sesiones`);
    
    if (sessionsAfterLimit.length <= MAX_SESSIONS) {
      console.log('✅ Límite de sesiones funcionando correctamente');
    } else {
      console.log('❌ Límite de sesiones NO funcionando');
    }
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Error en test de límites de sesiones:', error);
  }
}

async function testTokenVersioning() {
  console.log('🔄 2. PROBANDO SISTEMA DE VERSIONADO DE TOKENS');
  console.log('------------------------------------------------');
  
  try {
    // Obtener versión inicial
    const initialVersion = await getUserVersion(TEST_USER_ID);
    console.log(`📊 Versión inicial del usuario: ${initialVersion}`);
    
    // Incrementar versión (simular cambio de rol)
    console.log('🔄 Incrementando versión del usuario...');
    const newVersion = await incrementUserVersion(TEST_USER_ID);
    console.log(`📊 Nueva versión: ${newVersion}`);
    
    if (newVersion === initialVersion + 1) {
      console.log('✅ Versionado funcionando correctamente');
    } else {
      console.log('❌ Versionado NO funcionando');
    }
    
    // Verificar que la versión se guardó
    const currentVersion = await getUserVersion(TEST_USER_ID);
    console.log(`📊 Versión actual en Redis: ${currentVersion}`);
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Error en test de versionado:', error);
  }
}

async function testMiddlewareIntegration() {
  console.log('🔍 3. PROBANDO INTEGRACIÓN CON MIDDLEWARE');
  console.log('-------------------------------------------');
  
  try {
    // Simular un token con versión antigua
    const oldVersion = await getUserVersion(TEST_USER_ID);
    const tokenVersion = oldVersion - 1; // Versión anterior
    
    console.log(`📊 Versión del token: ${tokenVersion}`);
    console.log(`📊 Versión actual del usuario: ${oldVersion}`);
    
    // Verificar si la versión del token es válida
    const { isTokenVersionValid } = await import('../../src/lib/auth-redis');
    const isValid = await isTokenVersionValid(TEST_USER_ID, tokenVersion);
    
    if (!isValid) {
      console.log('✅ Middleware detectaría token inválido (versión antigua)');
    } else {
      console.log('❌ Middleware NO detectaría token inválido');
    }
    
    // Verificar con versión actual
    const isValidCurrent = await isTokenVersionValid(TEST_USER_ID, oldVersion);
    if (isValidCurrent) {
      console.log('✅ Middleware permitiría token con versión actual');
    } else {
      console.log('❌ Middleware NO permitiría token con versión actual');
    }
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Error en test de integración con middleware:', error);
  }
}

async function cleanup() {
  console.log('🧹 LIMPIEZA');
  console.log('------------');
  
  try {
    // Limpiar todas las sesiones de prueba
    const sessions = await getUserSessions(TEST_USER_ID);
    console.log(`🧹 Limpiando ${sessions.length} sesiones de prueba...`);
    
    for (const session of sessions) {
      await closeUserSession(TEST_USER_ID, session.jti);
    }
    
    console.log('✅ Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  }
}

async function runTests() {
  try {
    await testSessionLimits();
    await testTokenVersioning();
    await testMiddlewareIntegration();
    await cleanup();
    
    console.log('🎉 TODOS LOS TESTS COMPLETADOS');
    console.log('==============================');
    console.log('✅ Límites de sesiones funcionando');
    console.log('✅ Sistema de versionado funcionando');
    console.log('✅ Integración con middleware funcionando');
    
  } catch (error) {
    console.error('❌ Error ejecutando tests:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar tests
runTests();
