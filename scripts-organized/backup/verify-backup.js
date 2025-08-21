const fs = require('fs');
const path = require('path');

// Configuración
const BACKUP_DIR = path.join(__dirname, '../data-exports');

function verifyBackupFiles() {
  console.log('🔍 Verificando archivos de backup...\n');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ No existe el directorio de backups');
    return;
  }
  
  const files = fs.readdirSync(BACKUP_DIR);
  const reports = files.filter(f => f.startsWith('backup_report_'));
  const dataFiles = files.filter(f => !f.startsWith('backup_report_'));
  
  console.log('📊 Reportes de backup encontrados:');
  reports.forEach(report => {
    const date = report.replace('backup_report_', '').replace('.json', '');
    const filePath = path.join(BACKUP_DIR, report);
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${date} (${(stats.size / 1024).toFixed(1)} KB)`);
  });
  
  console.log('\n📁 Archivos de datos encontrados:');
  const tables = [...new Set(dataFiles.map(f => f.split('_')[0]))];
  tables.forEach(table => {
    const tableFiles = dataFiles.filter(f => f.startsWith(`${table}_`));
    const totalSize = tableFiles.reduce((sum, file) => {
      const filePath = path.join(BACKUP_DIR, file);
      return sum + fs.statSync(filePath).size;
    }, 0);
    
    console.log(`  📋 ${table}: ${tableFiles.length} backups (${(totalSize / 1024).toFixed(1)} KB total)`);
  });
  
  console.log(`\n📈 Total de archivos: ${files.length}`);
  console.log(`📊 Total de reportes: ${reports.length}`);
  console.log(`📁 Total de datos: ${dataFiles.length}`);
}

function verifyBackupIntegrity() {
  console.log('\n🔍 Verificando integridad de archivos...\n');
  
  const files = fs.readdirSync(BACKUP_DIR);
  const dataFiles = files.filter(f => !f.startsWith('backup_report_'));
  
  let validFiles = 0;
  let invalidFiles = 0;
  
  dataFiles.forEach(file => {
    try {
      const filePath = path.join(BACKUP_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        console.log(`  ✅ ${file}: ${data.length} registros válidos`);
        validFiles++;
      } else {
        console.log(`  ❌ ${file}: Formato inválido (no es array)`);
        invalidFiles++;
      }
    } catch (error) {
      console.log(`  ❌ ${file}: Error de JSON - ${error.message}`);
      invalidFiles++;
    }
  });
  
  console.log(`\n📊 Resumen de integridad:`);
  console.log(`  ✅ Archivos válidos: ${validFiles}`);
  console.log(`  ❌ Archivos inválidos: ${invalidFiles}`);
}

function main() {
  try {
    verifyBackupFiles();
    verifyBackupIntegrity();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyBackupFiles, verifyBackupIntegrity }; 