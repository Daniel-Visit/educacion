const { PrismaClient } = require('@prisma/client');
const { redis } = require('../src/lib/redis');
const { 
  revokeToken, 
  isTokenRevoked, 
  updateSessionActivity,
  getSession
} = require('../../src/lib/auth-redis');

const prisma = new PrismaClient();

async function debugRedisIssues() {
  try {
    console.log('🔍 DEBUG DE PROBLEMAS DE REDIS\n');
    
    await prisma.$connect();
    console.log('✅ Conectado a BD');
    
    // Obtener usuario de prueba
    const testUser = await prisma.user.findFirst({
      select: { id: true, email: true, role: true }
    });
    
    if (!testUser) {
      console.log('❌ No hay usuarios para testear');
      return;
    }
    
    console.log(`✅ Usuario: ${testUser.email} (${testUser.role})\n`);
    
    // Crear JTI de prueba
    const testJti = require('crypto').randomUUID();
    console.log(`🔑 JTI de prueba: ${testJti}\n`);
    
    // 1. DEBUG DE REVOCACIÓN
    console.log('1️⃣ DEBUG DE REVOCACIÓN:');
    
    // Verificar estado inicial
    const initialRevoked = await redis.get(`revoked:${testJti}`);
    console.log(`   Estado inicial: ${initialRevoked} (${typeof initialRevoked})`);
    
    // Revocar token
    await revokeToken(testJti, 300);
    console.log('   ✅ Token revocado');
    
    // Verificar estado después de revocar
    const afterRevoke = await redis.get(`revoked:${testJti}`);
    console.log(`   Estado después de revocar: ${afterRevoke} (${typeof afterRevoke})`);
    
    // Usar nuestra función
    const isRevoked = await isTokenRevoked(testJti);
    console.log(`   isTokenRevoked() retorna: ${isRevoked} (${typeof isRevoked})`);
    
    // Comparar directamente
    const directCheck = afterRevoke === '1';
    console.log(`   Verificación directa (afterRevoke === '1'): ${directCheck}`);
    
    console.log('');
    
    // 2. DEBUG DE ACTUALIZACIÓN DE ACTIVIDAD
    console.log('2️⃣ DEBUG DE ACTUALIZACIÓN DE ACTIVIDAD:');
    
    // Crear sesión de prueba
    const sessionData = {
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
      provider: 'credentials',
      createdAt: Date.now(),
      lastSeen: Date.now()
    };
    
    await redis.hset(`sess:${testJti}`, {
      userId: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role,
      provider: sessionData.provider,
      createdAt: sessionData.createdAt.toString(),
      lastSeen: sessionData.lastSeen.toString()
    });
    
    console.log('   ✅ Sesión de prueba creada');
    
    // Obtener timestamp antes de actualizar
    const beforeUpdate = await redis.hget(`sess:${testJti}`, 'lastSeen');
    console.log(`   lastSeen antes: ${beforeUpdate} (${typeof beforeUpdate})`);
    
    // Actualizar actividad
    await updateSessionActivity(testJti);
    console.log('   ✅ Actividad actualizada');
    
    // Obtener timestamp después de actualizar
    const afterUpdate = await redis.hget(`sess:${testJti}`, 'lastSeen');
    console.log(`   lastSeen después: ${afterUpdate} (${typeof afterUpdate})`);
    
    // Usar nuestra función
    const updatedSession = await getSession(testJti);
    console.log(`   getSession().lastSeen: ${updatedSession?.lastSeen} (${typeof updatedSession?.lastSeen})`);
    
    // Verificar si se actualizó
    const wasUpdated = Number(afterUpdate) > Number(beforeUpdate);
    console.log(`   ¿Se actualizó? ${wasUpdated}`);
    
    console.log('');
    
    // 3. LIMPIEZA
    console.log('3️⃣ LIMPIEZA:');
    await redis.del(`revoked:${testJti}`);
    await redis.del(`sess:${testJti}`);
    console.log('   ✅ Datos de prueba limpiados');
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRedisIssues();
