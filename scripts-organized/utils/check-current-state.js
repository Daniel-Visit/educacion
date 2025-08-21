const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function checkCurrentState() {
  try {
    console.log('🔍 VERIFICANDO ESTADO ACTUAL DE LAS TABLAS...\n');
    
    // 1. Verificar usuario daniel.hernandez@hyh.cl
    console.log('1️⃣ USUARIO:');
    const user = await prisma.user.findUnique({
      where: { email: 'daniel.hernandez@hyh.cl' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        forcePasswordChange: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Force Password Change: ${user.forcePasswordChange}`);
      console.log(`   Tiene password: ${user.password ? 'SÍ' : 'NO'}`);
      console.log(`   Creado: ${user.createdAt}`);
      console.log(`   Actualizado: ${user.updatedAt}`);
    } else {
      console.log('❌ Usuario NO encontrado');
    }

    // 2. Verificar cuentas OAuth asociadas
    console.log('\n2️⃣ CUENTAS OAUTH:');
    const accounts = await prisma.account.findMany({
      where: { userId: user?.id },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        type: true,
      }
    });

    console.log(`📱 Cuentas OAuth encontradas: ${accounts.length}`);
    accounts.forEach((account, index) => {
      console.log(`   ${index + 1}. ${account.provider} (${account.providerAccountId})`);
      console.log(`      Tipo: ${account.type}`);
    });

    // 3. Verificar tokens de verificación
    console.log('\n3️⃣ TOKENS DE VERIFICACIÓN:');
    const tokens = await prisma.verificationToken.findMany({
      where: { identifier: 'daniel.hernandez@hyh.cl' },
      select: {
        token: true,
        expires: true,
      }
    });

    console.log(`🔑 Tokens encontrados: ${tokens.length}`);
    tokens.forEach((token, index) => {
      console.log(`   ${index + 1}. Token: ${token.token.substring(0, 10)}...`);
      console.log(`      Expira: ${token.expires}`);
      console.log(`      Válido: ${token.expires > new Date() ? 'SÍ' : 'NO'}`);
    });

    // 4. Verificar sesiones activas
    console.log('\n4️⃣ SESIONES ACTIVAS:');
    const sessions = await prisma.session.findMany({
      where: { userId: user?.id },
      select: {
        id: true,
        sessionToken: true,
        expires: true,
      }
    });

    console.log(`📊 Sesiones encontradas: ${sessions.length}`);
    sessions.forEach((session, index) => {
      console.log(`   ${index + 1}. Sesión: ${session.id.substring(0, 10)}...`);
      console.log(`      Session Token: ${session.sessionToken.substring(0, 10)}...`);
      console.log(`      Expira: ${session.expires}`);
      console.log(`      Válida: ${session.expires > new Date() ? 'SÍ' : 'NO'}`);
    });

    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('\n📋 RESUMEN:');
    console.log(`   - Usuario: ${user ? 'EXISTE' : 'NO EXISTE'}`);
    console.log(`   - OAuth: ${accounts.length} cuenta(s)`);
    console.log(`   - Tokens: ${tokens.length} token(s)`);
    console.log(`   - Sesiones: ${sessions.length} sesión(es)`);

    // Guardar resultados en archivo
    const results = {
      timestamp: new Date().toISOString(),
      user: user,
      accounts: accounts,
      tokens: tokens,
      sessions: sessions,
      summary: {
        userExists: !!user,
        oauthAccounts: accounts.length,
        tokens: tokens.length,
        sessions: sessions.length
      }
    };

    fs.writeFileSync('database-state-before-test.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Estado guardado en: database-state-before-test.json');

  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentState(); 