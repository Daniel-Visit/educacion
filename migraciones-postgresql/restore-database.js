#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Restaurando base de datos desde backup...');

// Buscar el backup más reciente
const prismaDir = path.join(__dirname, 'prisma');
const files = fs.readdirSync(prismaDir);
const backupFiles = files.filter(file => file.startsWith('database_complete_backup_'));

if (backupFiles.length === 0) {
  console.error('❌ No se encontraron archivos de backup');
  process.exit(1);
}

// Ordenar por fecha (más reciente primero)
backupFiles.sort().reverse();
const latestBackup = backupFiles[0];
const backupPath = path.join(prismaDir, latestBackup);
const targetPath = path.join(prismaDir, 'dev.db');

console.log(`📁 Backup encontrado: ${latestBackup}`);

// Verificar si el archivo de destino existe
if (fs.existsSync(targetPath)) {
  // Crear backup del archivo actual antes de reemplazar
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const currentBackup = path.join(prismaDir, `dev_backup_before_restore_${timestamp}.db`);
  
  console.log(`💾 Creando backup del archivo actual: ${currentBackup}`);
  fs.copyFileSync(targetPath, currentBackup);
}

// Copiar el backup a dev.db
console.log(`🔄 Copiando ${latestBackup} a dev.db...`);
fs.copyFileSync(backupPath, targetPath);

console.log('✅ Base de datos restaurada exitosamente!');
console.log('📝 Para aplicar los cambios, ejecuta: npx prisma generate');
console.log('🚀 Para iniciar el servidor: npm run dev'); 