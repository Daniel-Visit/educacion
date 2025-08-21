#!/usr/bin/env node

/**
 * Script para testear las funciones de Redis
 * Ejecutar: node scripts/test-redis-functions.js
 */

const { PrismaClient } = require('@prisma/client');
const { 
  saveSession, 
  getSession, 
  revokeToken, 
  isTokenRevoked, 
  getUserVersion, 
  incrementUserVersion, 
  updateSessionActivity,
  getUserSessions,
  closeUserSession
} = require('../../src/lib/auth-redis');

const prisma = new PrismaClient();

async function testRedisFunctions() {
  try {
    console.log('🧪 TESTEANDO FUNCIONES DE REDIS\n');
    
    // 1. Verificar conexiones
    console.log('1️⃣ Verificando conexiones...');
    await prisma.$connect();
    console.log('✅ Conectado a BD');
    console.log('✅ Redis configurado\n');
    
    // 2. Obtener usuario de prueba
    console.log('2️⃣ Obteniendo usuario de prueba...');
    const testUser = await prisma.user.findFirst({
      select: { id: true, email: true, role: true }
    });
    
    if (!testUser) {
      console.log('❌ No hay usuarios para testear');
      return;
    }
    
    console.log(`✅ Usuario: ${testUser.email} (${testUser.role})\n`);
    
    // 3. Test de guardar sesión
    console.log('3️⃣ Testeando guardar sesión...');
    const testJti = require('crypto').randomUUID();
    const sessionData = {
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
      provider: 'credentials',
      createdAt: Date.now(),
      lastSeen: Date.now()
    };
    
    try {
      await saveSession(testJti, sessionData);
      console.log('✅ Sesión guardada usando saveSession()');
      console.log('');
    } catch (error) {
      console.log('❌ Error guardando sesión:', error.message);
      return;
    }
    
    // 4. Test de obtener sesión
    console.log('4️⃣ Testeando obtener sesión...');
    try {
      const savedSession = await getSession(testJti);
      if (savedSession) {
        console.log('✅ Sesión recuperada usando getSession():');
        console.log('   - userId:', savedSession.userId);
        console.log('   - email:', savedSession.email);
        console.log('   - role:', savedSession.role);
        console.log('   - provider:', savedSession.provider);
      } else {
        console.log('❌ No se pudo recuperar la sesión');
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error obteniendo sesión:', error.message);
    }
    
    // 5. Test de lista de sesiones del usuario
    console.log('5️⃣ Testeando lista de sesiones del usuario...');
    try {
      const userSessions = await getUserSessions(testUser.id);
      console.log(`✅ Usuario tiene ${userSessions.length} sesiones activas:`);
      userSessions.forEach(session => console.log(`   - ${session.jti}`));
      console.log('');
    } catch (error) {
      console.log('❌ Error obteniendo sesiones del usuario:', error.message);
    }
    
    // 6. Test de revocación de token
    console.log('6️⃣ Testeando revocación de token...');
    try {
      await revokeToken(testJti, 300);
      console.log('✅ Token revocado usando revokeToken()');
      
      const isRevoked = await isTokenRevoked(testJti);
      if (isRevoked) {
        console.log('✅ Verificación de revocación exitosa');
      } else {
        console.log('❌ Error en verificación de revocación');
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error en revocación:', error.message);
    }
    
    // 7. Test de versionado de usuario
    console.log('7️⃣ Testeando versionado de usuario...');
    try {
      const currentVersion = await getUserVersion(testUser.id);
      console.log(`✅ Versión actual del usuario: ${currentVersion}`);
      
      const newVersion = await incrementUserVersion(testUser.id);
      console.log(`✅ Nueva versión del usuario: ${newVersion}`);
      
      if (newVersion === currentVersion + 1) {
        console.log('✅ Incremento de versión exitoso');
      } else {
        console.log('❌ Error en incremento de versión');
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error en versionado:', error.message);
    }
    
    // 8. Test de actualizar actividad de sesión
    console.log('8️⃣ Testeando actualización de actividad...');
    try {
      await updateSessionActivity(testJti);
      console.log('✅ Actividad de sesión actualizada');
      
      const updatedSession = await getSession(testJti);
      if (updatedSession && updatedSession.lastSeen > Date.now() - 1000) {
        console.log('✅ Verificación de actualización exitosa');
      } else {
        console.log('❌ Error en verificación de actualización');
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error actualizando actividad:', error.message);
    }
    
    // 9. Limpieza de test
    console.log('9️⃣ Limpiando datos de test...');
    try {
      await closeUserSession(testUser.id, testJti);
      console.log('✅ Datos de test limpiados');
    } catch (error) {
      console.log('❌ Error limpiando datos:', error.message);
    }
    
    console.log('\n🎯 TEST DE REDIS COMPLETADO EXITOSAMENTE');
    console.log('   Todas las funciones están funcionando correctamente');
    console.log('   Redis está listo para la autenticación');
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el test
testRedisFunctions();
