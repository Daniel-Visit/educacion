#!/usr/bin/env node

/**
 * Script para testear la autenticación con Redis
 * Ejecutar: node scripts/test-auth-redis.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuthRedis() {
  console.log('🧪 TESTEANDO AUTENTICACIÓN CON REDIS\n');
  
  try {
    // 1. Verificar conexión a BD
    console.log('1️⃣ Verificando conexión a base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión a BD exitosa\n');
    
    // 2. Verificar usuarios existentes
    console.log('2️⃣ Verificando usuarios en BD...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        forcePasswordChange: true,
        password: true
      },
      take: 5
    });
    
    console.log(`✅ Encontrados ${users.length} usuarios:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - forcePasswordChange: ${user.forcePasswordChange}`);
    });
    console.log('');
    
    // 3. Verificar si hay usuarios con role undefined/null
    const usersWithoutRole = users.filter(u => !u.role);
    if (usersWithoutRole.length > 0) {
      console.log('⚠️  Usuarios sin role definido:');
      usersWithoutRole.forEach(u => console.log(`   - ${u.email}`));
      console.log('');
    }
    
    // 4. Verificar estructura de la tabla User
    console.log('3️⃣ Verificando estructura de tabla User...');
    try {
      const userTableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        ORDER BY ordinal_position
      `;
      
      console.log('✅ Estructura de tabla User:');
      userTableInfo.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
      });
      console.log('');
    } catch (error) {
      console.log('❌ Error obteniendo estructura de tabla:', error.message);
    }
    
    // 5. Verificar si Redis está configurado
    console.log('4️⃣ Verificando configuración de Redis...');
    const redisEnvVars = {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '✅ Configurado' : '❌ No configurado',
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Configurado' : '❌ No configurado'
    };
    
    console.log('Variables de entorno Redis:');
    Object.entries(redisEnvVars).forEach(([key, status]) => {
      console.log(`   - ${key}: ${status}`);
    });
    console.log('');
    
    // 6. Test básico de Redis (si está configurado)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log('5️⃣ Probando conexión a Redis...');
      try {
        const { Redis } = require('@upstash/redis');
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        
        // Test básico
        await redis.set('test-auth', 'test-value');
        const testValue = await redis.get('test-auth');
        await redis.del('test-auth');
        
        if (testValue === 'test-value') {
          console.log('✅ Redis funcionando correctamente\n');
        } else {
          console.log('❌ Error en test de Redis\n');
        }
      } catch (error) {
        console.log('❌ Error conectando a Redis:', error.message, '\n');
      }
    }
    
    // 7. Verificar variables de autenticación
    console.log('6️⃣ Verificando variables de autenticación...');
    const authEnvVars = {
      AUTH_SECRET: process.env.AUTH_SECRET ? '✅ Configurado' : '❌ No configurado',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Configurado' : '❌ No configurado',
      AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado',
      AUTH_GOOGLE_CLIENT_SECRET: process.env.AUTH_GOOGLE_CLIENT_SECRET ? '✅ Configurado' : '❌ No configurado'
    };
    
    console.log('Variables de autenticación:');
    Object.entries(authEnvVars).forEach(([key, status]) => {
      console.log(`   - ${key}: ${status}`);
    });
    console.log('');
    
    // 8. Resumen y recomendaciones
    console.log('📋 RESUMEN Y RECOMENDACIONES:\n');
    
    if (usersWithoutRole.length > 0) {
      console.log('⚠️  PROBLEMA: Usuarios sin role definido');
      console.log('   Solución: Actualizar usuarios en BD o verificar schema de Prisma\n');
    }
    
    if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
      console.log('⚠️  PROBLEMA: No hay secret de autenticación');
      console.log('   Solución: Configurar AUTH_SECRET en .env\n');
    }
    
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log('⚠️  PROBLEMA: Redis no configurado');
      console.log('   Solución: Configurar variables de Redis en .env\n');
    }
    
    console.log('✅ Test completado. Revisa los logs arriba para identificar problemas.');
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el test
testAuthRedis().catch(console.error);
