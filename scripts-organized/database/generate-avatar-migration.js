const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Generando migración de Prisma para el sistema de avatares...\n');

try {
  // Navegar al directorio del proyecto
  const projectDir = path.join(__dirname, '../../..');
  process.chdir(projectDir);
  
  console.log('📁 Directorio actual:', process.cwd());
  
  // Generar la migración
  console.log('\n🚀 Ejecutando: npx prisma migrate dev --name add-avatar-system');
  execSync('npx prisma migrate dev --name add-avatar-system', { 
    stdio: 'inherit',
    cwd: projectDir
  });
  
  console.log('\n✅ Migración generada exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Revisa el archivo de migración generado en prisma/migrations/');
  console.log('2. Ejecuta: npm run db:seed para poblar las tablas');
  console.log('3. Verifica que las tablas se crearon correctamente');
  
} catch (error) {
  console.error('❌ Error al generar la migración:', error.message);
  console.log('\n💡 Asegúrate de que:');
  console.log('- Estás en el directorio raíz del proyecto');
  console.log('- Prisma está instalado (npm install @prisma/client)');
  console.log('- La base de datos está configurada correctamente');
}
