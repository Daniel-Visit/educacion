const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInvitationFlow() {
  console.log('🧪 TESTING - Iniciando prueba del flujo de invitación\n');
  
  try {
    // 1. Verificar que no existe el usuario de prueba
    const testEmail = 'test-invitation@example.com';
    console.log('📧 TESTING - Email de prueba:', testEmail);
    
    // Limpiar datos de prueba anteriores
    console.log('🧹 TESTING - Limpiando datos de prueba anteriores...');
    
    await prisma.verificationToken.deleteMany({
      where: { identifier: testEmail }
    });
    
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });
    
    console.log('✅ TESTING - Datos de prueba limpiados\n');
    
    // 2. Simular invitación - crear usuario con forcePasswordChange: true
    console.log('👤 TESTING - Creando usuario invitado...');
    
    const invitedUser = await prisma.user.create({
      data: {
        email: testEmail,
        role: 'profesor',
        password: null, // Sin contraseña inicial
        forcePasswordChange: true, // Necesita establecer contraseña
      }
    });
    
    console.log('✅ TESTING - Usuario creado:', {
      id: invitedUser.id,
      email: invitedUser.email,
      role: invitedUser.role,
      password: invitedUser.password,
      forcePasswordChange: invitedUser.forcePasswordChange
    });
    
    // 3. Crear token de verificación
    console.log('\n🔑 TESTING - Creando token de verificación...');
    
    const token = require('crypto').randomUUID();
    const expires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 horas
    
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: testEmail,
        token,
        expires,
      }
    });
    
    console.log('✅ TESTING - Token creado:', {
      token: verificationToken.token,
      expires: verificationToken.expires,
      identifier: verificationToken.identifier
    });
    
    // 4. Simular URL de invitación
    const invitationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/set-password?token=${token}`;
    console.log('\n🔗 TESTING - URL de invitación generada:');
    console.log('   ', invitationUrl);
    
    // 5. Verificar estado antes de establecer contraseña
    console.log('\n🔍 TESTING - Estado del usuario antes de establecer contraseña:');
    const userBeforePassword = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    console.log('   - Email:', userBeforePassword.email);
    console.log('   - Role:', userBeforePassword.role);
    console.log('   - Password:', userBeforePassword.password ? '[HASH]' : 'null');
    console.log('   - ForcePasswordChange:', userBeforePassword.forcePasswordChange);
    
    console.log('\n✅ TESTING - Flujo de invitación preparado exitosamente');
    console.log('\n📋 TESTING - Pasos para continuar la prueba:');
    console.log('   1. Ve a la URL de invitación en el navegador');
    console.log('   2. Establece una contraseña');
    console.log('   3. Verifica que puedes hacer login');
    console.log('\n🔗 URL:', invitationUrl);
    
    return {
      success: true,
      userId: invitedUser.id,
      email: testEmail,
      token,
      invitationUrl
    };
    
  } catch (error) {
    console.error('❌ TESTING - Error en prueba de invitación:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testInvitationFlow()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 TESTING - Prueba completada exitosamente');
      } else {
        console.log('\n💥 TESTING - Prueba falló:', result.error);
      }
    })
    .catch(console.error);
}

module.exports = { testInvitationFlow };

