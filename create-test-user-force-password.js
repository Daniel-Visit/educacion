const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔍 Creando usuario de prueba con forcePasswordChange: true...\n');

    const testEmail = 'test-force-password@example.com';
    const testPassword = 'test123456';
    const hashedPassword = await bcrypt.hash(testPassword, 12);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (existingUser) {
      console.log('⚠️  Usuario ya existe, actualizando forcePasswordChange a true...');
      
      await prisma.user.update({
        where: { email: testEmail },
        data: { 
          forcePasswordChange: true,
          password: hashedPassword
        }
      });
      
      console.log('✅ Usuario actualizado con forcePasswordChange: true');
    } else {
      console.log('🆕 Creando nuevo usuario...');
      
      const newUser = await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Usuario Test Force Password',
          password: hashedPassword,
          forcePasswordChange: true,
          role: 'USER'
        }
      });
      
      console.log('✅ Usuario creado exitosamente');
      console.log('   ID:', newUser.id);
      console.log('   Email:', newUser.email);
      console.log('   forcePasswordChange:', newUser.forcePasswordChange);
    }

    console.log('\n📋 Credenciales de prueba:');
    console.log('   Email: test-force-password@example.com');
    console.log('   Password: test123456');
    console.log('   forcePasswordChange: true');

    console.log('\n🧪 Para probar:');
    console.log('   1. Ve a /auth/login');
    console.log('   2. Inicia sesión con las credenciales de arriba');
    console.log('   3. Deberías ser redirigido a /auth/change-password');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 